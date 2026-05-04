# Báo cáo Audit: Tính Năng Pricing Engine VN (Change 01)

## 1. Mục Tiêu Kiểm Tra
Đối chiếu mã nguồn thực tế của dự án CapyInn (`mhm/` workspace) với kế hoạch thiết kế gốc (`openspec/changes/01-pricing-engine-vn/` trong `upgrade_idea.md`) để xác định tiến độ, những phần đã hoàn thành và những lỗ hổng/hạng mục còn thiếu cần thực hiện.

## 2. Kết Quả Audit Tổng Quan
Tính năng đang ở giai đoạn "Đã hoàn thiện giao diện và core logic nhưng thiếu kết nối API và kiểm thử". 
- **Database**: Đã hoàn thành schema (V15).
- **Backend (Pricing Crate)**: Đã có logic core nhưng thiếu test.
- **Backend (Tauri Commands)**: Thiếu các API quan trọng để Frontend có thể lưu cấu hình.
- **Frontend**: Đã có UI nhưng gọi API bị fail do backend chưa implement (ví dụ: gọi `rate_plan_upsert` nhưng command chưa tồn tại).
- **Testing**: Thiếu toàn bộ Unit Test cho Crate `pricing`.

## 3. Đánh Giá Chi Tiết Theo Kế Hoạch (Task List)

### 3.1 DB & Migration
- [x] **1.1 Tạo migration 0001_pricing_engine_v2.sql**: Đã tích hợp trực tiếp vào inline migration V15 trong `mhm/src-tauri/src/db.rs`. Bảng `rate_plan`, `dynamic_price_rule`, `dynamic_price_rule_value` và ALTER `bookings` đã được tạo.
- [x] **1.2 Script migrate data cũ**: Đã được xử lý thông qua file `crate::money_migration::migrate_pricing_rules_to_rate_plan(&mut tx)`.
- [ ] **1.3 Test migration**: Kiểm tra trong `db.rs` (mod tests) cho thấy có mock data và test migration v10 đến v14, nhưng CHƯA có test để verify tính toàn vẹn dữ liệu cho migration v15 (Rate Plan).

### 3.2 Backend — Pricing Crate (Rust)
- [x] **2.1 - 2.12 Domain Types & Core Logic**: Crate `pricing` đã được cấu trúc với các file `calc.rs`, `dynamic.rs`, `lib.rs`, `rate_plan.rs`, `stay.rs`. Các thuật toán tính giá đã được triển khai sơ bộ trong core logic.
- [x] **2.12 Snapshot/lock**: Đã implement `pricing_lock` và cấu trúc trong `stay.rs`.

### 3.3 Backend — Tauri Commands
- [x] **3.1, 3.4 Commands**: Các commands để lấy danh sách (`get_rate_plans`), xem trước giá (`calculate_price_v2`, `calculate_price_preview`) và khóa giá (`pricing_lock`) đã tồn tại trong `commands/pricing.rs`.
- [ ] **3.2 Rate Plan CRUD**: THIẾU các commands `rate_plan_upsert`, `rate_plan_delete`.
- [ ] **3.3 Dynamic Rule CRUD**: THIẾU các commands `dynamic_rule_list`, `dynamic_rule_upsert`, `dynamic_rule_delete`.

### 3.4 Frontend — Cấu hình
- [x] **4.1 - 4.6 UI Components**: Đã triển khai `RatePlanForm.tsx` với 5 nhóm tab và sử dụng `StepEditor` cho phụ trội. `DynamicPricingSection.tsx` và `DynamicRoomTypeSelect.tsx` cũng đã có.
- ⚠️ **Lỗi Tiềm Ẩn**: `RatePlanForm.tsx` hiện tại đang gọi `invoke("rate_plan_upsert")`, lệnh này sẽ crash/fail runtime vì Backend chưa khai báo command này.

### 3.5 Frontend — Sử dụng
- [x] **5.1 - 5.5 UI Components**: Đã có `CheckinSheet.tsx`, bảng preview `PricingPreviewPanel.tsx` và modal `PricingOverrideDialog.tsx`.

### 3.6 Tests (BLOCKER)
- [ ] **6.1 - 6.9 Unit Tests (Rust)**: THIẾU HOÀN TOÀN. Thư mục `mhm/src-tauri/crates/pricing/src` không có folder `tests/` hay file unit test nào. Các test cases nghiệp vụ quan trọng như Case A (Motel), B (Tourist), C (Dynamic), E (Extra bed), G (Monthly) theo mô tả của tài liệu spec chưa được viết.
- [x] **6.10 Vitest E2E**: File `15-pricing-checkin.test.tsx` đã tồn tại trong `mhm/tests/e2e/`, nhưng vẫn đang trong quá trình fix lỗi và hoàn thiện.

### 3.7 Docs
- [ ] **7.1 - 7.3 README & User Guide**: Chưa được update.

---
## 4. Kết Luận
Tính năng **Pricing Engine VN** đang bị đứt gãy ở tầng tích hợp (Backend Commands) và tiềm ẩn nhiều rủi ro về sai số do không có bài kiểm tra (Unit tests). 
Các phần việc còn thiếu này sẽ được vạch ra trong một bản kế hoạch mới để tập trung xử lý dứt điểm.
