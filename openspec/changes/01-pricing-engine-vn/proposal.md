# Proposal: Pricing Engine VN (parity với SkyHotel)

## Why
CapyInn hiện tại chỉ có pricing đơn giản theo "night rate × số đêm". Đây là lý do số 1 khiến CapyInn KHÔNG thay thế được SkyHotel cho khách sạn VN — vì khách sạn VN thực tế bán đồng thời nhiều hình thức trên cùng 1 phòng:

1. **Khách giờ** (rest, motel-style): 1h:80k, 2h:100k, mỗi giờ tiếp +20k.
2. **Qua đêm**: từ 21h hôm nay đến 12h hôm sau.
3. **Theo ngày** (Night): 12h–12h hôm sau.
4. **Theo tháng**: chu kỳ ngày-này-tháng-này → ngày-này-tháng-sau.
5. **Phụ trội** check-in sớm + check-out muộn (với cả ngày và đêm), tính theo tiền hoặc % giá đêm.
6. **Extra bed**: vượt số người tiêu chuẩn → phụ thu × số người vượt × số đêm.
7. **Giá theo thời điểm** (peak/lễ Tết): replace hoặc add lên giá gốc, theo khung giờ + ngày trong tuần + ngày cụ thể.
8. **Giá mẫu** (Agoda, Booking, Mytour) áp nhanh khi check-in.

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/bat-dau-su-dung-va-cai-dat-ks/cai-dat-gia-phong-loai-phong
- https://hotro.skyhotel.vn/docs/bat-dau-su-dung-va-cai-dat-ks/gia-theo-thoi-diem
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/chinh-sua-gia-ban-phong

## What Changes
- Thiết kế lại schema DB theo "Rate Plan" pattern thay vì "rate per room".
- Xây Rust crate `capyinn-pricing` thuần, có 100% unit test.
- UI: trang "Loại phòng & Cài đặt" mới cho phép cấu hình đầy đủ 5 hình thức + 4 phụ trội.
- UI: trang "Giá theo thời điểm" và "Giá mẫu".
- UI: ô "Linh động giá" (pencil icon) tại check-in.

## Scope
**In scope:**
- Tính tiền cho 1 lượt khách (1 booking 1 phòng 1 lần lưu trú).
- Tính cộng dồn cho group booking (mỗi phòng 1 stay, gom lại folio).
- Cấu hình + áp dụng giá theo thời điểm.
- Ô linh động giá (override 1 stay).

**Out of scope (cho change này):**
- HĐĐT (xem change 03).
- Yield management AI (gợi ý giá tự động) — tương lai.
- Lịch âm cho ngày lễ (chỉ làm dương lịch trước, lịch âm để v2).

## Approach
- Pure-function pricing engine viết bằng Rust, input là `(RatePlan, Stay, ServiceLines, DynamicRules, Now)` → output là `Folio { line_items, subtotal, discount, total }`.
- Engine được expose qua Tauri command `pricing.preview` để FE dùng cả khi check-in (preview) lẫn check-out (chốt).
- Quyết định: KHÔNG cache giá vào DB tại check-in — luôn tính lại tại check-out theo `actual_check_out_time`. Lý do: nếu khách check-out trễ 2h thì pricing phải reflect, nếu cache thì phải invalidate phức tạp.
- Tuy nhiên có cơ chế `pricing.lock(stay_id)` để chốt giá khi cần (dùng cho HĐĐT đã phát hành).

## Acceptance Scenarios (đối chiếu SkyHotel)

### A. KS thông thường (mini hotel/motel)
**Cấu hình phòng đơn:**
- Giá ngày: 350.000đ
- Giá qua đêm: 280.000đ
- Giờ: 1h=80k, mỗi giờ +30k, max 6h, qua h7 tính giá ngày
- Phụ trội checkin sớm/checkout muộn (cả ngày và đêm): mỗi tiếng +30k

**Test cases:**
- A1: Vào 09:00 ra 13:00 → 4h × giá giờ = 1h:80k + 2h:110k + 3h:140k + 4h:170k = `170.000đ`
- A2: Vào 12:00 ra 12:00 hôm sau → 1 night = `350.000đ`
- A3: Vào 12:00 ra 14:00 hôm sau → 1 night + 2h late = `350.000 + 60.000 = 410.000đ`
- A4: Vào 21:00 ra 12:00 hôm sau → 1 overnight = `280.000đ`
- A5: Vào 19:00 (sớm 2h so với 21:00) ra 12:00 hôm sau → 1 overnight + 2h early = `280.000 + 60.000 = 340.000đ`

### B. KS du lịch
**Cấu hình phòng Standard:**
- Giá ngày: 400.000đ
- Check-in sớm: free
- Check-out muộn: 12-15h: 30%, 15-18h: 50%, sau 18h: 100% giá ngày

**Test cases:**
- B1: Vào 10:00 ra 12:00 hôm sau → 1 night = `400.000đ`
- B2: Vào 12:00 ra 14:00 hôm sau → 1 night + 30% late = `400.000 + 120.000 = 520.000đ`
- B3: Vào 12:00 ra 19:00 hôm sau → 2 nights (vì >18h tính 100%) = `800.000đ`

### C. Giá theo thời điểm
**Quy định:** Đêm T6, T7 cộng thêm 50.000đ vào Standard, 70.000đ vào Superior.
- C1: Khách Standard ở đêm thứ Sáu → `(400 + 50) = 450.000đ`
- C2: Khách Standard ở 2 đêm T5+T6 → `400 + 450 = 850.000đ`

### D. Khách giờ + giá theo thời điểm khung 22h–02h sáng
- D1: Vào 23:00 T2, ra 01:00 T3 → 2h = `100k + (20k × 2)` (T2-T6 quy định +20k/giờ trong khung) = `140.000đ`
- D2: Vào 23:00 T7, ra 01:00 CN → 2h = `100k + (30k × 2)` = `160.000đ`

### E. Extra bed
**Cấu hình:** Phòng đôi capacity 2, extra bed 100k/người/đêm.
- E1: 3 người ở 2 đêm 1 phòng đôi 350k/đêm → `700k + (1 × 100k × 2) = 900.000đ`

### F. Linh động giá (override)
- F1: Phòng đôi 350k/đêm; lễ tân override còn 250k/đêm cho khách Agoda → tính theo 250k.
- F2: Sau khi khách check-out, phòng quay về giá gốc 350k cho khách kế tiếp.

### G. Giá theo tháng
**Cấu hình:** Tháng 6.000.000đ, sau đủ tháng tính theo ngày 250k.
- G1: Khách 12/01 → 12/02 → 1 tháng = `6.000.000đ`
- G2: Khách 12/01 → 20/02 → 1 tháng + 8 ngày × 250k = `8.000.000đ`
- G3: Chế độ "đủ tháng": 12/01 → 20/02 → 2 tháng = `12.000.000đ`

## Migration Plan
- Migration `001_pricing_engine_v2.sql` thêm bảng mới (xem design.md), KHÔNG drop bảng cũ.
- Script migrate dữ liệu cũ: convert `room_type.night_rate` → `rate_plan` cơ bản với `night_rate` only, các field khác null. Khách sạn sẽ vào UI cập nhật dần.

## Risks
- **Sai số học**: tính tiền sai 1.000đ là khách sạn mất niềm tin. → Mitigation: phủ unit test 100+ case, có "calculator audit panel" trong UI hiển thị từng dòng cộng/trừ.
- **Performance**: pricing.preview gọi mỗi lần user thay đổi UI có thể chậm. → Mitigation: pricing engine pure & nhanh (<5ms/call), throttle FE 200ms.
- **Edge case timezone**: VN UTC+7, không DST → tương đối đơn giản, nhưng phải lock TZ ở DB (TEXT ISO 8601 với offset).
