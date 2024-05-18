fn main() {
    if !cfg!(debug_assertions) && cfg!(target_os = "windows") {
        let mut windows = tauri_build::WindowsAttributes::new();
        windows = windows.app_manifest(include_str!("manifest.xml"));
        tauri_build::try_build(tauri_build::Attributes::new().windows_attributes(windows))
            .expect("failed to run build script");
    } else {
        tauri_build::build();
    }
}
