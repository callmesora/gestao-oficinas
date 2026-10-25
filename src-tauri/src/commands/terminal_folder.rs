use crate::contracts::TerminalFolderRequest;

pub const SELECT_TERMINAL_FOLDER_COMMAND: &str = "select_terminal_folder";

fn validate(request: &TerminalFolderRequest) -> Result<(), String> {
    if request.initial_directory.contains('\0')
        || request.initial_directory.encode_utf16().count() > 32767
    {
        return Err("invalid_initial_directory".into());
    }
    Ok(())
}

// SRC-1589c564c4: local OS selection only; business record positioning is owned by the API.
#[tauri::command]
pub async fn select_terminal_folder<R: tauri::Runtime>(
    window: tauri::WebviewWindow<R>,
    request: TerminalFolderRequest,
) -> Result<String, String> {
    validate(&request)?;
    #[cfg(any(target_os = "windows", target_os = "macos"))]
    {
        let mut dialog = rfd::AsyncFileDialog::new()
            .set_parent(&window)
            .set_title("Pasta de Localização do Ficheiro");
        if !request.initial_directory.is_empty() {
            dialog = dialog.set_directory(&request.initial_directory);
        }
        match dialog.pick_folder().await {
            Some(folder) => folder
                .path()
                .to_str()
                .map(str::to_owned)
                .ok_or_else(|| "invalid_selected_path".into()),
            None => Ok(String::new()),
        }
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let _ = window;
        Err("unsupported_platform".into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn terminal_folder_validates_boundary_without_reading_files() {
        assert!(
            validate(&TerminalFolderRequest {
                initial_directory: String::new()
            })
            .is_ok()
        );
        assert!(
            validate(&TerminalFolderRequest {
                initial_directory: "C:\\Synthetic".into()
            })
            .is_ok()
        );
        assert!(
            validate(&TerminalFolderRequest {
                initial_directory: "bad\0path".into()
            })
            .is_err()
        );
        assert!(
            validate(&TerminalFolderRequest {
                initial_directory: "x".repeat(32768)
            })
            .is_err()
        );
    }
}
