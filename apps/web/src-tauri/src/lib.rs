#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn foundation_status() -> &'static str {
    "local-foundation-ready"
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![foundation_status])
        .run(tauri::generate_context!())
        .expect("error while running PRD Software");
}
