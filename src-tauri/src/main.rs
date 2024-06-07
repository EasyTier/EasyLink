#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod invoke;

use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

use crate::invoke::*;

pub const AUTOSTART_ARG: &str = "--autostart";

fn main() {

    #[cfg(debug_assertions)]
    tracing_subscriber::fmt::init();
    
    if !check_sudo() {
        std::process::exit(0);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![AUTOSTART_ARG]),
        ))
        .plugin(tauri_plugin_notification::init())
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let _ = window.emit("close_requested", ());
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
            is_autostart,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn check_sudo() -> bool {
    let is_elevated = privilege::user::privileged();
    if !is_elevated {
        let Ok(exe) = std::env::current_exe() else {
            return true;
        };
        let args: Vec<String> = std::env::args().collect();
        let mut elevated_cmd = privilege::runas::Command::new(exe);
        if args.contains(&AUTOSTART_ARG.to_owned()) {
            elevated_cmd.arg(AUTOSTART_ARG);
        }
        let _ = elevated_cmd.force_prompt(true).hide(true).gui(true).run();
    }
    is_elevated
}
