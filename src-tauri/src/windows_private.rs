//! Private Windows profile parent (ADR-017). No IPC or existing-directory repair.
//!
//! The caller must create no secrets until `create_private_directory` succeeds.
//! `verify_private_directory` is read-only and is intended for subsequent starts.
//! Both require a local fixed volume with persistent ACLs and reject reparse points.
//! Retain the returned guard until the service and every user of its data have stopped.

use std::{
    ffi::{OsStr, c_void},
    io,
    mem::{ManuallyDrop, offset_of, size_of},
    os::windows::{
        ffi::OsStrExt,
        io::{FromRawHandle, OwnedHandle},
    },
    path::{Component, Path, PathBuf, Prefix},
    ptr::{null, null_mut},
};
use windows_sys::Win32::{
    Foundation::{
        CloseHandle, ERROR_INSUFFICIENT_BUFFER, ERROR_SUCCESS, HANDLE, INVALID_HANDLE_VALUE,
        LocalFree,
    },
    Security::{
        ACCESS_ALLOWED_ACE, ACE_HEADER, ACL, ACL_SIZE_INFORMATION, AclSizeInformation,
        Authorization::{
            ConvertSidToStringSidW, ConvertStringSecurityDescriptorToSecurityDescriptorW,
            GetSecurityInfo, SDDL_REVISION_1, SE_FILE_OBJECT,
        },
        CONTAINER_INHERIT_ACE, CreateWellKnownSid, DACL_SECURITY_INFORMATION, EqualSid, GetAce,
        GetAclInformation, GetSecurityDescriptorControl, GetTokenInformation, INHERITED_ACE,
        IsValidAcl, IsValidSid, OBJECT_INHERIT_ACE, OWNER_SECURITY_INFORMATION, PSID,
        SE_DACL_PRESENT, SE_DACL_PROTECTED, SECURITY_ATTRIBUTES, TOKEN_QUERY, TOKEN_USER,
        TokenUser, WinBuiltinAdministratorsSid, WinLocalSystemSid,
    },
    Storage::FileSystem::{
        CreateDirectoryW, CreateFileW, FILE_ALL_ACCESS, FILE_ATTRIBUTE_DIRECTORY,
        FILE_ATTRIBUTE_REPARSE_POINT, FILE_ATTRIBUTE_TAG_INFO, FILE_FLAG_BACKUP_SEMANTICS,
        FILE_FLAG_OPEN_REPARSE_POINT, FILE_LIST_DIRECTORY, FILE_READ_ATTRIBUTES, FILE_SHARE_READ,
        FILE_SHARE_WRITE, FileAttributeTagInfo, GetDriveTypeW, GetFileInformationByHandleEx,
        GetVolumeInformationW, OPEN_EXISTING, READ_CONTROL,
    },
    System::{
        SystemServices::{ACCESS_ALLOWED_ACE_TYPE, FILE_PERSISTENT_ACLS},
        Threading::{GetCurrentProcess, OpenProcessToken},
        WindowsProgramming::DRIVE_FIXED,
    },
};

fn invalid() -> io::Error {
    io::Error::new(io::ErrorKind::PermissionDenied, "unsafe private directory")
}
fn wide(value: &OsStr) -> io::Result<Vec<u16>> {
    let mut result: Vec<u16> = value.encode_wide().collect();
    if result.is_empty() || result.contains(&0) || result.len() >= 32767 {
        return Err(invalid());
    }
    result.push(0);
    Ok(result)
}

struct Handle(HANDLE);
impl Drop for Handle {
    fn drop(&mut self) {
        // SAFETY: this wrapper owns a successful, non-pseudo Win32 handle.
        unsafe { CloseHandle(self.0) };
    }
}

/// Pins the verified directory and every ancestor against deletion/rename.
/// Keep this guard alive from before writing secrets until the owned service,
/// backup and other profile users have stopped. Dropping it closes handles only;
/// it never deletes data or changes permissions. It does not prevent the trusted
/// owner/SYSTEM/administrators from changing an ACL or existing descendants.
/// Verification covers the parent ACL, not the ACLs of pre-existing descendants.
#[derive(Debug)]
#[must_use = "retain this guard while the service or any profile data is in use"]
pub struct PrivateDirectoryGuard {
    _directories: Vec<OwnedHandle>,
}
impl PrivateDirectoryGuard {
    fn new(handles: Vec<Handle>) -> Self {
        Self {
            _directories: handles
                .into_iter()
                .map(|handle| {
                    let handle = ManuallyDrop::new(handle);
                    // SAFETY: each successful directory open is uniquely owned. Transfer
                    // that ownership to OwnedHandle without also calling Handle::drop.
                    unsafe { OwnedHandle::from_raw_handle(handle.0) }
                })
                .collect(),
        }
    }
}
struct LocalAllocation(*mut c_void);
impl Drop for LocalAllocation {
    fn drop(&mut self) {
        // SAFETY: this wrapper owns a non-null allocation returned by a Win32 LocalAlloc API.
        unsafe { LocalFree(self.0) };
    }
}

struct Identity {
    // Vec<usize> provides TOKEN_USER's alignment and keeps the returned SID alive.
    token_user: Vec<usize>,
    system: Vec<u32>,
    administrators: Vec<u32>,
}
impl Identity {
    fn new() -> io::Result<Self> {
        let mut raw = null_mut();
        // SAFETY: GetCurrentProcess is a valid pseudo-handle; raw receives a new handle.
        if unsafe { OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut raw) } == 0 {
            return Err(io::Error::last_os_error());
        }
        let token = Handle(raw);
        let mut length = 0;
        // SAFETY: the null/zero first call asks Windows for the required buffer length.
        if unsafe { GetTokenInformation(token.0, TokenUser, null_mut(), 0, &mut length) } != 0
            || io::Error::last_os_error().raw_os_error() != Some(ERROR_INSUFFICIENT_BUFFER as i32)
            || length < size_of::<TOKEN_USER>() as u32
            || length > 65536
        {
            return Err(invalid());
        }
        let mut token_user = vec![0usize; (length as usize).div_ceil(size_of::<usize>())];
        // SAFETY: the aligned allocation has at least length bytes and token is live.
        if unsafe {
            GetTokenInformation(
                token.0,
                TokenUser,
                token_user.as_mut_ptr().cast(),
                length,
                &mut length,
            )
        } == 0
        {
            return Err(io::Error::last_os_error());
        }
        let system = well_known(WinLocalSystemSid)?;
        let administrators = well_known(WinBuiltinAdministratorsSid)?;
        let identity = Self {
            token_user,
            system,
            administrators,
        };
        if unsafe { IsValidSid(identity.user()) } == 0
            || equal(identity.user(), identity.system())
            || equal(identity.user(), identity.administrators())
        {
            return Err(invalid());
        }
        Ok(identity)
    }
    fn user(&self) -> PSID {
        // SAFETY: successful GetTokenInformation returned a TOKEN_USER in aligned storage.
        unsafe { (*(self.token_user.as_ptr().cast::<TOKEN_USER>())).User.Sid }
    }
    fn system(&self) -> PSID {
        self.system.as_ptr() as PSID
    }
    fn administrators(&self) -> PSID {
        self.administrators.as_ptr() as PSID
    }
    fn descriptor(&self) -> io::Result<LocalAllocation> {
        let mut string = null_mut();
        // SAFETY: user is a valid SID kept alive by self; Windows allocates the result.
        if unsafe { ConvertSidToStringSidW(self.user(), &mut string) } == 0 {
            return Err(io::Error::last_os_error());
        }
        let sid_string = LocalAllocation(string.cast());
        let mut length = 0;
        // Windows owns a NUL-terminated SID string; the bound exceeds the maximum SID length.
        while length < 256 && unsafe { *string.add(length) } != 0 {
            length += 1;
        }
        if length == 256 {
            return Err(invalid());
        }
        // SAFETY: length was bounded by the terminating NUL of the live Windows allocation.
        let sid = String::from_utf16(unsafe { std::slice::from_raw_parts(string, length) })
            .map_err(|_| invalid())?;
        drop(sid_string);
        // Owner is explicit. Protected, inheritable DACL has only current user, SYSTEM and admins.
        let sddl = format!("O:{sid}D:P(A;OICI;FA;;;{sid})(A;OICI;FA;;;SY)(A;OICI;FA;;;BA)");
        let sddl = wide(OsStr::new(&sddl))?;
        let mut descriptor = null_mut();
        // SAFETY: input is NUL-terminated; Windows returns a LocalAlloc security descriptor.
        if unsafe {
            ConvertStringSecurityDescriptorToSecurityDescriptorW(
                sddl.as_ptr(),
                SDDL_REVISION_1,
                &mut descriptor,
                null_mut(),
            )
        } == 0
        {
            return Err(io::Error::last_os_error());
        }
        if descriptor.is_null() {
            return Err(invalid());
        }
        Ok(LocalAllocation(descriptor))
    }
}
fn well_known(kind: i32) -> io::Result<Vec<u32>> {
    // SECURITY_MAX_SID_SIZE is 68 bytes; u32 storage is suitably aligned for SID.
    let mut sid = vec![0u32; 17];
    let mut length = (sid.len() * size_of::<u32>()) as u32;
    // SAFETY: buffer is aligned and has length bytes; well-known SIDs need no domain SID.
    if unsafe { CreateWellKnownSid(kind, null_mut(), sid.as_mut_ptr().cast(), &mut length) } == 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(sid)
}
fn equal(a: PSID, b: PSID) -> bool {
    // SAFETY: callers supply live, valid SIDs from Windows or validated ACL entries.
    unsafe { EqualSid(a, b) != 0 }
}

fn safe_component(value: &OsStr) -> bool {
    let Some(value) = value.to_str() else {
        return false;
    };
    if value.is_empty()
        || value.ends_with([' ', '.'])
        || value
            .chars()
            .any(|c| matches!(c, '\0' | ':' | '<' | '>' | '"' | '|' | '?' | '*'))
    {
        return false;
    }
    let name = value
        .split('.')
        .next()
        .unwrap_or_default()
        .to_ascii_uppercase();
    if matches!(
        name.as_str(),
        "CON" | "PRN" | "AUX" | "NUL" | "CONIN$" | "CONOUT$"
    ) {
        return false;
    }
    for prefix in ["COM", "LPT"] {
        if let Some(suffix) = name.strip_prefix(prefix)
            && matches!(
                suffix,
                "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "¹" | "²" | "³"
            )
        {
            return false;
        }
    }
    true
}

/// Hold each component without FILE_SHARE_DELETE throughout creation/check and guard use.
fn pinned_directories(path: &Path, include_leaf: bool) -> io::Result<Vec<Handle>> {
    let parts: Vec<_> = path.components().collect();
    if parts.len() < 3
        || !matches!(parts[0], Component::Prefix(p) if matches!(p.kind(), Prefix::Disk(_)))
        || !matches!(parts[1], Component::RootDir)
        || parts[2..]
            .iter()
            .any(|part| !matches!(part, Component::Normal(value) if safe_component(value)))
        || path
            .to_str()
            .ok_or_else(invalid)?
            .split(['\\', '/'])
            .any(|part| matches!(part, "." | ".."))
    {
        return Err(invalid());
    }
    let mut prefix = PathBuf::new();
    prefix.push(parts[0]);
    prefix.push(parts[1]);
    let root = wide(prefix.as_os_str())?;
    let mut flags = 0;
    // SAFETY: root is an absolute drive root, and all optional outputs are null except flags.
    if unsafe { GetDriveTypeW(root.as_ptr()) } != DRIVE_FIXED
        || unsafe {
            GetVolumeInformationW(
                root.as_ptr(),
                null_mut(),
                0,
                null_mut(),
                null_mut(),
                &mut flags,
                null_mut(),
                0,
            )
        } == 0
        || flags & FILE_PERSISTENT_ACLS == 0
    {
        return Err(invalid());
    }
    let mut handles = Vec::new();
    let count = if include_leaf {
        parts.len()
    } else {
        parts.len() - 1
    };
    for (index, part) in parts.iter().enumerate().take(count).skip(1) {
        if index > 1 {
            prefix.push(part);
        }
        let name = wide(prefix.as_os_str())?;
        // Attribute/security-only opens do not reserve delete sharing. Directory
        // read access makes the no-FILE_SHARE_DELETE pin effective on Windows.
        let rights = FILE_LIST_DIRECTORY
            | FILE_READ_ATTRIBUTES
            | if include_leaf && index + 1 == count {
                READ_CONTROL
            } else {
                0
            };
        // SAFETY: name is NUL-terminated. No share-delete is granted, and the handle is owned.
        let raw = unsafe {
            CreateFileW(
                name.as_ptr(),
                rights,
                FILE_SHARE_READ | FILE_SHARE_WRITE,
                null(),
                OPEN_EXISTING,
                FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS,
                null_mut(),
            )
        };
        if raw == INVALID_HANDLE_VALUE {
            return Err(io::Error::last_os_error());
        }
        let handle = Handle(raw);
        let mut info = FILE_ATTRIBUTE_TAG_INFO::default();
        // SAFETY: info has the exact layout and size required for FileAttributeTagInfo.
        if unsafe {
            GetFileInformationByHandleEx(
                handle.0,
                FileAttributeTagInfo,
                (&mut info as *mut FILE_ATTRIBUTE_TAG_INFO).cast(),
                size_of::<FILE_ATTRIBUTE_TAG_INFO>() as u32,
            )
        } == 0
        {
            return Err(io::Error::last_os_error());
        }
        if info.FileAttributes & FILE_ATTRIBUTE_REPARSE_POINT != 0
            || info.FileAttributes & FILE_ATTRIBUTE_DIRECTORY == 0
        {
            return Err(invalid());
        }
        handles.push(handle);
    }
    Ok(handles)
}

fn verify_handle(handle: HANDLE, identity: &Identity) -> io::Result<()> {
    let mut owner = null_mut();
    let mut dacl: *mut ACL = null_mut();
    let mut descriptor = null_mut();
    // SAFETY: handle is a live directory opened with READ_CONTROL; outputs are valid pointers.
    let result = unsafe {
        GetSecurityInfo(
            handle,
            SE_FILE_OBJECT,
            OWNER_SECURITY_INFORMATION | DACL_SECURITY_INFORMATION,
            &mut owner,
            null_mut(),
            &mut dacl,
            null_mut(),
            &mut descriptor,
        )
    };
    if result != ERROR_SUCCESS {
        return Err(io::Error::from_raw_os_error(result as i32));
    }
    if descriptor.is_null() {
        return Err(invalid());
    }
    let descriptor = LocalAllocation(descriptor);
    if owner.is_null()
        || dacl.is_null()
        || unsafe { IsValidSid(owner) } == 0
        || unsafe { IsValidAcl(dacl) } == 0
        || !equal(owner, identity.user())
    {
        return Err(invalid());
    }
    let mut control = 0;
    let mut revision = 0;
    // SAFETY: descriptor is a live security descriptor returned by GetSecurityInfo.
    if unsafe { GetSecurityDescriptorControl(descriptor.0, &mut control, &mut revision) } == 0
        || control & (SE_DACL_PROTECTED | SE_DACL_PRESENT) != SE_DACL_PROTECTED | SE_DACL_PRESENT
    {
        return Err(invalid());
    }
    let mut info = ACL_SIZE_INFORMATION::default();
    // SAFETY: dacl belongs to the live descriptor; info is the requested output structure.
    if unsafe {
        GetAclInformation(
            dacl,
            (&mut info as *mut ACL_SIZE_INFORMATION).cast(),
            size_of::<ACL_SIZE_INFORMATION>() as u32,
            AclSizeInformation,
        )
    } == 0
        || info.AceCount != 3
    {
        return Err(invalid());
    }
    let start = dacl as usize;
    let end = start
        .checked_add(info.AclBytesInUse as usize)
        .ok_or_else(invalid)?;
    let expected = [
        identity.user(),
        identity.system(),
        identity.administrators(),
    ];
    let mut seen = [false; 3];
    for index in 0..info.AceCount {
        let mut raw = null_mut();
        // SAFETY: index is within the ACL count and raw receives a pointer into the live ACL.
        if unsafe { GetAce(dacl, index, &mut raw) } == 0 || raw.is_null() {
            return Err(invalid());
        }
        let address = raw as usize;
        if address < start + size_of::<ACL>()
            || address
                .checked_add(size_of::<ACE_HEADER>())
                .is_none_or(|next| next > end)
        {
            return Err(invalid());
        }
        // SAFETY: GetAce supplies an aligned ACE_HEADER within a valid kernel descriptor.
        let header = unsafe { &*(raw.cast::<ACE_HEADER>()) };
        if header.AceType != ACCESS_ALLOWED_ACE_TYPE as u8
            || u32::from(header.AceFlags) != OBJECT_INHERIT_ACE | CONTAINER_INHERIT_ACE
            || u32::from(header.AceFlags) & INHERITED_ACE != 0
            || usize::from(header.AceSize) < offset_of!(ACCESS_ALLOWED_ACE, SidStart) + 8
            || address
                .checked_add(usize::from(header.AceSize))
                .is_none_or(|next| next > end)
        {
            return Err(invalid());
        }
        // SAFETY: the checked header identifies an ACCESS_ALLOWED_ACE with enough bytes.
        let ace = unsafe { &*(raw.cast::<ACCESS_ALLOWED_ACE>()) };
        if ace.Mask != FILE_ALL_ACCESS {
            return Err(invalid());
        }
        let sid = (&ace.SidStart as *const u32) as PSID;
        // SID byte 1 is the subauthority count. Ensure the whole SID stays inside this ACE.
        let subauthorities = unsafe { *sid.cast::<u8>().add(1) } as usize;
        if offset_of!(ACCESS_ALLOWED_ACE, SidStart) + 8 + subauthorities * 4
            > usize::from(ace.Header.AceSize)
            || unsafe { IsValidSid(sid) } == 0
        {
            return Err(invalid());
        }
        let Some(matched) = expected.iter().position(|expected| equal(sid, *expected)) else {
            return Err(invalid());
        };
        if seen[matched] {
            return Err(invalid());
        }
        seen[matched] = true;
    }
    if seen != [true; 3] {
        return Err(invalid());
    }
    Ok(())
}

/// Create one fresh private directory atomically. Existing paths are never changed.
/// An empty directory may remain on failure; callers must not write secrets to it.
pub fn create_private_directory(path: &Path) -> io::Result<PrivateDirectoryGuard> {
    let identity = Identity::new()?;
    let descriptor = identity.descriptor()?;
    let _parents = pinned_directories(path, false)?;
    let name = wide(path.as_os_str())?;
    let attributes = SECURITY_ATTRIBUTES {
        nLength: size_of::<SECURITY_ATTRIBUTES>() as u32,
        lpSecurityDescriptor: descriptor.0,
        bInheritHandle: 0,
    };
    // SAFETY: name and descriptor remain live throughout this atomic create; existing paths fail.
    if unsafe { CreateDirectoryW(name.as_ptr(), &attributes) } == 0 {
        return Err(io::Error::last_os_error());
    }
    verify_private_directory(path)
}

/// Verify an existing protected parent without changing it or its ancestors.
pub fn verify_private_directory(path: &Path) -> io::Result<PrivateDirectoryGuard> {
    let identity = Identity::new()?;
    let handles = pinned_directories(path, true)?;
    verify_handle(handles.last().ok_or_else(invalid)?.0, &identity)?;
    Ok(PrivateDirectoryGuard::new(handles))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        fs,
        sync::atomic::{AtomicU64, Ordering},
        time::{SystemTime, UNIX_EPOCH},
    };
    static NEXT: AtomicU64 = AtomicU64::new(0);

    struct Sandbox(PathBuf, Option<PrivateDirectoryGuard>);
    impl Sandbox {
        fn new() -> Self {
            let name = format!(
                "gestao-private-acl-{}-{}-{}",
                std::process::id(),
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos(),
                NEXT.fetch_add(1, Ordering::Relaxed)
            );
            let path = std::env::temp_dir().join(name);
            let guard = create_private_directory(&path).unwrap();
            Self(path, Some(guard))
        }
    }
    impl Drop for Sandbox {
        fn drop(&mut self) {
            drop(self.1.take());
            fs::remove_dir_all(&self.0).unwrap();
        }
    }

    fn inherited_access(path: &Path, expected_flags: u32) {
        let name = wide(path.as_os_str()).unwrap();
        // SAFETY: this is an owned synthetic file/directory; open its reparse point itself.
        let raw = unsafe {
            CreateFileW(
                name.as_ptr(),
                READ_CONTROL | FILE_READ_ATTRIBUTES,
                FILE_SHARE_READ | FILE_SHARE_WRITE,
                null(),
                OPEN_EXISTING,
                FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS,
                null_mut(),
            )
        };
        assert_ne!(raw, INVALID_HANDLE_VALUE);
        let handle = Handle(raw);
        let identity = Identity::new().unwrap();
        let mut owner = null_mut();
        let mut acl: *mut ACL = null_mut();
        let mut descriptor = null_mut();
        // SAFETY: live owned handle, output pointers are initialized, freed after assertions.
        assert_eq!(
            unsafe {
                GetSecurityInfo(
                    handle.0,
                    SE_FILE_OBJECT,
                    OWNER_SECURITY_INFORMATION | DACL_SECURITY_INFORMATION,
                    &mut owner,
                    null_mut(),
                    &mut acl,
                    null_mut(),
                    &mut descriptor,
                )
            },
            ERROR_SUCCESS
        );
        let _allocation = LocalAllocation(descriptor);
        assert!(!acl.is_null());
        let mut size = ACL_SIZE_INFORMATION::default();
        // SAFETY: ACL comes from the live descriptor and size is a valid output buffer.
        assert_ne!(
            unsafe {
                GetAclInformation(
                    acl,
                    (&mut size as *mut ACL_SIZE_INFORMATION).cast(),
                    size_of::<ACL_SIZE_INFORMATION>() as u32,
                    AclSizeInformation,
                )
            },
            0
        );
        assert_eq!(size.AceCount, 3);
        let expected = [
            identity.user(),
            identity.system(),
            identity.administrators(),
        ];
        let mut seen = [false; 3];
        for index in 0..size.AceCount {
            let mut raw = null_mut();
            // SAFETY: GetAce returns an entry inside the live ACL.
            assert_ne!(unsafe { GetAce(acl, index, &mut raw) }, 0);
            let ace = unsafe { &*raw.cast::<ACCESS_ALLOWED_ACE>() };
            assert_eq!(ace.Header.AceType, ACCESS_ALLOWED_ACE_TYPE as u8);
            assert_eq!(u32::from(ace.Header.AceFlags), expected_flags);
            assert_eq!(ace.Mask, FILE_ALL_ACCESS);
            let sid = (&ace.SidStart as *const u32) as PSID;
            let matched = expected
                .iter()
                .position(|value| equal(sid, *value))
                .expect("unexpected inherited SID");
            assert!(!seen[matched]);
            seen[matched] = true;
        }
        assert_eq!(seen, [true; 3]);
    }

    #[test]
    fn creates_and_verifies_protected_parent_with_inherited_file_and_directory_acl() {
        let sandbox = Sandbox::new();
        let _verified = verify_private_directory(&sandbox.0).unwrap();
        let file = sandbox.0.join("synthetic-secret.txt");
        fs::write(&file, b"synthetic").unwrap();
        let child = sandbox.0.join("child");
        fs::create_dir(&child).unwrap();
        inherited_access(&file, INHERITED_ACE);
        inherited_access(
            &child,
            INHERITED_ACE | OBJECT_INHERIT_ACE | CONTAINER_INHERIT_ACE,
        );
        assert_eq!(fs::read(file).unwrap(), b"synthetic");
    }

    #[test]
    fn rejects_existing_unprotected_and_never_changes_existing_content() {
        let sandbox = Sandbox::new();
        let existing = sandbox.0.join("existing");
        fs::create_dir(&existing).unwrap();
        let sentinel = existing.join("sentinel");
        fs::write(&sentinel, b"preserve").unwrap();
        assert!(verify_private_directory(&existing).is_err());
        assert_eq!(
            create_private_directory(&existing).unwrap_err().kind(),
            io::ErrorKind::AlreadyExists
        );
        assert_eq!(fs::read(&sentinel).unwrap(), b"preserve");
        assert!(verify_private_directory(&existing).is_err());
        let _verified = verify_private_directory(&sandbox.0).unwrap();
    }

    #[test]
    fn refuses_a_tampered_null_dacl_without_changing_existing_data_or_other_directories() {
        use windows_sys::Win32::{
            Security::{Authorization::SetSecurityInfo, PROTECTED_DACL_SECURITY_INFORMATION},
            Storage::FileSystem::WRITE_DAC,
        };
        let sandbox = Sandbox::new();
        let unsafe_dir = sandbox.0.join("tampered");
        let _unsafe_guard = create_private_directory(&unsafe_dir).unwrap();
        let other = sandbox.0.join("unaffected");
        let _other_guard = create_private_directory(&other).unwrap();
        let sentinel = unsafe_dir.join("synthetic");
        fs::write(&sentinel, b"keep").unwrap();
        // SetSecurityInfo propagates parent ACL changes to unprotected children.
        // Isolate this existing file's ACL so the fixture corrupts only its parent.
        let sentinel_name = wide(sentinel.as_os_str()).unwrap();
        // SAFETY: open only the owned synthetic file itself for ACL fixture preparation.
        let raw = unsafe {
            CreateFileW(
                sentinel_name.as_ptr(),
                READ_CONTROL | WRITE_DAC,
                FILE_SHARE_READ | FILE_SHARE_WRITE,
                null(),
                OPEN_EXISTING,
                FILE_FLAG_OPEN_REPARSE_POINT,
                null_mut(),
            )
        };
        assert_ne!(raw, INVALID_HANDLE_VALUE);
        let sentinel_handle = Handle(raw);
        let mut sentinel_acl: *mut ACL = null_mut();
        let mut sentinel_descriptor = null_mut();
        // SAFETY: the live synthetic file handle permits reading/writing its DACL.
        assert_eq!(
            unsafe {
                GetSecurityInfo(
                    sentinel_handle.0,
                    SE_FILE_OBJECT,
                    DACL_SECURITY_INFORMATION,
                    null_mut(),
                    null_mut(),
                    &mut sentinel_acl,
                    null_mut(),
                    &mut sentinel_descriptor,
                )
            },
            ERROR_SUCCESS
        );
        let _sentinel_descriptor = LocalAllocation(sentinel_descriptor);
        assert!(!sentinel_acl.is_null());
        // SAFETY: copy the existing DACL while its descriptor remains live; protect
        // this owned synthetic child from the deliberately corrupted parent below.
        assert_eq!(
            unsafe {
                SetSecurityInfo(
                    sentinel_handle.0,
                    SE_FILE_OBJECT,
                    DACL_SECURITY_INFORMATION | PROTECTED_DACL_SECURITY_INFORMATION,
                    null_mut(),
                    null_mut(),
                    sentinel_acl,
                    null(),
                )
            },
            ERROR_SUCCESS
        );
        drop(sentinel_handle);
        let name = wide(unsafe_dir.as_os_str()).unwrap();
        // SAFETY: only this freshly created synthetic child is opened for a deliberately unsafe test ACL.
        let raw = unsafe {
            CreateFileW(
                name.as_ptr(),
                READ_CONTROL | WRITE_DAC,
                FILE_SHARE_READ | FILE_SHARE_WRITE,
                null(),
                OPEN_EXISTING,
                FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS,
                null_mut(),
            )
        };
        assert_ne!(raw, INVALID_HANDLE_VALUE);
        let handle = Handle(raw);
        // SAFETY: a null DACL is deliberately assigned only to the owned synthetic child.
        assert_eq!(
            unsafe {
                SetSecurityInfo(
                    handle.0,
                    SE_FILE_OBJECT,
                    DACL_SECURITY_INFORMATION | PROTECTED_DACL_SECURITY_INFORMATION,
                    null_mut(),
                    null_mut(),
                    null(),
                    null(),
                )
            },
            ERROR_SUCCESS
        );
        drop(handle);
        assert!(verify_private_directory(&unsafe_dir).is_err());
        assert!(create_private_directory(&unsafe_dir).is_err());
        assert_eq!(fs::read(&sentinel).unwrap(), b"keep");
        assert!(verify_private_directory(&unsafe_dir).is_err());
        let _parent_verified = verify_private_directory(&sandbox.0).unwrap();
        let _other_verified = verify_private_directory(&other).unwrap();
    }

    #[test]
    fn returned_create_and_verify_guards_pin_leaf_and_ancestors_until_dropped() {
        let mut sandbox = Sandbox::new();
        let ancestor = sandbox.0.join("ancestor");
        fs::create_dir(&ancestor).unwrap();
        let leaf = ancestor.join("profile");
        let guard = create_private_directory(&leaf).unwrap();
        // Only the returned leaf guard now protects the whole ancestor chain.
        drop(sandbox.1.take());
        let moved_leaf = ancestor.join("moved-profile");
        let moved_ancestor = sandbox.0.join("moved-ancestor");
        assert_eq!(
            fs::rename(&leaf, &moved_leaf).unwrap_err().raw_os_error(),
            Some(32)
        );
        assert_eq!(
            fs::rename(&ancestor, &moved_ancestor)
                .unwrap_err()
                .raw_os_error(),
            Some(32)
        );
        let sentinel = leaf.join("synthetic");
        fs::write(&sentinel, b"preserve").unwrap();
        drop(guard);
        fs::rename(&leaf, &moved_leaf).unwrap();
        fs::rename(&ancestor, &moved_ancestor).unwrap();
        let relocated = moved_ancestor.join("moved-profile");
        let guard = verify_private_directory(&relocated).unwrap();
        let final_leaf = moved_ancestor.join("final-profile");
        assert_eq!(
            fs::rename(&relocated, &final_leaf)
                .unwrap_err()
                .raw_os_error(),
            Some(32)
        );
        assert_eq!(
            fs::rename(&moved_ancestor, &ancestor)
                .unwrap_err()
                .raw_os_error(),
            Some(32)
        );
        drop(guard);
        fs::rename(&relocated, &final_leaf).unwrap();
        fs::rename(&moved_ancestor, &ancestor).unwrap();
        assert_eq!(
            fs::read(ancestor.join("final-profile/synthetic")).unwrap(),
            b"preserve"
        );
    }

    #[test]
    fn rejects_relative_parent_traversal_and_missing_ancestors_without_creating_anything() {
        let sandbox = Sandbox::new();
        assert!(create_private_directory(Path::new("relative")).is_err());
        let escaped = sandbox.0.join("..").join("never-created");
        assert!(create_private_directory(&escaped).is_err());
        let missing = sandbox.0.join("missing").join("child");
        assert!(create_private_directory(&missing).is_err());
        assert!(!sandbox.0.join("missing").exists());
        assert!(verify_private_directory(&missing).is_err());
        for name in ["unsafe.", "unsafe ", "unsafe:stream", "CON.txt", "LPT¹"] {
            assert!(
                create_private_directory(&sandbox.0.join(name)).is_err(),
                "accepted unsafe Windows name"
            );
        }
        assert!(create_private_directory(&sandbox.0.join(".").join("child")).is_err());
    }

    #[test]
    fn refuses_a_real_junction_at_an_ancestor_or_target() {
        use windows_sys::Win32::{
            Foundation::GENERIC_WRITE,
            System::{
                IO::DeviceIoControl, Ioctl::FSCTL_SET_REPARSE_POINT,
                SystemServices::IO_REPARSE_TAG_MOUNT_POINT,
            },
        };
        let sandbox = Sandbox::new();
        let target = sandbox.0.join("target");
        fs::create_dir(&target).unwrap();
        let link = sandbox.0.join("junction");
        fs::create_dir(&link).unwrap();
        let wide_link = wide(link.as_os_str()).unwrap();
        // SAFETY: this opens only the newly created, empty synthetic directory itself.
        let raw = unsafe {
            CreateFileW(
                wide_link.as_ptr(),
                GENERIC_WRITE,
                0,
                null(),
                OPEN_EXISTING,
                FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS,
                null_mut(),
            )
        };
        assert_ne!(raw, INVALID_HANDLE_VALUE);
        let handle = Handle(raw);
        let native_target = format!("\\??\\{}", target.display());
        let substitute: Vec<u16> = OsStr::new(&native_target).encode_wide().collect();
        let print_name: Vec<u16> = target.as_os_str().encode_wide().collect();
        let substitute_len = u16::try_from(substitute.len() * 2).unwrap();
        let print_len = u16::try_from(print_name.len() * 2).unwrap();
        let data_len = 8 + usize::from(substitute_len) + 2 + usize::from(print_len) + 2;
        let mut buffer = Vec::with_capacity(8 + data_len);
        buffer.extend_from_slice(&IO_REPARSE_TAG_MOUNT_POINT.to_le_bytes());
        buffer.extend_from_slice(&(data_len as u16).to_le_bytes());
        buffer.extend_from_slice(&0u16.to_le_bytes());
        buffer.extend_from_slice(&0u16.to_le_bytes());
        buffer.extend_from_slice(&substitute_len.to_le_bytes());
        buffer.extend_from_slice(&(substitute_len + 2).to_le_bytes());
        buffer.extend_from_slice(&print_len.to_le_bytes());
        for unit in substitute
            .into_iter()
            .chain([0])
            .chain(print_name)
            .chain([0])
        {
            buffer.extend_from_slice(&unit.to_le_bytes());
        }
        let mut returned = 0;
        // SAFETY: buffer is a bounded, complete mount-point reparse buffer for the owned directory.
        assert_ne!(
            unsafe {
                DeviceIoControl(
                    handle.0,
                    FSCTL_SET_REPARSE_POINT,
                    buffer.as_ptr().cast(),
                    buffer.len() as u32,
                    null_mut(),
                    0,
                    &mut returned,
                    null_mut(),
                )
            },
            0,
            "junction creation: {}",
            io::Error::last_os_error()
        );
        drop(handle);
        assert!(verify_private_directory(&link).is_err());
        assert!(create_private_directory(&link.join("private")).is_err());
        assert!(!target.join("private").exists());
        fs::remove_dir(&link).unwrap();
    }
}
