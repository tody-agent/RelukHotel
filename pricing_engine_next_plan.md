# Kế Hoạch Hoàn Thiện: Pricing Engine VN

Dựa vào báo cáo Audit, đây là lộ trình các bước công việc (Action Plan) cần thực hiện ngay lập tức để hoàn thiện tính năng Pricing Engine và chuyển sang giai đoạn kiểm thử cuối cùng trước khi merge.

## Giai Đoạn 1: Vá Lỗ Hổng Backend Commands (Blocker)
Các file Frontend hiện tại đã có (như `RatePlanForm.tsx`) đang cố gọi các command chưa tồn tại. Phải tạo các API này để UI hoạt động được.

- [ ] **Task 1.1**: Cài đặt command `rate_plan_upsert` (Tạo mới hoặc cập nhật Rate Plan) trong `mhm/src-tauri/src/commands/pricing.rs`. Nhớ đăng ký command này vào `main.rs` hoặc `lib.rs` qua builder.
- [ ] **Task 1.2**: Cài đặt command `rate_plan_delete` (Xóa Rate Plan theo ID) trong `commands/pricing.rs`.
- [ ] **Task 1.3**: Cài đặt nhóm commands cho Dynamic Rule: `dynamic_rule_list`, `dynamic_rule_upsert`, và `dynamic_rule_delete`.
- [ ] **Task 1.4**: Cập nhật file `commands/mod.rs` và đăng ký các commands vừa tạo để Frontend có thể `invoke` được.

## Giai Đoạn 2: Xây Dựng Unit Test Cho Crate Pricing (Blocker)
Thuật toán tính giá rất phức tạp và liên quan đến tiền bạc, nên việc thiếu Unit Test là rủi ro cực cao. Cần viết toàn bộ test scenarios được định nghĩa trong spec.

- [ ] **Task 2.1**: Tạo thư mục `tests` trong `mhm/src-tauri/crates/pricing/src` hoặc viết test trực tiếp vào cuối file `calc.rs` bằng `#[cfg(test)]`.
- [ ] **Task 2.2**: Viết Unit test cho **Case A (Motel)**: Tính giá ngày, giá qua đêm, giá giờ (cộng dồn và fallback), tính phụ trội checkin/checkout.
- [ ] **Task 2.3**: Viết Unit test cho **Case B (Tourist)**: Check-out muộn theo % giá ngày, tính thêm 1 đêm nếu vượt ngưỡng max.
- [ ] **Task 2.4**: Viết Unit test cho **Case C, D (Dynamic Pricing)**: Áp dụng phụ thu vào các ngày/đêm được chỉ định, tính thêm vào base rate.
- [ ] **Task 2.5**: Viết Unit test cho **Case E (Extra Bed)**: Tính toán phụ thu thêm người dựa trên `capacity`.
- [ ] **Task 2.6**: Viết Unit test cho **Case F (Override)**: Đảm bảo logic tính toán dùng đúng `override_json` nếu có.
- [ ] **Task 2.7**: Viết Unit test cho **Case G (Monthly)**: Kiểm tra cả 2 residual modes: `per_day` và `full_month`.

## Giai Đoạn 3: Kiểm Thử Cấu Trúc Database (High Priority)
- [ ] **Task 3.1**: Mở rộng module `tests` trong `mhm/src-tauri/src/db.rs` để thêm test cho migration **V15**. Đảm bảo rằng `migrate_pricing_rules_to_rate_plan` hoạt động trơn tru không gây thất thoát `night_rate` cũ của các khách sạn.

## Giai Đoạn 4: Hoàn Thiện E2E Test & UI Integration
- [ ] **Task 4.1**: Sửa các lỗi của file `mhm/tests/e2e/15-pricing-checkin.test.tsx` (nếu đang fail). Đảm bảo giao diện check-in và preview hoạt động khớp với backend.
- [ ] **Task 4.2**: Test thủ công trên giao diện: Thêm rate plan mới, set dynamic rule, và check-in ảo để đối chiếu UI Calculator với kết quả.

## Giai Đoạn 5: Tài Liệu Hóa (Bắt buộc trước khi Merge)
- [ ] **Task 5.1**: Cập nhật `README.md` phần Key Features.
- [ ] **Task 5.2**: Cập nhật `CHANGELOG.md` cho Release ghi rõ tính năng Pricing V2.
- [ ] **Task 5.3**: Soạn Markdown file hướng dẫn các case setup giá của SkyHotel.
