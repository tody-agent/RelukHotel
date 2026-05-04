# Delta for Folio

## ADDED Requirements

### Requirement: Folio as Container
The system MUST treat Folio as the single financial container for any group of charges. A folio MAY contain 0..n stays, 0..n service_lines, 0..n payments. A stay MUST belong to exactly one folio.

### Requirement: Folio Transfer (Ký gửi liên phòng)
The system MUST allow merging an open folio into another open folio. After merge: source folio status=merged with merged_into_id pointing to destination; all service_lines, payments, and stays of source are reassigned to destination; destination totals refreshed.

#### Scenario: Family transfer at check-out
- GIVEN folio F1 (room 101) total=500.000, F2 (room 102) total=300.000, both open
- WHEN trả phòng 102, chọn "Ký gửi vào 101"
- THEN F2.status=merged, F2.merged_into_id=F1, F1.total=800.000
- AND room 102 trạng thái dirty (chưa dọn)

### Requirement: Folio Status Transitions
The system MUST enforce valid status transitions:
- `open` → `closed` (khi balance=0 và không còn stay đang ở)
- `open` → `merged` (khi merge sang folio khác)
- `closed` → (terminal)
- `merged` → (terminal)

#### Scenario: Cannot close with non-zero balance
- GIVEN folio F1 total=500.000, paid=300.000, balance=200.000
- WHEN gọi folio_close(F1) without "đưa vào công nợ"
- THEN trả lỗi "Folio còn nợ 200.000đ"
