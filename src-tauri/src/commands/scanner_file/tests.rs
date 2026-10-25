use super::*;
use std::{fs, sync::atomic::AtomicU64};

static SEQUENCE: AtomicU64 = AtomicU64::new(0);
pub(super) struct Sandbox(pub(super) PathBuf);
impl Sandbox {
    pub(super) fn new() -> Self {
        let path = std::env::temp_dir().join(format!(
            "gestao-scanner-{}-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos(),
            SEQUENCE.fetch_add(1, Ordering::Relaxed)
        ));
        fs::create_dir(&path).unwrap();
        Self(fs::canonicalize(path).unwrap())
    }
    fn request(&self) -> ScannerFileRequest {
        ScannerFileRequest {
            terminal_code: "T01".into(),
            source_folder: "C:\\Synthetic scanner d'água".into(),
            source_filename: "scan.txt".into(),
        }
    }
    fn grant(&self, encoding: &str) -> serde_json::Value {
        serde_json::json!({ "terminalCode":"T01", "sourceFolder":self.request().source_folder,
            "sourceFilename":"scan.txt", "localFile":self.0.join("input.txt"), "encoding":encoding })
    }
    fn configure(&self, value: serde_json::Value) -> ScannerFiles {
        let path = self.0.join("grants.json");
        fs::write(&path, serde_json::to_vec(&value).unwrap()).unwrap();
        ScannerFiles(Ok(Some(path)))
    }
    fn reader(&self, encoding: &str) -> ScannerFiles {
        self.configure(serde_json::json!({"version":1,"terminals":[self.grant(encoding)]}))
    }
}
impl Drop for Sandbox {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.0).unwrap();
    }
}

#[test]
fn exact_granted_identity_reads_owned_file_repeatedly_without_consuming_or_changing_bytes() {
    let sandbox = Sandbox::new();
    let original = "Água  2.25\r\nunknown 1\r\n\r\nretained";
    fs::write(sandbox.0.join("input.txt"), original).unwrap();
    let reader = sandbox.reader("utf-8");
    for _ in 0..2 {
        assert_eq!(reader.read(&sandbox.request()).unwrap().text, original);
    }
    assert_eq!(
        fs::read(sandbox.0.join("input.txt")).unwrap(),
        original.as_bytes()
    );
    let mut request = sandbox.request();
    request.source_folder.push(' ');
    assert_eq!(
        reader.read(&request).unwrap_err(),
        "scanner_file_unavailable"
    );
    request = sandbox.request();
    request.source_filename = "../input.txt".into();
    assert_eq!(
        reader.read(&request).unwrap_err(),
        "scanner_file_unavailable"
    );
    request = sandbox.request();
    request.terminal_code = "t01".into();
    assert_eq!(
        reader.read(&request).unwrap_err(),
        "scanner_file_unavailable"
    );
}

#[test]
fn explicit_encodings_retain_codepoints_and_bom_without_fallback_or_replacement() {
    use decoder::{Encoding::*, decode};
    assert_eq!(
        decode("Água €😀\r\n".as_bytes(), Utf8).unwrap(),
        "Água €😀\r\n"
    );
    assert_eq!(
        decode(&[0xef, 0xbb, 0xbf, b'A'], Utf8).unwrap(),
        "\u{feff}A"
    );
    assert!(decode(&[0xc3, b'A'], Utf8).is_err());
    let bytes: Vec<u8> = "Água €😀\r\n"
        .encode_utf16()
        .flat_map(u16::to_le_bytes)
        .collect();
    assert_eq!(decode(&bytes, Utf16Le).unwrap(), "Água €😀\r\n");
    assert_eq!(
        decode(&[0xff, 0xfe, b'A', 0], Utf16Le).unwrap(),
        "\u{feff}A"
    );
    for malformed in [
        &[0x41][..],
        &[0x00, 0xd8][..],
        &[0x00, 0xdc][..],
        &[0x00, 0xd8, 0x41, 0x00][..],
    ] {
        assert!(decode(malformed, Utf16Le).is_err());
    }
    assert_eq!(
        decode(&[0xc1, b'g', b'u', b'a', b' ', 0x80, 0x92], Windows1252).unwrap(),
        "Água €’"
    );
    assert_eq!(decode(&[0xc3, 0xa9], Windows1252).unwrap(), "Ã©"); // Same bytes, explicit different decoder.
    for undefined in [0x81, 0x8d, 0x8f, 0x90, 0x9d] {
        assert!(decode(&[undefined], Windows1252).is_err());
    }
}

#[test]
fn configuration_is_native_only_strict_bounded_and_refuses_ambiguous_or_unsupported_grants() {
    let sandbox = Sandbox::new();
    fs::write(sandbox.0.join("input.txt"), b"123").unwrap();
    assert_eq!(
        ScannerFiles(Ok(None)).read(&sandbox.request()).unwrap_err(),
        "scanner_file_unavailable"
    );
    assert_eq!(
        ScannerFiles(Err(())).read(&sandbox.request()).unwrap_err(),
        "scanner_file_configuration"
    );
    let grant = sandbox.grant("utf-8");
    for value in [
        serde_json::json!({"version":2,"terminals":[grant.clone()]}),
        serde_json::json!({"version":1,"terminals":[grant.clone(),grant.clone()]}),
        serde_json::json!({"version":1,"terminals":[sandbox.grant("auto")]}),
        serde_json::json!({"version":1,"terminals":[grant.clone()],"root":"/"}),
    ] {
        assert_eq!(
            sandbox
                .configure(value)
                .read(&sandbox.request())
                .unwrap_err(),
            "scanner_file_configuration"
        );
    }
    let mut invalid = grant.clone();
    invalid["localFile"] = "relative.txt".into();
    assert_eq!(
        sandbox
            .configure(serde_json::json!({"version":1,"terminals":[invalid]}))
            .read(&sandbox.request())
            .unwrap_err(),
        "scanner_file_configuration"
    );
    let mut missing_encoding = grant;
    missing_encoding.as_object_mut().unwrap().remove("encoding");
    assert_eq!(
        sandbox
            .configure(serde_json::json!({"version":1,"terminals":[missing_encoding]}))
            .read(&sandbox.request())
            .unwrap_err(),
        "scanner_file_configuration"
    );
    let reader = sandbox.reader("utf-8");
    fs::write(
        sandbox.0.join("grants.json"),
        vec![b' '; MAX_CONFIGURATION_BYTES + 1],
    )
    .unwrap();
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_configuration"
    );
    let mut request = sandbox.request();
    request.source_folder = "x".repeat(MAX_IDENTITY_UNITS + 1);
    assert_eq!(
        reader.read(&request).unwrap_err(),
        "invalid_scanner_file_request"
    );
    for extra in ["localFile", "path", "encoding", "consume"] {
        let mut value =
            serde_json::json!({"terminalCode":"T01","sourceFolder":"","sourceFilename":"scan.txt"});
        value[extra] = true.into();
        assert!(serde_json::from_value::<ScannerFileRequest>(value).is_err());
    }
}

#[test]
fn actual_missing_directory_oversized_and_malformed_inputs_fail_with_fixed_path_free_codes() {
    let sandbox = Sandbox::new();
    let reader = sandbox.reader("utf-8");
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_read_failed"
    );
    fs::create_dir(sandbox.0.join("input.txt")).unwrap();
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_read_failed"
    );
    fs::remove_dir(sandbox.0.join("input.txt")).unwrap();
    fs::write(sandbox.0.join("input.txt"), [0xff]).unwrap();
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_encoding"
    );
    fs::write(sandbox.0.join("input.txt"), vec![b'A'; MAX_SCANNER_BYTES]).unwrap();
    assert_eq!(
        reader.read(&sandbox.request()).unwrap().text.len(),
        MAX_SCANNER_BYTES
    );
    fs::write(
        sandbox.0.join("input.txt"),
        vec![b'A'; MAX_SCANNER_BYTES + 1],
    )
    .unwrap();
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_read_failed"
    );
    assert_eq!(
        fs::metadata(sandbox.0.join("input.txt")).unwrap().len(),
        MAX_SCANNER_BYTES as u64 + 1
    );
}

#[cfg(unix)]
#[test]
fn actual_symlinks_in_file_ancestor_and_configuration_are_never_followed_and_fifo_does_not_block() {
    use std::{
        ffi::CString,
        os::unix::{ffi::OsStrExt, fs::symlink},
    };
    let sandbox = Sandbox::new();
    let target = sandbox.0.join("target.txt");
    fs::write(&target, b"private synthetic").unwrap();
    let reader = sandbox.reader("utf-8");
    symlink(&target, sandbox.0.join("input.txt")).unwrap();
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_read_failed"
    );
    fs::remove_file(sandbox.0.join("input.txt")).unwrap();
    let fifo = CString::new(sandbox.0.join("input.txt").as_os_str().as_bytes()).unwrap();
    // SAFETY: fresh owned synthetic pathname, valid C string, no external file touched.
    assert_eq!(unsafe { libc::mkfifo(fifo.as_ptr(), 0o600) }, 0);
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_read_failed"
    );
    fs::create_dir(sandbox.0.join("real")).unwrap();
    symlink(sandbox.0.join("real"), sandbox.0.join("alias")).unwrap();
    fs::write(sandbox.0.join("real/data.txt"), b"owned").unwrap();
    assert!(file::read(&sandbox.0.join("alias/data.txt"), 100).is_err());
    let config = sandbox.0.join("grants.json");
    fs::rename(&config, sandbox.0.join("real.json")).unwrap();
    symlink(sandbox.0.join("real.json"), &config).unwrap();
    assert_eq!(
        reader.read(&sandbox.request()).unwrap_err(),
        "scanner_file_configuration"
    );
    assert_eq!(fs::read(target).unwrap(), b"private synthetic");
}

#[test]
fn native_boundary_and_single_reader_guard_refuse_without_grant_expansion() {
    let guard = ReadGuard::acquire().unwrap();
    assert!(ReadGuard::acquire().is_err());
    drop(guard);
    assert!(ReadGuard::acquire().is_ok());
    let sandbox = Sandbox::new();
    for bad in ["", "bad\0terminal"] {
        let mut request = sandbox.request();
        request.terminal_code = bad.into();
        assert!(validate(&request).is_err());
    }
    assert!(file::absolute_local_path("relative.txt".as_ref()).is_err());
    assert!(file::absolute_local_path(sandbox.0.join("../outside").as_os_str()).is_err());
}
