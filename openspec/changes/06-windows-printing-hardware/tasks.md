# Tasks — Windows + Hardware

## 1. Windows Build
- [ ] 1.1 Tauri config Windows bundles (MSI + NSIS)
- [ ] 1.2 GitHub Actions workflow build Windows artifact
- [ ] 1.3 Code signing setup (cert + sign step)
- [ ] 1.4 Auto-updater config + test
- [ ] 1.5 Replace `~/CapyInn` paths → `app_data_dir()`
- [ ] 1.6 Fix any Win-specific path/separator/case issues

## 2. Linux Build
- [ ] 2.1 AppImage + .deb config
- [ ] 2.2 Test trên Ubuntu 22.04

## 3. ESC/POS Printer
- [ ] 3.1 Crate `printer` với template engine
- [ ] 3.2 USB connection (libusb/escpos-rs)
- [ ] 3.3 TCP connection (network printer 9100)
- [ ] 3.4 Templates: receipt 80mm, kitchen ticket
- [ ] 3.5 Page setting: lựa chọn 80mm/A6/A4/A5
- [ ] 3.6 Test với Epson TM-T82, Xprinter XP-58

## 4. A4 Print
- [ ] 4.1 HTML template HĐ + folio detail
- [ ] 4.2 Tauri print API hoặc rust-pdf
- [ ] 4.3 Print preview dialog

## 5. Door Lock
- [ ] 5.1 Trait `DoorLockProvider`
- [ ] 5.2 Adel impl qua serial + TCP
- [ ] 5.3 UI cài đặt port + test connection
- [ ] 5.4 Flag `has_room_label` (SkyHotel) — quyết logic encode

## 6. Power Controller
- [ ] 6.1 Trait + HTTP impl
- [ ] 6.2 Pulse for housekeeping (timeout config)
- [ ] 6.3 UI cài đặt IP + test

## 7. Second Display
- [ ] 7.1 Tauri new window route `/public-display`
- [ ] 7.2 Privacy mode rendering
- [ ] 7.3 Auto-refresh polling
- [ ] 7.4 Cấu hình bật/tắt + chọn monitor

## 8. Tests
- [ ] 8.1 ESC/POS template snapshot
- [ ] 8.2 Smoke Windows build CI
- [ ] 8.3 Adel mock test

## 9. Docs
- [ ] 9.1 Hardware compatibility matrix
- [ ] 9.2 Windows install guide với screenshots
- [ ] 9.3 CHANGELOG
