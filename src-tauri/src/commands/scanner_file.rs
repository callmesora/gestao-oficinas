use crate::contracts::{ScannerFileRequest, ScannerFileResult};
use serde::Deserialize;
use std::{
    path::PathBuf,
    sync::atomic::{AtomicBool, Ordering},
};

mod decoder;
mod file;

pub const READ_TERMINAL_SCANNER_FILE_COMMAND: &str = "read_terminal_scanner_file";
pub const MAX_SCANNER_BYTES: usize = 4 * 1024 * 1024;
const MAX_CONFIGURATION_BYTES: usize = 64 * 1024;
const MAX_IDENTITY_UNITS: usize = 32767;

// Native deployment configuration only. No webview command creates or changes grants.
pub struct ScannerFiles(Result<Option<PathBuf>, ()>);
impl ScannerFiles {
    pub fn from_environment() -> Self {
        Self(match std::env::var_os("GESTAO_SCANNER_FILES_CONFIG") {
            None => Ok(None),
            Some(path) => file::absolute_local_path(&path).map(Some).map_err(|_| ()),
        })
    }

    fn read(&self, request: &ScannerFileRequest) -> Result<ScannerFileResult, String> {
        validate(request)?;
        let path = self
            .0
            .as_ref()
            .map_err(|_| "scanner_file_configuration")?
            .as_ref()
            .ok_or("scanner_file_unavailable")?;
        let bytes =
            file::read(path, MAX_CONFIGURATION_BYTES).map_err(|_| "scanner_file_configuration")?;
        let configuration: Configuration =
            serde_json::from_slice(&bytes).map_err(|_| "scanner_file_configuration")?;
        if configuration.version != 1 || configuration.terminals.len() > 128 {
            return Err("scanner_file_configuration".into());
        }
        let mut codes = std::collections::HashSet::new();
        for grant in &configuration.terminals {
            validate(&grant.identity()).map_err(|_| "scanner_file_configuration")?;
            file::absolute_local_path(grant.local_file.as_ref())
                .map_err(|_| "scanner_file_configuration")?;
            if !codes.insert(&grant.terminal_code) {
                return Err("scanner_file_configuration".into());
            }
        }
        let grant = configuration
            .terminals
            .iter()
            .find(|grant| {
                grant.terminal_code == request.terminal_code
                    && grant.source_folder == request.source_folder
                    && grant.source_filename == request.source_filename
            })
            .ok_or("scanner_file_unavailable")?;
        // WIN_Leitor_cod_barras412–427: read only. No move/delete/consume or path inference.
        let bytes = file::read(&PathBuf::from(&grant.local_file), MAX_SCANNER_BYTES)
            .map_err(|_| "scanner_file_read_failed")?;
        let text = decoder::decode(&bytes, grant.encoding).map_err(|_| "scanner_file_encoding")?;
        Ok(ScannerFileResult { text })
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Configuration {
    version: u8,
    terminals: Vec<Grant>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Grant {
    terminal_code: String,
    source_folder: String,
    source_filename: String,
    local_file: String,
    encoding: decoder::Encoding,
}
impl Grant {
    fn identity(&self) -> ScannerFileRequest {
        ScannerFileRequest {
            terminal_code: self.terminal_code.clone(),
            source_folder: self.source_folder.clone(),
            source_filename: self.source_filename.clone(),
        }
    }
}
fn validate(request: &ScannerFileRequest) -> Result<(), String> {
    if request.terminal_code.is_empty()
        || request.source_filename.is_empty()
        || [
            &request.terminal_code,
            &request.source_folder,
            &request.source_filename,
        ]
        .iter()
        .any(|value| value.contains('\0') || value.encode_utf16().count() > MAX_IDENTITY_UNITS)
    {
        return Err("invalid_scanner_file_request".into());
    }
    Ok(())
}

static READING: AtomicBool = AtomicBool::new(false);
struct ReadGuard;
impl ReadGuard {
    fn acquire() -> Result<Self, String> {
        READING
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .map(|_| Self)
            .map_err(|_| "scanner_file_busy".into())
    }
}
impl Drop for ReadGuard {
    fn drop(&mut self) {
        READING.store(false, Ordering::Release);
    }
}

struct Owner<R: tauri::Runtime> {
    window: tauri::WebviewWindow<R>,
    alive: std::sync::Arc<AtomicBool>,
    listener: tauri::EventId,
}
impl<R: tauri::Runtime> Owner<R> {
    fn new(window: tauri::WebviewWindow<R>) -> Self {
        use tauri::Listener;
        let alive = std::sync::Arc::new(AtomicBool::new(true));
        let flag = alive.clone();
        let listener = window.listen("tauri://destroyed", move |_| {
            flag.store(false, Ordering::Release);
        });
        Self {
            window,
            alive,
            listener,
        }
    }
    fn check(&self) -> Result<(), String> {
        if self.alive.load(Ordering::Acquire) {
            Ok(())
        } else {
            Err("scanner_owner_closed".into())
        }
    }
}
impl<R: tauri::Runtime> Drop for Owner<R> {
    fn drop(&mut self) {
        use tauri::Listener;
        self.window.unlisten(self.listener);
    }
}

#[tauri::command]
pub async fn read_terminal_scanner_file<R: tauri::Runtime>(
    window: tauri::WebviewWindow<R>,
    configuration: tauri::State<'_, ScannerFiles>,
    request: ScannerFileRequest,
) -> Result<ScannerFileResult, String> {
    validate(&request)?;
    let guard = ReadGuard::acquire()?;
    let owner = Owner::new(window);
    let configuration = ScannerFiles(configuration.0.clone());
    tauri::async_runtime::spawn_blocking(move || {
        let _guard = guard;
        owner.check()?;
        let result = configuration.read(&request);
        owner.check()?;
        result
    })
    .await
    .map_err(|_| "scanner_file_read_failed".to_owned())?
}

#[cfg(test)]
mod tests;
