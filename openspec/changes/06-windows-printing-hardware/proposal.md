# Proposal: Windows First-Class + ESC/POS + Khóa từ + Hardware Integration

## Why
README CapyInn ghi rõ: "verified most heavily on macOS and Apple Silicon. Windows and Linux are not first-class targets yet." → 95% khách sạn VN dùng Windows. **Đây là blocker thị trường**.

Đồng thời, khách sạn cần tích hợp:
- Máy in nhiệt 80mm (ESC/POS) cho hóa đơn quầy.
- Máy in A4/A5 (Canon, HP) cho HĐĐT in copy.
- Khóa từ phòng (Adel, Hune, Dorset, Onity).
- Bộ điều khiển bật/tắt điện qua IP.
- Màn hình thứ 2 hiển thị phòng trống cho khách (privacy).

Tham chiếu SkyHotel: cấu hình chung có sẵn các flag cho tất cả phần cứng trên.

## Scope
**In scope:**
- Windows installer (MSI + code-sign), auto-update qua Tauri updater.
- ESC/POS thermal print 80mm (USB + network).
- Print A4 qua HTML→PDF.
- Khóa từ: trait + 1 impl Adel (phổ biến nhất).
- Bộ điều khiển điện: HTTP/MQTT abstraction.
- Màn hình thứ 2 (Tauri multi-window) với privacy mode.

**Out of scope:**
- Tất cả hãng khóa từ (chỉ làm Adel + framework để thêm sau).
- Barcode scanner.
- Camera CCTV.

## Acceptance
- A1: Build .msi cho Windows 10/11 x64, install không có UAC error, app launch OK.
- A2: In hóa đơn 80mm Epson TM-T82 qua USB, ESC/POS commands đúng (header, items, total, footer).
- A3: In HĐĐT A4 qua máy Canon LBP với mẫu HTML chuẩn.
- A4: Mở/đóng Adel khóa từ qua serial COM/TCP với thẻ phòng.
- A5: Bật/tắt điện phòng qua IP của bộ điều khiển khi check-in/out.
- A6: Mở second window cho màn hình ngoài, hiển thị "Phòng trống: 5" + danh sách phòng (ẩn tên khách phòng đang ở).
