#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod invoke;
pub mod launcher;

use tauri::tray::TrayIconBuilder;

use crate::invoke::*;

fn main() {
    tracing_subscriber::fmt::init();

    #[cfg(not(windows))]
    if !check_sudo() {
        std::process::exit(0);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            TrayIconBuilder::new()
                .on_tray_icon_event(|app, event| {
                    tauri_plugin_positioner::on_tray_event(app.app_handle(), &event);
                })
                .build(app)?;
            Ok(())
        })
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
