pub mod commands;
pub mod contracts;

pub fn configure<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    builder.invoke_handler(tauri::generate_handler![
        commands::native_info,
        commands::terminal_folder::select_terminal_folder,
        commands::repair_state_color::select_repair_state_color
    ])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    configure(tauri::Builder::default())
        .run(tauri::generate_context!())
        .expect("failed to run Gestao Oficinas desktop");
}
