// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.contains(&"--mcp-stdio".to_string()) {
        relukhotel_lib::run_proxy();
    } else {
        relukhotel_lib::run()
    }
}
