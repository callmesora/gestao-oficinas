use super::unique_name;
use std::{
    fs::{self, File, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
    sync::atomic::{AtomicBool, Ordering},
    time::{Duration, SystemTime},
};

const MAX_FILES: usize = 128;
const MAX_BYTES: u64 = 256 * 1024 * 1024;
const MAX_AGE: Duration = Duration::from_secs(7 * 24 * 60 * 60);

fn owned_name(name: &str) -> bool {
    let Some(value) = name
        .strip_prefix("report-")
        .and_then(|value| value.strip_suffix(".pdf"))
    else {
        return false;
    };
    value.len() == 49
        && value.as_bytes()[32] == b'-'
        && value[..32]
            .bytes()
            .chain(value[33..].bytes())
            .all(|value| value.is_ascii_hexdigit())
}

fn directory(path: &Path) -> Result<File, String> {
    fs::create_dir_all(path.parent().ok_or("report_cache_failed")?)
        .map_err(|_| "report_cache_failed")?;
    let mut builder = fs::DirBuilder::new();
    #[cfg(unix)]
    {
        use std::os::unix::fs::DirBuilderExt;
        builder.mode(0o700);
    }
    if let Err(error) = builder.create(path)
        && error.kind() != std::io::ErrorKind::AlreadyExists
    {
        return Err("report_cache_failed".into());
    }
    let metadata = fs::symlink_metadata(path).map_err(|_| "report_cache_failed")?;
    if !metadata.is_dir() || metadata.file_type().is_symlink() {
        return Err("report_cache_failed".into());
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if metadata.permissions().mode() & 0o077 != 0 {
            return Err("report_cache_failed".into());
        }
    }
    let lock_path = path.join(".output-lock");
    if let Ok(metadata) = fs::symlink_metadata(&lock_path)
        && (!metadata.is_file() || metadata.file_type().is_symlink())
    {
        return Err("report_cache_failed".into());
    }
    let mut options = OpenOptions::new();
    options.read(true).write(true).create(true).truncate(false);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let lock = options.open(lock_path).map_err(|_| "report_cache_failed")?;
    lock.try_lock().map_err(|_| "report_cache_busy")?;
    Ok(lock)
}

fn reserve(path: &Path, incoming: usize, now: SystemTime, cleanup: bool) -> Result<(), String> {
    let mut count = 0usize;
    let mut size = 0u64;
    for entry in fs::read_dir(path).map_err(|_| "report_cache_failed")? {
        let entry = entry.map_err(|_| "report_cache_failed")?;
        if !entry.file_name().to_str().is_some_and(owned_name) {
            continue;
        }
        let metadata = fs::symlink_metadata(entry.path()).map_err(|_| "report_cache_failed")?;
        if !metadata.is_file() || metadata.file_type().is_symlink() {
            continue;
        }
        if cleanup
            && metadata
                .modified()
                .ok()
                .and_then(|modified| now.duration_since(modified).ok())
                .is_some_and(|age| age >= MAX_AGE)
        {
            fs::remove_file(entry.path()).map_err(|_| "report_cache_failed")?;
        } else {
            count += 1;
            size = size
                .checked_add(metadata.len())
                .ok_or("report_cache_full")?;
        }
    }
    if count >= MAX_FILES
        || size
            .checked_add(incoming as u64)
            .ok_or("report_cache_full")?
            > MAX_BYTES
    {
        return Err("report_cache_full".into());
    }
    Ok(())
}

/// One locked reservation/write; no recent file is removed to make room for a new job.
pub(super) fn create(
    root: &Path,
    bytes: &[u8],
    alive: &AtomicBool,
    cleanup: bool,
) -> Result<PathBuf, String> {
    if !alive.load(Ordering::Acquire) {
        return Err("report_owner_closed".into());
    }
    let _lock = directory(root)?;
    reserve(root, bytes.len(), SystemTime::now(), cleanup)?;
    if !alive.load(Ordering::Acquire) {
        return Err("report_owner_closed".into());
    }
    let path = root.join(unique_name("report-", ".pdf"));
    let mut options = OpenOptions::new();
    options.create_new(true).write(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options.open(&path).map_err(|_| "report_cache_failed")?;
    let write = file.write_all(bytes).and_then(|_| file.sync_all());
    drop(file);
    if write.is_err() || !alive.load(Ordering::Acquire) {
        let _ = fs::remove_file(path);
        return Err(if write.is_err() {
            "report_cache_failed".into()
        } else {
            "report_owner_closed".into()
        });
    }
    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn owns_only_fixed_names_and_private_exact_bytes_under_cross_instance_lock() {
        let root = std::env::temp_dir().join(unique_name("gestao-report-cache-", ""));
        let path = create(&root, b"exact report bytes", &AtomicBool::new(true), true).unwrap();
        assert_eq!(fs::read(&path).unwrap(), b"exact report bytes");
        assert!(owned_name(path.file_name().unwrap().to_str().unwrap()));
        assert!(!owned_name("report-elsewhere.pdf"));
        assert!(!owned_name("../other.pdf"));
        let lock = directory(&root).unwrap();
        assert_eq!(
            create(&root, b"second", &AtomicBool::new(true), false),
            Err("report_cache_busy".into())
        );
        drop(lock);
        assert_eq!(
            create(&root, b"third", &AtomicBool::new(false), false),
            Err("report_owner_closed".into())
        );
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn age_cleanup_preserves_recent_jobs_and_unowned_files_and_budgets_refuse_without_eviction() {
        let root = std::env::temp_dir().join(unique_name("gestao-report-cache-", ""));
        let old = create(&root, b"old", &AtomicBool::new(true), false).unwrap();
        let now = SystemTime::now();
        File::open(&old)
            .unwrap()
            .set_times(fs::FileTimes::new().set_modified(now - MAX_AGE - Duration::from_secs(60)))
            .unwrap();
        let recent = create(&root, b"recent", &AtomicBool::new(true), false).unwrap();
        let unowned = root.join("unrelated.pdf");
        fs::write(&unowned, b"keep").unwrap();
        let _lock = directory(&root).unwrap();
        reserve(&root, 1, now, true).unwrap();
        assert!(!old.exists());
        assert_eq!(fs::read(&recent).unwrap(), b"recent");
        assert!(unowned.exists());
        assert_eq!(
            reserve(&root, MAX_BYTES as usize, now, true),
            Err("report_cache_full".into())
        );
        assert!(recent.exists());
        for _ in 1..MAX_FILES {
            fs::write(root.join(unique_name("report-", ".pdf")), b"x").unwrap();
        }
        assert_eq!(
            reserve(&root, 0, now, false),
            Err("report_cache_full".into())
        );
        drop(_lock);
        fs::remove_dir_all(root).unwrap();
    }
    #[cfg(unix)]
    #[test]
    fn cache_does_not_follow_directory_or_file_symlinks() {
        use std::os::unix::fs::symlink;
        let base = std::env::temp_dir().join(unique_name("gestao-report-cache-", ""));
        fs::create_dir(&base).unwrap();
        let target = base.join("target");
        fs::create_dir(&target).unwrap();
        let root = base.join("linked");
        symlink(&target, &root).unwrap();
        assert_eq!(
            create(&root, b"x", &AtomicBool::new(true), true),
            Err("report_cache_failed".into())
        );
        let actual = base.join("actual");
        let _lock = directory(&actual).unwrap();
        let link = actual.join(unique_name("report-", ".pdf"));
        symlink(base.join("unowned"), &link).unwrap();
        reserve(&actual, 1, SystemTime::now() + MAX_AGE, true).unwrap();
        assert!(fs::symlink_metadata(&link).is_ok());
        drop(_lock);
        fs::remove_dir_all(base).unwrap();
    }
}
