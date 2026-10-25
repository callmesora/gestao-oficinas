pub mod repair_state_color;
pub mod startup;
pub mod terminal_folder;
pub use repair_state_color::SELECT_REPAIR_STATE_COLOR_COMMAND;
pub use startup::{READ_STARTUP_ARGUMENTS_COMMAND, TERMINATE_APPLICATION_COMMAND};
pub use terminal_folder::SELECT_TERMINAL_FOLDER_COMMAND;

use crate::contracts::NativeInfo;

pub const NATIVE_INFO_COMMAND: &str = "native_info";

#[tauri::command]
pub fn native_info() -> NativeInfo {
    NativeInfo {
        app_version: env!("CARGO_PKG_VERSION").to_owned(),
        platform: std::env::consts::OS.to_owned(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn foundation_native_info_reports_compiled_version_and_platform() {
        let result = native_info();
        assert_eq!(result.app_version, env!("CARGO_PKG_VERSION"));
        assert_eq!(result.platform, std::env::consts::OS);
        let json = serde_json::to_value(result).unwrap();
        assert!(json.get("appVersion").is_some());
        assert!(json.get("app_version").is_none());
    }
}
