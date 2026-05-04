# Delta for Shift

## ADDED Requirements

### Requirement: Shift Lifecycle
The system MUST track work shifts per cashier. Opening a shift records `cash_in_at_open`. Closing computes totals and records `cash_actual_count` + `variance`. Each user MUST have at most one open shift at a time.

#### Scenario: Open shift
- GIVEN user A chưa có shift mở
- WHEN A đăng nhập + xác nhận opening_balance=880.000đ
- THEN shift mở với cash_in_at_open=880000

#### Scenario: Cannot open second shift
- GIVEN user A đang có shift mở
- WHEN gọi shift_open(A, ...) lần 2
- THEN trả lỗi "User đã có ca đang mở"

### Requirement: Handover Computes System Total
On handover, the system MUST compute `system_total = opening + collected - withdraws - expenses`. Cashier inputs `cash_actual_count`. `variance = actual - system`.

#### Scenario: Standard handover
- GIVEN shift opening=880k, collected=3640k, withdraws=4000k
- WHEN compute totals
- THEN system_total = 520.000đ

#### Scenario: With variance
- GIVEN system_total=520.000đ, cashier đếm két = 510.000đ
- WHEN handover
- THEN variance = -10.000đ, lưu kèm note bắt buộc

### Requirement: Manager Withdraw
The system MUST allow a user with `cash_manager_withdraw` permission to withdraw cash from drawer, recorded as cash_movement kind=manager_withdraw with negative amount, password-verified.

#### Scenario: Manager takes 4M
- GIVEN shift đang mở, balance=4.520.000đ
- WHEN manager withdraw 4.000.000 với password
- THEN cash_movement -4.000.000 lưu, system_total còn 520.000đ
