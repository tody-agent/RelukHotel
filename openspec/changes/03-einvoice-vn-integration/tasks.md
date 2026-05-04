# Tasks — HĐĐT VN

## 1. Crate & Trait
- [ ] 1.1 Tạo `crates/einvoice/` với trait + types chung
- [ ] 1.2 `EInvoiceProvider` async trait với 6 methods
- [ ] 1.3 Lỗi phân loại: `Transient` (network, 5xx) vs `Permanent` (4xx, validation)

## 2. MISA Provider
- [ ] 2.1 Đọc API doc MISA meInvoice (sandbox), liệt kê endpoint
- [ ] 2.2 OAuth2 token cache + refresh
- [ ] 2.3 `issue()` mapping CapyInn IssueRequest → MISA payload
- [ ] 2.4 `lookup()`, `cancel()`, `replace()`, `download()`
- [ ] 2.5 Mock server cho integration test
- [ ] 2.6 Test với sandbox account thật (1 test/ngày trong CI optional)

## 3. Viettel Provider
- [ ] 3.1 Đọc API doc Viettel SInvoice
- [ ] 3.2 Auth + session
- [ ] 3.3 Tất cả methods như MISA
- [ ] 3.4 Mock + sandbox test

## 4. DB & Migration
- [ ] 4.1 Migration `0003_einvoice.sql`
- [ ] 4.2 Index trên status, folio_id, idempotency_key
- [ ] 4.3 Trigger updated_at on einvoice

## 5. Mapping & Domain
- [ ] 5.1 `folio_to_invoice(folio_id) -> IssueRequest`
- [ ] 5.2 Group lines by vat_rate
- [ ] 5.3 Tính thành tiền chưa VAT, tiền VAT, tổng (tránh sai số rounding — luôn từ unit_price × qty)
- [ ] 5.4 Validate MST người mua (chuẩn 10 hoặc 13 chữ số)

## 6. Background Worker
- [ ] 6.1 Tokio task `einvoice_worker` retry pending mỗi 30s
- [ ] 6.2 Exponential backoff (30s, 1m, 2m, 5m, max 30m)
- [ ] 6.3 Sau 10 lần fail → status=failed + notification UI

## 7. Tauri Commands
- [ ] 7.1 `einvoice_issue_for_folio(folio_id, buyer_info?)`
- [ ] 7.2 `einvoice_issue_standalone(items, buyer_info?)` (cho POS)
- [ ] 7.3 `einvoice_replace(original_id, items)`
- [ ] 7.4 `einvoice_cancel(id, reason)`
- [ ] 7.5 `einvoice_download_pdf(id) -> path`
- [ ] 7.6 `einvoice_test_connection(provider, config)`
- [ ] 7.7 `einvoice_provider_config_upsert(...)`

## 8. Security
- [ ] 8.1 `keyring-rs` integration cho credentials
- [ ] 8.2 Migrate credentials_json → keyring nếu user import config cũ
- [ ] 8.3 Audit log mọi thao tác phát hành/hủy/thay thế

## 9. Frontend — Settings
- [ ] 9.1 Page "Cài đặt > HĐĐT" với form provider config
- [ ] 9.2 Test Connection button + result chip
- [ ] 9.3 Cảnh báo Sandbox đỏ
- [ ] 9.4 Reminder cập nhật ký hiệu đầu năm (kiểm tra mỗi launch nếu series_year < current_year)

## 10. Frontend — Issue Flow
- [ ] 10.1 Trong dialog check-out: section "HĐĐT" với checkbox + form buyer
- [ ] 10.2 Trong POS pay: button "Phát hành HĐĐT"
- [ ] 10.3 Page "Danh sách HĐĐT" với filter (status, ngày, provider)
- [ ] 10.4 Detail page mỗi HĐ: thông tin + link PDF + lookup_code (QR)
- [ ] 10.5 Action menu: Tải PDF, Tra cứu CQT (mở browser), Lập HĐ thay thế, Hủy HĐ
- [ ] 10.6 Notification khi có HĐ pending lâu / failed

## 11. Tests
- [ ] 11.1 Unit mapping folio → IssueRequest cho 5 case (room only, room+service, B2C, B2B, multi-VAT)
- [ ] 11.2 Test rounding: tổng line items + VAT == total folio (không sai 1đ)
- [ ] 11.3 Mock MISA: issue → success → row.status=issued
- [ ] 11.4 Mock MISA: 500 error → row.status=pending, retry_count++
- [ ] 11.5 Mock MISA: 400 validation → row.status=failed
- [ ] 11.6 Idempotency: gọi issue 2 lần với cùng folio → chỉ tạo 1 row
- [ ] 11.7 Replace flow: original.status=replaced
- [ ] 11.8 Sandbox account real: 1 issue + 1 cancel test thủ công

## 12. Docs
- [ ] 12.1 User guide cấu hình MISA (step-by-step)
- [ ] 12.2 User guide cấu hình Viettel
- [ ] 12.3 FAQ về HĐĐT (NĐ 123, NĐ 70, ký hiệu, MST)
- [ ] 12.4 README mục "E-Invoice VN"
- [ ] 12.5 CHANGELOG
