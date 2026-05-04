# Delta for E-Invoice

## ADDED Requirements

### Requirement: Multi-Provider Architecture
The system MUST abstract e-invoice operations behind a provider trait, with built-in implementations for MISA meInvoice and Viettel SInvoice. Adding a new provider MUST NOT require changes to consuming code.

#### Scenario: Switch provider
- GIVEN khách sạn đã phát hành 100 HĐ qua MISA, đổi sang Viettel
- WHEN admin chọn Viettel + cấu hình credential mới + save
- THEN HĐ mới link Viettel; HĐ cũ vẫn link MISA + tra cứu được

### Requirement: Issue from Folio
The system MUST allow issuing an e-invoice for any closed or merging folio. The folio's lines (room + services + surcharges) MUST be mapped to invoice lines preserving VAT rates per line.

#### Scenario: Multi-VAT folio
- GIVEN folio với phòng VAT 5%, đồ uống VAT 8%, tour VAT 10%
- WHEN phát hành HĐĐT
- THEN HĐ có 3 line groups, mỗi group đúng VAT rate
- AND tổng tiền VAT = sum(vat_amount per line)

### Requirement: Issue Standalone (POS Retail)
The system MUST allow issuing an e-invoice directly from POS retail without folio linkage, for walk-in service-only customers.

#### Scenario: POS retail invoice
- GIVEN POS sale 2 chai nước 30.000đ, khách yêu cầu hóa đơn cá nhân
- WHEN cashier click "Phát hành HĐĐT" + nhập tên + địa chỉ (không MST)
- THEN provider trả về số HĐ + lookup_code, in trên hóa đơn 80mm

### Requirement: Replace Invoice (HĐ Thay Thế)
The system MUST support issuing a replacement e-invoice referencing the original. The original status becomes `replaced`. Auditing MUST track who, when, why.

#### Scenario: Wrong amount, replace
- GIVEN HĐ B-001 đã issued với total=500.000đ nhưng đúng phải là 520.000đ
- WHEN admin "Lập HĐ thay thế" → nhập lý do "Sai số tiền" → submit với items đã sửa
- THEN tạo HĐ B-002 với replaces_id=B-001, B-001.status='replaced'
- AND audit log có entry actor + reason

### Requirement: Cancel Invoice
The system MUST support cancelling an issued e-invoice with a mandatory reason text. Cancelled invoices MUST NOT count in revenue reports.

#### Scenario: Cancel for wrong customer
- GIVEN HĐ issued cho khách A, lễ tân chọn nhầm khách
- WHEN admin "Hủy HĐ" + reason "Sai khách hàng"
- THEN status=cancelled, cancelled_reason="Sai khách hàng"
- AND báo cáo doanh thu không cộng HĐ này

### Requirement: Offline Queue with Retry
The system MUST queue issue requests when provider is unreachable, and retry automatically when connectivity returns. Retry MUST use exponential backoff up to 30 minutes; after 10 failures, status becomes `failed` and a notification is shown.

#### Scenario: Issue offline → online
- GIVEN không có Internet
- WHEN user click "Phát hành" trên folio
- THEN tạo einvoice row status='pending', không gọi API
- AND khi có Internet (ví dụ 5 phút sau), worker retry → status='issued'

#### Scenario: Permanent failure
- GIVEN provider trả 400 "Tax code invalid" (lỗi cấu hình)
- WHEN worker retry
- THEN status='failed' ngay (không retry vì lỗi permanent)
- AND notification UI cho admin

### Requirement: Idempotency
The system MUST guarantee that issuing for the same folio twice produces only one e-invoice. Implementation: insert einvoice row before API call, use einvoice.id as idempotency key.

#### Scenario: Double-click
- GIVEN user double-click "Phát hành" rất nhanh
- WHEN 2 requests đi
- THEN chỉ 1 einvoice row tạo ra (DB unique constraint trên folio_id WHERE status NOT IN ('cancelled','failed'))

### Requirement: Local PDF/XML Archive
The system MUST download and store PDF and XML of every successfully issued invoice locally under `~/CapyInn/einvoice/{year}/{series}/{number}.{ext}`, accessible offline.

#### Scenario: Offline lookup
- GIVEN HĐ B-001 đã issued, có pdf_path
- WHEN không có Internet, user click "Xem HĐ"
- THEN PDF mở từ local, không gọi network

### Requirement: Annual Series Update Reminder
The system MUST detect when current calendar year exceeds `series_year` of active provider config, and display a non-dismissable banner reminding admin to update the series.

#### Scenario: Year rollover
- GIVEN active config series='C25TYY' series_year=2025
- WHEN ngày 02/01/2026, app khởi động
- THEN banner đỏ: "Đã sang năm 2026 — vui lòng cập nhật ký hiệu hóa đơn"
- AND link "Cập nhật ngay" → settings page với field highlight
