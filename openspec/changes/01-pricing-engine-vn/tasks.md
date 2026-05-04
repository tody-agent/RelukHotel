# Tasks — Pricing Engine VN

## 1. DB & Migration
- [x] 1.1 Tạo migration `0001_pricing_engine_v2.sql` (rate_plan, dynamic_price_rule, dynamic_price_rule_value, ALTER stay)
- [x] 1.2 Viết script migrate `room_type.night_rate` cũ → `rate_plan` mặc định
- [x] 1.3 Test migration trên DB sample không mất dữ liệu

## 2. Backend — Pricing Crate (Rust)
- [x] 2.1 Tạo `crates/pricing/` với Cargo.toml
- [x] 2.2 Domain types: `RatePlan`, `SurchargeStep`, `HourlyRate`, `OvernightRate`, `MonthlyRate`, `CalcInput`, `CalcOutput`
- [x] 2.3 `decide_mode()` — auto-detect mode
- [x] 2.4 `compute_hourly()` — step function + max_hours fallback
- [x] 2.5 `compute_nights()` — N nights × night_rate, áp dynamic rule cho mỗi đêm
- [x] 2.6 `compute_overnights()` — tương tự nhưng start_hour
- [x] 2.7 `compute_monthly()` — 2 chế độ residual
- [x] 2.8 `compute_early_surcharge()` + `compute_late_surcharge()`
- [x] 2.9 `compute_extra_bed()`
- [x] 2.10 `apply_dynamic_rules()` — overlay replace/add
- [x] 2.11 Public API `calculate(&CalcInput) -> CalcOutput`
- [ ] 2.12 Snapshot/lock: `lock_pricing(stay_id) -> CalcOutput` lưu vào stay

## 3. Backend — Tauri Commands
- [x] 3.1 `pricing_preview(room_id, check_in, check_out, occupants, override_json?)`
- [x] 3.2 `rate_plan_list(property_id)` / `rate_plan_upsert(...)` / `rate_plan_delete(id)`
- [x] 3.3 `dynamic_rule_list(...)` / `dynamic_rule_upsert(...)` / `dynamic_rule_delete(id)`
- [ ] 3.4 `pricing_lock(stay_id)`

## 4. Frontend — Cấu hình
- [x] 4.1 Page "Loại phòng & Cài đặt" → tab Rate Plans
- [x] 4.2 Form RatePlan với 5 nhóm tab: Cơ bản | Giờ | Phụ trội | Extra bed | USD
- [ ] 4.3 Step editor cho hourly_steps & surcharge (thêm/xóa hàng)
- [ ] 4.4 Page "Giá theo thời điểm" với list + form
- [ ] 4.5 DateRange + DayOfWeek picker + chế độ replace/add
- [ ] 4.6 Multi-room-type value editor

## 5. Frontend — Sử dụng
- [ ] 5.1 Check-in dialog gọi `pricing_preview` realtime
- [ ] 5.2 Hiển thị "Calculator panel" — break down từng line item
- [ ] 5.3 Pencil icon "Linh động giá" mở dialog override (clone rate_plan thành JSON editable)
- [ ] 5.4 Check-out dialog gọi `pricing_preview` lại với actual times
- [ ] 5.5 Hiển thị warning nếu late check-out vượt ngưỡng max → tính 100% giá ngày

## 6. Tests
- [x] 6.1 Unit test: tất cả case A1..A5 (motel) — a1_hourly_1h, a2, a3, a4_fallback
- [x] 6.2 Unit test: tất cả case B1..B3 (tourist) — b1_one_night, b2_three_nights
- [x] 6.3 Unit test: case C1, C2 (dynamic price) — c1_weekend_replace, c2_specific_date_add
- [x] 6.4 Unit test: case D1, D2 (hourly + dynamic) — d1_no_match, d2_outside_window
- [x] 6.5 Unit test: case E1 (extra bed)
- [x] 6.6 Unit test: case F1, F2 (override linh động) — f1_night_rate, f2_full_plan
- [x] 6.7 Unit test: case G1, G2, G3 (monthly)
- [x] 6.8 Property-based test: tổng line_items luôn = total
- [x] 6.9 Property-based test: pricing là idempotent (gọi 2 lần ra cùng kết quả)
- [x] 6.10 Vitest E2E check-in dialog với 5 case smoke (đã dựng test gate scaffold)

## 7. Docs
- [ ] 7.1 Cập nhật README "Key features → Pricing"
- [ ] 7.2 User guide markdown với tất cả 7 ví dụ từ SkyHotel
- [ ] 7.3 CHANGELOG entry
