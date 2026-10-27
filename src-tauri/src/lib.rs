pub mod commands;
pub mod contracts;
#[cfg(windows)]
pub mod windows_private;

pub fn configure<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    builder
        .manage(commands::scanner_file::ScannerFiles::from_environment())
        .manage(commands::local_enrollment::LocalSetupToken::from_parent())
        .invoke_handler(tauri::generate_handler![
            commands::native_info,
            commands::local_enrollment::local_setup_token,
            commands::local_enrollment::ack_local_setup,
            commands::message_sound::play_message_sound,
            commands::terminal_folder::select_terminal_folder,
            commands::repair_state_color::select_repair_state_color,
            commands::startup::read_startup_arguments,
            commands::startup::terminate_application,
            commands::report_output::save_report_pdf,
            commands::report_output::print_report_pdf,
            commands::scanner_file::read_terminal_scanner_file
        ])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    configure(tauri::Builder::default())
        .run(app_context())
        .expect("failed to run Gestao Oficinas desktop");
}

// Keep one generated native context/Info.plist when the separate probe links this library.
pub fn app_context() -> tauri::Context<tauri::Wry> {
    tauri::generate_context!()
}
