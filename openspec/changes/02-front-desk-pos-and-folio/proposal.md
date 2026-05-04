# Proposal: POS tại quầy + Hóa đơn dịch vụ + Ký gửi liên phòng

## Why
Hiện CapyInn chỉ tracking "charge" gắn với booking. Khách sạn VN cần 3 luồng bán hàng dịch vụ:

1. **Thêm dịch vụ vào hóa đơn phòng** khi khách đang ở (mini-bar, giặt ủi, ăn sáng).
2. **Bán lẻ tại quầy** cho khách vãng lai (chai nước, gói bim bim, tour) → hóa đơn dịch vụ độc lập, KHÔNG gắn phòng.
3. **Ký gửi hóa đơn liên phòng** (folio transfer): trả phòng A nhưng gộp tiền vào phòng B (gia đình ở 2 phòng).
4. **Trả lại dịch vụ** (số lượng âm) khi khách trả lại không dùng.

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/ban-hoac-tra-lai-dich-vu
- https://hotro.skyhotel.vn/docs/bat-dau-su-dung-va-cai-dat-ks/khoi-tao-dich-vu-va-kho

## What Changes
- Khái niệm **Folio** tách khỏi Stay: 1 folio có thể chứa 0..n stays + 0..n service_lines + 0..n payments + 0..n deposits. (Stay không có folio = walk-in retail; Stay có folio gắn với 1 folio duy nhất.)
- Trang "POS tại quầy" — cashier UI: chọn dịch vụ → số lượng → thanh toán → in.
- Tính năng "Ký gửi vào phòng khác" trong dialog check-out.
- Tính năng "Trả lại dịch vụ" với số lượng âm.
- Quản lý nhập/xuất kho cải thiện: ghi log từng lần xuất/nhập, FIFO, cảnh báo tồn kho thấp.
- Nhóm dịch vụ (service group): Đồ uống / Đồ ăn / Giặt ủi / Tour / Khác.
- Flag mỗi dịch vụ: `track_inventory`, `internal_only` (không hiện trên HĐ khách), `requires_kitchen_print` (in chuyển bếp/bar).

## Scope
**In scope:**
- POS tại quầy với UX nhanh (hot-key, search, ảnh sản phẩm).
- Folio model + folio transfer.
- Inventory tracking với cảnh báo.
- In hóa đơn 80mm cho POS (bridge sang change 06 cho ESC/POS native, ở change này dùng HTML print).

**Out of scope:**
- Phát hành HĐĐT từ POS — xem change 03.
- Tích hợp với máy quét barcode — change 06.
- Print kitchen ticket riêng — change 06.

## Acceptance Scenarios

### A. Bán lẻ tại quầy
- A1: Khách vãng lai vào quầy mua 2 chai nước (15k) + 1 mì gói (10k) → hóa đơn 40k → thanh toán tiền mặt → in hóa đơn → giảm tồn kho.
- A2: Cùng A1 nhưng dịch vụ "Tour Đà Lạt 1 ngày" KHÔNG track_inventory → tồn kho không thay đổi.

### B. Thêm dịch vụ vào phòng đang ở
- B1: Phòng 101 đang có khách → click → "Trả phòng/Cập nhật HĐ" → thêm 3 chai Coca → folio.subtotal_services = 30.000đ.
- B2: Lễ tân nhập nhầm 5 chai thành 3 → cập nhật số lượng = 3 → tính lại đúng.

### C. Trả lại dịch vụ
- C1: Phòng đã thêm 3 chai Coca, khách trả lại 1 chai → thêm dòng dịch vụ Coca với qty = -1, tổng = 20.000đ; tồn kho tăng 1.

### D. Ký gửi liên phòng (folio transfer)
- D1: Phòng 101 (folio F1) và 102 (folio F2) là 1 gia đình. Tại check-out 102, chọn "Chuyển hóa đơn vào phòng 101" → folio F2 merge vào F1; F2 closed empty; phòng 102 trạng thái dirty.
- D2: Tại check-out đoàn (giữ Ctrl chọn nhiều phòng → "Trả phòng đoàn") → các stay merge vào folio đại diện, mỗi stay vẫn giữ trace thông tin gốc trong line_items.

### E. Inventory cảnh báo
- E1: Coca tồn kho 5, threshold 10 → dashboard hiện chip "Coca: 5/10 ⚠️".
- E2: Bán hết → tồn 0 → POS chặn không cho thêm vào folio (toast "Hết hàng — vui lòng nhập kho").

### F. Nội bộ (internal_only)
- F1: "Bàn chải đánh răng" được flag internal_only → không hiện trên menu POS, không hiện trên hóa đơn khách, nhưng có trong báo cáo xuất kho.

## Approach
- Refactor schema: `folio` table mới, `service_line` gắn vào folio_id thay vì stay_id trực tiếp.
- Stay có `folio_id`. Khi check-in khách lẻ → tạo folio mới + stay link folio.
- Khi chuyển folio: cập nhật `folio.merged_into_id`, mọi line_items của folio cũ link sang folio mới.
- POS retail = tạo folio không có stay, đóng folio ngay khi thanh toán.

## Risks
- Folio refactor có thể break check-out flow hiện tại. → Mitigation: làm migration giữ tương thích, viết integration test full check-in→check-out trước khi merge.
- UX POS phải nhanh — testers thử với 30 dịch vụ phổ biến phải <2 click/lần thêm.
