# Tasks — Shift & Cash

## 1. DB
- [ ] 1.1 Migration `0004_shift.sql`
- [ ] 1.2 ALTER payment thêm shift_id (nullable cho dữ liệu cũ)
- [ ] 1.3 Trigger: insert payment → set shift_id = active_shift của current_user

## 2. Backend
- [ ] 2.1 `shift_open(user_id, opening_balance)` 
- [ ] 2.2 `shift_get_active(user_id)`
- [ ] 2.3 `shift_compute_totals(shift_id)`
- [ ] 2.4 `shift_handover(from_shift, to_user, actual_count, variance_note)` (transaction)
- [ ] 2.5 `cash_movement_post(shift_id, kind, amount, note)`
- [ ] 2.6 `manager_withdraw(amount, by_user_id, password)` (verify password)
- [ ] 2.7 `shift_history(date_from, date_to)`

## 3. Frontend
- [ ] 3.1 Top bar đỏ "Giao ca, giao tiền" (như SkyHotel)
- [ ] 3.2 Dialog Handover với computed totals
- [ ] 3.3 Dialog "Giao tiền quản lý" với password
- [ ] 3.4 Page "Lịch sử giao ca" + filter
- [ ] 3.5 Page "Lịch sử giao tiền"
- [ ] 3.6 Settings: "Giao ca chỉ tiền mặt" flag

## 4. Tests
- [ ] 4.1 Unit compute_totals 4 case
- [ ] 4.2 Integration handover full flow
- [ ] 4.3 Test variance ±
- [ ] 4.4 Test config cash_only
- [ ] 4.5 Test concurrent open shift cùng user → error

## 5. Docs
- [ ] 5.1 User guide
- [ ] 5.2 CHANGELOG
