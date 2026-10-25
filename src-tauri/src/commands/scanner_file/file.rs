use std::{
    ffi::OsStr,
    fs::{File, Metadata},
    io::{self, Read},
    path::{Component, Path, PathBuf},
};

pub(super) fn absolute_local_path(value: &OsStr) -> Result<PathBuf, ()> {
    let path = PathBuf::from(value);
    let text = path.to_str().ok_or(())?;
    if !path.is_absolute()
        || text.is_empty()
        || text.contains('\0')
        || text.encode_utf16().count() > 32767
        || path
            .components()
            .any(|part| matches!(part, Component::ParentDir | Component::CurDir))
    {
        return Err(());
    }
    #[cfg(windows)]
    if !matches!(path.components().next(), Some(Component::Prefix(prefix)) if matches!(prefix.kind(), std::path::Prefix::Disk(_)))
    {
        return Err(());
    }
    Ok(path)
}

struct Opened {
    file: File,
    _parents: Vec<File>,
}

#[cfg(unix)]
fn open(path: &Path) -> io::Result<Opened> {
    use std::{
        ffi::CString,
        os::{
            fd::{AsRawFd, FromRawFd},
            unix::ffi::OsStrExt,
        },
    };
    // Pin each directory descriptor; no component can redirect a later read through a symlink.
    let mut directory = File::open("/")?;
    let components: Vec<_> = path
        .components()
        .filter_map(|part| {
            if let Component::Normal(name) = part {
                Some(name)
            } else {
                None
            }
        })
        .collect();
    if components.is_empty() {
        return Err(io::ErrorKind::InvalidInput.into());
    }
    for (index, name) in components.iter().enumerate() {
        let name = CString::new(name.as_bytes()).map_err(|_| io::ErrorKind::InvalidInput)?;
        let last = index + 1 == components.len();
        let flags = libc::O_RDONLY
            | libc::O_CLOEXEC
            | libc::O_NOFOLLOW
            | if last {
                libc::O_NONBLOCK
            } else {
                libc::O_DIRECTORY
            };
        // SAFETY: valid C name, live directory fd; returned fd is uniquely owned by File.
        let descriptor = unsafe { libc::openat(directory.as_raw_fd(), name.as_ptr(), flags) };
        if descriptor < 0 {
            return Err(io::Error::last_os_error());
        }
        // SAFETY: successful openat returned a fresh owned fd.
        directory = unsafe { File::from_raw_fd(descriptor) };
    }
    Ok(Opened {
        file: directory,
        _parents: Vec::new(),
    })
}

#[cfg(windows)]
fn open(path: &Path) -> io::Result<Opened> {
    use std::{
        fs::OpenOptions,
        os::windows::fs::{MetadataExt, OpenOptionsExt},
    };
    // OPEN_REPARSE_POINT avoids following the final component. Holding every parent
    // without FILE_SHARE_DELETE prevents ancestor replacement while the file is read.
    const OPEN_REPARSE_POINT: u32 = 0x00200000;
    const BACKUP_SEMANTICS: u32 = 0x02000000;
    const REPARSE_POINT: u32 = 0x400;
    let mut parents = Vec::new();
    let mut prefix = PathBuf::new();
    let count = path.components().count();
    for (index, part) in path.components().enumerate() {
        prefix.push(part);
        if index == 0 {
            continue;
        } // Disk prefix becomes rooted in the next component.
        let last = index + 1 == count;
        let handle = OpenOptions::new()
            .read(true)
            .share_mode(1)
            .custom_flags(OPEN_REPARSE_POINT | if last { 0 } else { BACKUP_SEMANTICS })
            .open(&prefix)?;
        let metadata = handle.metadata()?;
        if metadata.file_attributes() & REPARSE_POINT != 0 || (!last && !metadata.is_dir()) {
            return Err(io::ErrorKind::InvalidInput.into());
        }
        if last {
            return Ok(Opened {
                file: handle,
                _parents: parents,
            });
        }
        parents.push(handle);
    }
    Err(io::ErrorKind::InvalidInput.into())
}

#[cfg(not(any(unix, windows)))]
fn open(_: &Path) -> io::Result<Opened> {
    Err(io::ErrorKind::Unsupported.into())
}

fn same(before: &Metadata, after: &Metadata) -> bool {
    if before.len() != after.len() || before.modified().ok() != after.modified().ok() {
        return false;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;
        if before.dev() != after.dev()
            || before.ino() != after.ino()
            || before.ctime() != after.ctime()
            || before.ctime_nsec() != after.ctime_nsec()
        {
            return false;
        }
    }
    true
}

pub(super) fn read(path: &Path, maximum: usize) -> Result<Vec<u8>, ()> {
    read_with(path, maximum, || {})
}

// A controlled file change between read and validation can be injected by owned-file
// tests. Production always supplies the no-op above; no IPC exposes this boundary.
fn read_with(path: &Path, maximum: usize, after_read: impl FnOnce()) -> Result<Vec<u8>, ()> {
    absolute_local_path(path.as_os_str())?;
    let mut opened = open(path).map_err(|_| ())?;
    let file = &mut opened.file;
    let before = file.metadata().map_err(|_| ())?;
    if !before.is_file() || before.len() > maximum as u64 {
        return Err(());
    }
    let mut bytes = Vec::with_capacity(before.len() as usize);
    (&mut *file)
        .take(maximum as u64 + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| ())?;
    after_read();
    let after = file.metadata().map_err(|_| ())?;
    if bytes.len() > maximum || bytes.len() as u64 != before.len() || !same(&before, &after) {
        return Err(());
    }
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    #[cfg(unix)]
    #[test]
    fn actual_input_changed_after_read_is_refused_before_returning_any_text() {
        use super::*;
        let sandbox = super::super::tests::Sandbox::new();
        let path = sandbox.0.join("changing.txt");
        std::fs::write(&path, b"before").unwrap();
        let result = read_with(&path, 100, || {
            std::fs::write(&path, b"changed during read").unwrap();
        });
        assert!(result.is_err());
        assert_eq!(std::fs::read(&path).unwrap(), b"changed during read");
    }
}
