# Delta for POS

## ADDED Requirements

### Requirement: Walk-in Retail Sale
The system MUST allow a cashier to create a retail folio (no room linkage), add service lines, accept payment, and print a receipt — all without requiring guest data.

#### Scenario: Quick walk-in
- GIVEN cashier mở POS, tồn kho Coca=10
- WHEN cashier nhấn hotkey F1 (Đồ uống) → click "Coca" 2 lần → "Tiền mặt 30.000"
- THEN folio kind=retail tạo ra, 1 service_line Coca×2 unit_price=15000, payment=30000, folio.status=closed
- AND inventory_movement kind=out qty=2 với ref_id=service_line.id
- AND tồn Coca = 8

### Requirement: Service Inventory Tracking
The system MUST decrement inventory automatically when a `track_inventory` service is sold, and increment when a return (negative qty) is posted. Internal_only services MUST NOT appear in POS catalog.

#### Scenario: Auto decrement on sale
- GIVEN service "Coca" track_inventory=1, balance=5
- WHEN add service_line qty=2
- THEN balance = 3, có movement out qty=2

#### Scenario: Hide internal-only
- GIVEN service "Bàn chải" internal_only=1
- WHEN gọi `pos_search_service("bàn")`
- THEN không trả "Bàn chải"

### Requirement: Low Stock Warning
The system SHALL surface a low-stock warning chip on dashboard for any service where `inventory_balance < threshold.low_warn`.

#### Scenario: Below threshold
- GIVEN Coca balance=4, threshold=10
- WHEN dashboard render
- THEN có chip "Coca: 4/10 ⚠️"

### Requirement: Negative Quantity Return
The system MUST allow posting a service_line with negative qty to represent a guest returning a previously charged service. Inventory increments accordingly.

#### Scenario: Return one Coca
- GIVEN folio F1 đã có service_line Coca qty=3
- WHEN add line Coca qty=-1
- THEN folio subtotal_service = 2 × 15000 = 30000
- AND tồn Coca tăng 1
