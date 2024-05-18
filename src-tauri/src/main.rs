#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod invoke;
pub mod launcher;

use crate::invoke::*;

fn main() {
    tracing_subscriber::fmt::init();
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            parse_network_config,
            start_network_instance,
            stop_network_instance,
            collect_network_infos,
            test_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
