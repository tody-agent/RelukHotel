# Tasks — POS + Folio

## 1. DB & Migration
- [ ] 1.1 Migration `0002_folio_pos.sql` (folio, service_group, service, service_price_variant, service_line, inventory_movement, inventory_threshold, payment + ALTER stay)
- [ ] 1.2 Migrate dữ liệu cũ: tạo folio cho mỗi stay hiện có, link service/payment cũ
- [ ] 1.3 Trigger refresh folio totals on insert/update service_line, payment

## 2. Backend — Folio Service
- [ ] 2.1 `folio_create(kind, ...)` 
- [ ] 2.2 `folio_add_service_line(folio_id, service_id, qty, unit_price?, note?)`
- [ ] 2.3 `folio_remove_service_line(line_id)` — soft via reverse?
- [ ] 2.4 `folio_add_payment(folio_id, amount, method, is_deposit)`
- [ ] 2.5 `folio_close(folio_id)` — guard: balance phải = 0 hoặc có chuyển công nợ
- [ ] 2.6 `folio_merge(src, dst)` (transaction-safe)
- [ ] 2.7 `folio_refresh_totals(folio_id)`
- [ ] 2.8 `folio_get(folio_id) -> FolioWithLines`

## 3. Backend — Inventory Service
- [ ] 3.1 `inventory_post_movement(service_id, kind, qty, unit_cost?, ref?)`
- [ ] 3.2 `inventory_balance(service_id) -> i64`
- [ ] 3.3 `inventory_check_threshold() -> Vec<LowStockItem>`
- [ ] 3.4 Trigger: khi thêm service_line track_inventory → auto post movement kind=out
- [ ] 3.5 Trigger: khi qty âm → auto post movement kind=return

## 4. Backend — POS Tauri Commands
- [ ] 4.1 `pos_quick_add(service_id, qty)` (folio retail current cashier)
- [ ] 4.2 `pos_open_session()` / `pos_close_session()`
- [ ] 4.3 `pos_search_service(query)` cho autocomplete

## 5. Frontend — POS Page
- [ ] 5.1 Layout: lưới sản phẩm bên trái + cart bên phải
- [ ] 5.2 Tab nhóm dịch vụ (F1..F12 hotkey)
- [ ] 5.3 Search box (focused mặc định)
- [ ] 5.4 Cart với edit qty inline + xóa line
- [ ] 5.5 Payment dialog: tiền mặt / chuyển khoản / thẻ
- [ ] 5.6 Sau thanh toán: in HTML hóa đơn 80mm + clear cart
- [ ] 5.7 Hot-key: Esc=clear, F9=in, F10=thanh toán

## 6. Frontend — Service Catalog Admin
- [ ] 6.1 Page "Dịch vụ & Kho" tab Danh sách dịch vụ
- [ ] 6.2 Form thêm/sửa service với tất cả flag (track_inventory, internal_only, vat_rate)
- [ ] 6.3 Quản lý nhóm dịch vụ (CRUD)
- [ ] 6.4 Page "Nhập kho": form thêm movement kind=in
- [ ] 6.5 Page "Tồn kho hiện tại" với cảnh báo low stock
- [ ] 6.6 Lịch sử movements với filter theo service & ngày

## 7. Frontend — Folio Operations on Room
- [ ] 7.1 Trong dialog "Trả phòng/Cập nhật HĐ": tab "Dịch vụ" — thêm/trả lại
- [ ] 7.2 Trạng thái HĐ: dropdown {Thanh toán tại chỗ, Ký gửi vào phòng khác, Đưa vào công nợ, Chưa thanh toán}
- [ ] 7.3 Khi chọn "Ký gửi vào phòng khác": picker chọn folio đích → confirm
- [ ] 7.4 Hiển thị "Hóa đơn ký gửi từ phòng X" trên folio đích
- [ ] 7.5 Tạo hóa đơn dịch vụ độc lập (button "Tạo hóa đơn dịch vụ" trên dashboard)

## 8. Tests
- [ ] 8.1 Unit folio merge: src lines/payments → dst, src.status=merged
- [ ] 8.2 Unit inventory: add line track → balance giảm
- [ ] 8.3 Unit inventory: line qty âm → balance tăng
- [ ] 8.4 Unit inventory: internal_only không hiện trên POS query
- [ ] 8.5 Integration: full walk-in retail flow (open→add 2 lines→pay→close)
- [ ] 8.6 Integration: room folio + ký gửi sang phòng khác → folio.status=merged
- [ ] 8.7 E2E Vitest: POS hot-key F1, search, add, pay
- [ ] 8.8 Property test: sum of payments + service_lines + room subtotal == folio.total

## 9. Docs
- [ ] 9.1 User guide POS (3 video ngắn: bán lẻ, thêm dv vào phòng, ký gửi)
- [ ] 9.2 README cập nhật mục "POS"
- [ ] 9.3 CHANGELOG
