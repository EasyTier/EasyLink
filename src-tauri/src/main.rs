#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod invoke;
pub mod launcher;

use tauri::Manager;

use crate::invoke::*;

fn main() {
    tracing_subscriber::fmt::init();

    #[cfg(not(windows))]
    if !check_sudo() {
        std::process::exit(0);
    }

    tauri::Builder::default()
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let _ = window.emit("close_requested", ());
                // window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_positioner::init())
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

#[cfg(not(windows))]
fn check_sudo() -> bool {
    let is_elevated = privilege::user::privileged();
    if !is_elevated {
        let Ok(exe) = std::env::current_exe() else {
            return true;
        };
        let mut elevated_cmd = privilege::runas::Command::new(exe);
        let _ = elevated_cmd.force_prompt(true).gui(true).run();
    }
    is_elevated
}
