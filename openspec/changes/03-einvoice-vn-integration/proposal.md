# Proposal: Tích hợp Hóa đơn điện tử VN (MISA meInvoice + Viettel SInvoice)

## Why
Khách sạn VN BẮT BUỘC phát hành hóa đơn điện tử (HĐĐT) theo:
- **Nghị định 123/2020/NĐ-CP** quy định về HĐĐT.
- **Nghị định 70/2025/NĐ-CP** sửa đổi NĐ123, mở rộng yêu cầu HĐĐT khởi tạo từ máy tính tiền cho hộ kinh doanh, doanh nghiệp ngành dịch vụ ăn uống, lưu trú có doanh thu trên ngưỡng quy định, và áp dụng từ 01/06/2025.

Không có HĐĐT = CapyInn KHÔNG bán được cho khách sạn nào ở VN. Đây là **blocker pháp lý**.

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/huong-dan-khac/cap-nhat-ky-hieu-hoa-don-may-tinh-tien

2 nhà cung cấp HĐĐT phổ biến nhất (target tích hợp đầu tiên):
- **MISA meInvoice** (https://www.meinvoice.vn) — REST API, OAuth2.
- **Viettel SInvoice** (https://sinvoice.viettel.vn) — REST API + SOAP cũ.

(Phase tiếp theo: VNPT, BKAV, EasyInvoice — cùng abstraction.)

## What Changes
- Trait `EInvoiceProvider` trong Rust + 2 impl `MisaProvider`, `ViettelProvider`.
- Cấu hình kết nối: tax_code, ký_hiệu_hóa_đơn (đổi mỗi năm), API key/secret, env (sandbox/production), endpoint URL.
- Trên mỗi folio đóng (close) HOẶC mỗi POS retail thanh toán → option "Phát hành HĐĐT" → gọi provider → lưu mã CQT, mã tra cứu, link PDF.
- Hỗ trợ: phát hành mới, **thay thế** (HĐ sai sót lập thay thế), **điều chỉnh**, **hủy**.
- Queue cho HĐ khi mất Internet → retry tự động.
- Cập nhật ký hiệu hóa đơn theo năm với reminder đầu tháng 1.
- Mã số thuế khách hàng (B2B): nhập tay hoặc chọn từ danh bạ công ty.

## Scope
**In scope:**
- 2 providers: MISA, Viettel (sandbox + production).
- HĐĐT từ folio đóng (room + retail).
- Phát hành / thay thế / hủy.
- Queue + retry offline.
- Lưu PDF/XML local.
- In hóa đơn (HTML preview + link tra cứu CQT).

**Out of scope (giai đoạn này):**
- VNPT, BKAV, EasyInvoice (sẽ thêm sau bằng cùng trait).
- Hóa đơn xuất khẩu / hóa đơn ngoại tệ phức tạp.
- Báo cáo BC26 (sẽ làm cùng change 05 reporting).

## Key Compliance Notes (NĐ 123/2020 + NĐ 70/2025)
- Mỗi HĐĐT có **mã của cơ quan thuế (CQT)** (đối với HĐ có mã) hoặc **không có mã** tùy đăng ký doanh nghiệp.
- HĐ phải có: số HĐ, ký hiệu (vd `1C25TYY`), ngày lập, MST người bán + mua, nội dung hàng hóa/dịch vụ, đơn vị tính, số lượng, đơn giá, thành tiền, thuế suất, tiền thuế, tổng tiền thanh toán, chữ ký số.
- HĐĐT từ máy tính tiền có ký hiệu mẫu khác (`C` thay vì `K`, năm `25` cho 2025...).
- Khi sai → lập HĐ **thay thế** (kèm CV hủy HĐ cũ) hoặc **điều chỉnh** (CV điều chỉnh).
- Lưu trữ: HĐ phải lưu tối thiểu 10 năm (chuẩn kế toán VN).
- Đầu mỗi năm tài chính → đăng ký ký hiệu mới với CQT → cập nhật vào phần mềm.

## Acceptance Scenarios

### A. Cấu hình ban đầu (MISA)
- A1: Admin vào "Cài đặt > HĐĐT" → chọn provider "MISA meInvoice" → nhập tax_code, app_id, secret, environment=sandbox → "Test connection" → trả OK.
- A2: Cấu hình ký hiệu hóa đơn `C25TYY` cho năm 2025.

### B. Phát hành HĐĐT khi check-out
- B1: Folio room 101 đóng, total=520.000đ (480.000 phòng VAT 5% + 40.000 dịch vụ VAT 8%) → click "Phát hành HĐĐT" → MISA trả mã CQT + số HĐ → CapyInn lưu + in PDF.
- B2: Cùng B1 nhưng khách yêu cầu HĐ công ty → nhập MST người mua "0123456789" → MISA xuất HĐ B2B.

### C. Phát hành HĐĐT từ POS retail
- C1: Bán lẻ 2 chai nước 30.000 → thanh toán → option "HĐĐT" → phát hành → in.

### D. Offline queue
- D1: Mất Internet → click "Phát hành" → folio status=`einvoice_pending`, lưu queue → khi có lại Internet, worker tự retry → success → cập nhật mã CQT.

### E. Thay thế HĐ sai
- E1: HĐ B-001 đã phát hành nhầm số tiền → admin chọn "Lập HĐ thay thế" → tạo HĐ B-001-R với reference đến B-001 → MISA xác nhận → B-001 bị flag is_replaced.

### F. Cập nhật ký hiệu năm mới
- F1: Ngày 01/01/2026 → app banner "Đã sang năm mới — vui lòng cập nhật ký hiệu hóa đơn" → admin update từ `C25TYY` thành `C26TYY` → save.

### G. Multi-provider switch
- G1: Khách sạn đổi từ MISA sang Viettel → admin chọn Viettel + nhập credential → HĐ cũ vẫn link MISA, HĐ mới link Viettel.

## Risks
- API documentation cả 2 nhà cung cấp đều có thể đổi không báo trước. → Mitigation: viết integration test với mock + 1 test thực với sandbox account/tuần.
- Chữ ký số: 2 cách — nhà cung cấp tự ký bằng cert họ giữ, hoặc khách sạn tự dùng USB token. v1 chỉ hỗ trợ phương án 1 (đơn giản hơn).
- Sandbox khác production: phải có flag rõ ràng + warning UI.
