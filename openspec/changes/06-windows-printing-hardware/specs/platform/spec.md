# Delta for Platform

## ADDED Requirements

### Requirement: Windows First-Class
The system MUST provide a signed MSI installer for Windows 10/11 x64 with auto-update capability via Tauri updater. All file paths MUST resolve via `app_data_dir()`, not hardcoded `~/`.

### Requirement: Cross-Platform Path Abstraction
The system MUST use Tauri's path API for app_data, app_log, and document directories. Direct `~` references in code are forbidden.
