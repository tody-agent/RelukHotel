# Design: Windows + Hardware

## Windows Build
- Tauri config `[bundle.windows]` với `wix` và `nsis`.
- Code signing: certificate qua DigiCert hoặc SSL.com (~150-300 USD/năm) — **CẦN ngân sách**.
- Auto-update: Tauri updater + S3/CloudFront bucket cho assets.
- Path conventions: thay `~/CapyInn` → `%APPDATA%\CapyInn` trên Windows; abstract qua `app_data_dir()` của Tauri.

## ESC/POS Print
