# Proposal: Giao ca + Giao tiền quản lý + Chênh lệch

## Why
Khách sạn vận hành 24/7 với nhân viên ca. Mỗi đầu/cuối ca cần đối soát tiền:
- Tiền nhận từ ca trước
- Tiền thu trong ca (cash + bank)
- Tiền chi trong ca
- Tiền giao quản lý (rút khỏi quầy)
- Tiền giao ca sau = nhận trước + thu - chi - giao quản lý
- **Chênh lệch** giữa tiền thực tế trong két và tiền hệ thống

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/giao-ca
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/giao-tien-quan-ly

## What Changes
- Khái niệm `shift` (ca làm việc) với owner = user, time_open + time_close.
- Mọi `payment`, `expense_voucher`, `cash_movement` link đến shift_id của user lúc tạo.
- Flow giao ca: tính tổng → cashier nhập số tiền thực có → ghi nhận chênh lệch → logout cashier cũ + login cashier mới (cùng PIN/password).
- Flow giao tiền quản lý: rút tiền khỏi quầy → ghi `cash_movement` kind=manager_withdraw.
- Lịch sử giao ca + chênh lệch (mỗi ca xem được).
- Option "giao ca chỉ tổng kết tiền mặt" (cấu hình chung).

## Acceptance Scenarios

### A. Giao ca cơ bản
- A1: Cashier A mở ca lúc 06:00 với 880.000đ nhận từ ca trước. Trong ca thu 3.640.000đ tiền mặt từ folio + retail. Đến 14:00, A giao ca cho B → hệ thống tính 880 + 3640 = 4.520.000đ → B confirm.

### B. Có giao tiền quản lý giữa ca
- B1: Tiếp A1, lúc 12:00 A giao quản lý 4.000.000đ → cash_movement -4M. Đến 14:00 giao ca: 880 + 3640 - 4000 = **520.000đ**.

### C. Có chênh lệch
- C1: Ca tính ra 520.000đ nhưng A đếm két thực = 510.000đ → A nhập chênh lệch -10.000đ với note "thiếu" → giao 510.000đ cho B + entry chênh lệch lưu lại.

### D. Lần đầu giao ca (chưa có ca trước)
- D1: Lần đầu setup, A nhập tiền thực có 1.000.000đ vào "Tiền chênh lệch" → từ giờ hệ thống có baseline.

### E. Giao ca chỉ tiền mặt (config)
- E1: Cấu hình chung tick "Giao ca chỉ tiền mặt" → khi tính tổng, bỏ qua các payment method ≠ cash.

## Approach
- Schema `shift`, `cash_movement`, `shift_handover_record`.
- Flow logout-then-login: dùng Tauri secure store cho session, không persistent cookie.
- Refresh totals dynamic — không cache, query trực tiếp từ payment + expense.
