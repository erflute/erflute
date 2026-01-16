use erm::dtos::diagram::Diagram;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn load_diagram(filename: &str) -> Result<Diagram, String> {
    erm::open(filename).map_err(|e| format!("failed to open {}:\n\t{}", filename, e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![load_diagram])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
