# Delta for Inventory

## ADDED Requirements

### Requirement: Movement Audit Trail
The system MUST record every inventory change as a movement row with kind in {in, out, adjust, return}, immutable. Balance is computed = SUM(qty * direction) per service.

#### Scenario: Audit chain
- GIVEN nhập 100 Coca → bán 30 → trả lại 2 → kiểm kê điều chỉnh -1
- THEN movements gồm 4 dòng (in 100, out 30, return 2, adjust -1)
- AND balance = 100 - 30 + 2 - 1 = 71

### Requirement: FIFO Cost Tracking
The system SHOULD track unit_cost per `in` movement and compute weighted-average cost for reporting (báo cáo bình quân gia quyền tham chiếu SkyHotel).

#### Scenario: Avg cost
- GIVEN nhập 50 Coca @ 12.000 + 50 Coca @ 14.000
- WHEN báo cáo cost
- THEN avg = (50*12000 + 50*14000)/100 = 13.000
