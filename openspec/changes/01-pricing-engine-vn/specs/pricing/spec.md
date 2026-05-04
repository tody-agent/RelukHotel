# Delta for Pricing

## ADDED Requirements

### Requirement: Multi-mode Rate Plan
The system MUST support per-room-type rate plans containing simultaneously up to 5 stay modes: Hourly, Night, Overnight, Monthly, plus Extra Bed surcharge.

#### Scenario: Motel typical config
- GIVEN một rate_plan có night_rate=350.000, overnight_rate=280.000, hourly steps {1h:80k, 2h:110k, 3h:140k, 4h:170k}, max_hours=6
- WHEN engine.calculate được gọi với stay 4h (mode Hourly)
- THEN line item "Tiền phòng (Giờ × 4)" = 170.000đ và total = 170.000đ

#### Scenario: Auto-fallback hourly to night
- GIVEN cùng rate_plan, max_hours=6
- WHEN khách ở 7h (vượt max_hours)
- THEN engine tự fallback Mode → Night, tính 1 night = 350.000đ

### Requirement: Time-based Surcharges
The system MUST support 4 separate surcharge configurations: early-checkin-day, early-checkin-night, late-checkout-day, late-checkout-night, each as a step function of hours, value being either fixed amount or percent of night_rate.

#### Scenario: Late checkout fixed amount
- GIVEN late_checkout_day = [{up_to:1, +30k}, {up_to:2, +60k}, {up_to:3, +90k}]
- WHEN khách ở 1 đêm và check-out muộn 2h
- THEN line "Phụ trội checkout muộn 2h" = 60.000đ

#### Scenario: Late checkout percent
- GIVEN late_checkout_day = [{up_to:3, 30%}, {up_to:6, 50%}], beyond=100%
- AND night_rate = 400.000đ
- WHEN khách check-out muộn 4h
- THEN phụ trội = 50% × 400.000 = 200.000đ

#### Scenario: Late checkout overflow → +1 night
- GIVEN cùng config trên, beyond=100% (max bracket = 6h, vượt 6h tính như 1 đêm thêm)
- WHEN khách check-out muộn 7h
- THEN engine cộng thêm 1 night thay vì 100% phụ trội (tham chiếu SkyHotel doc B3)

### Requirement: Extra Bed Calculation
The system MUST calculate extra bed surcharge as `(occupants - capacity) × extra_bed_per_person × nights` when occupants > capacity, otherwise 0. Extra bed only applies in Night/Overnight modes, NOT Hourly.

#### Scenario: 3 guests in double room (capacity 2)
- GIVEN rate_plan capacity=2, extra_bed_per_person=100k, night_rate=350k
- WHEN khách 3 người ở 2 đêm
- THEN total = (350k × 2) + (1 × 100k × 2) = 900.000đ

### Requirement: Dynamic Pricing Rules
The system MUST allow defining time-based price rules that overlay base rate plan, scoped by weekday-mask, hour-range, and/or specific dates, with strategy `replace` (set new value) or `add` (delta to base).

#### Scenario: Friday/Saturday overnight surcharge
- GIVEN một rule strategy=add, applies_to=overnight, weekday_mask = bit_F | bit_S, value = 50.000đ cho Standard
- AND khách Standard giá đêm gốc 280.000đ
- WHEN khách qua đêm thứ Sáu
- THEN giá đêm tính 280.000 + 50.000 = 330.000đ

#### Scenario: Hourly rule in late-night window
- GIVEN rule applies_to=hourly, hour_range 22:00–02:00, weekday=T2-T6, strategy=add, +20k/giờ
- WHEN khách ở 23:00 T2 → 01:00 T3 (2 giờ trong khung)
- THEN mỗi giờ trong khung +20k → adjustment = 40.000đ thêm vào tiền phòng cơ bản

### Requirement: Per-Stay Override (Linh động giá)
The system MUST allow front-desk users with `flexible_pricing` permission to override rate plan for one stay only, persisted as a JSON snapshot on the stay row, without affecting the master rate plan.

#### Scenario: Override at check-in
- GIVEN khách Agoda được giá đặc biệt 250k/đêm (gốc 350k)
- WHEN lễ tân click pencil icon → sửa night_rate thành 250k → "Áp dụng cho lượt này"
- THEN stay.rate_plan_override_json được lưu, calculate dùng override
- AND khi khách kế tiếp vào phòng đó, override KHÔNG còn (về giá gốc 350k)

### Requirement: Monthly Stay Modes
The system MUST support monthly billing with 2 residual modes: `per_day` (extra days × day_rate) or `full_month` (every month started counts as full month).

#### Scenario: Per-day residual
- GIVEN monthly_rate=6.000.000đ, residual_mode=per_day, day_rate=250k
- WHEN khách 12/01 → 20/02 (1 tháng + 8 ngày)
- THEN total = 6.000.000 + (8 × 250.000) = 8.000.000đ

#### Scenario: Full-month residual
- GIVEN cùng tham số nhưng residual_mode=full_month
- WHEN khách 12/01 → 20/02
- THEN total = 6.000.000 × 2 = 12.000.000đ

### Requirement: Pricing Lock
The system MUST allow locking the calculated total of a stay (e.g., when an e-invoice is issued), persisting `locked_total` and `locked_pricing_at`. Subsequent re-calculations MUST return the locked value, not recompute.

#### Scenario: Lock after e-invoice
- GIVEN stay đã check-out với total=520.000đ, đã phát hành HĐĐT
- WHEN engine.calculate được gọi lại sau đó
- THEN trả về locked_total=520.000đ kèm flag `is_locked: true`

## REMOVED Requirements

### Requirement: Single Night Rate per Room Type
(Deprecated. Thay bằng RatePlan đầy đủ. Migration sẽ tự convert.)
