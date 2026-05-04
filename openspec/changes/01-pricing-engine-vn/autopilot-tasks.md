# Autopilot Tasks — Pricing Engine VN (Remaining 11 Tasks)

> Generated: 2026-05-03 | Ready for autopilot dispatch
> Project: CapyInn (Tauri 2 + React 19 + Rust + SQLite)
> Root: /Volumes/Data/Hotel/CapyInn/mhm

## Status: 27/38 done — 11 remaining

---

## TASK 1: Backend — lock_pricing [2.12]
- [ ] 2.12 Snapshot/lock: `lock_pricing(stay_id) -> CalcOutput` lưu vào stay

## TASK 2: Backend — Tauri command pricing_lock [3.4]
- [ ] 3.4 `pricing_lock(stay_id)`

## TASK 3: Frontend — Step Editor [4.3]
- [ ] 4.3 Step editor cho hourly_steps & surcharge

## TASK 4: Frontend — Dynamic Pricing Page [4.4]
- [ ] 4.4 Page "Giá theo thời điểm" với list + form

## TASK 5: Frontend — DateRange + DayOfWeek picker [4.5]
- [ ] 4.5 DateRange + DayOfWeek picker + chế độ replace/add

## TASK 6: Frontend — Multi-room-type value editor [4.6]
- [ ] 4.6 Multi-room-type value editor

## TASK 7: Frontend — Check-in pricing preview [5.1]
- [ ] 5.1 Check-in dialog gọi `pricing_preview` realtime

## TASK 8: Frontend — Calculator panel [5.2]
- [ ] 5.2 Hiển thị "Calculator panel" — break down từng line item

## TASK 9: Frontend — Linh động giá [5.3]
- [ ] 5.3 Pencil icon "Linh động giá" mở dialog override

## TASK 10: Frontend — Checkout dialog [5.4 + 5.5]
- [ ] 5.4 Check-out dialog gọi `pricing_preview` lại với actual times
- [ ] 5.5 Warning nếu late check-out vượt ngưỡng max

## TASK 11: Vitest E2E [6.10]
- [ ] 6.10 Vitest E2E check-in dialog với 5 case smoke

## TASK 12: Documentation [7.1 + 7.2 + 7.3]
- [ ] 7.1 Cập nhật README "Key features → Pricing"
- [ ] 7.2 User guide markdown với tất cả 7 ví dụ từ SkyHotel
- [ ] 7.3 CHANGELOG entry

---

## Execution Order

Batch 1 (Parallel): TASK 1, TASK 3, TASK 12
Batch 2 (Parallel): TASK 2, TASK 5, TASK 6
Batch 3: TASK 4
Batch 4: TASK 7
Batch 5: TASK 8, TASK 10
Batch 6 (Parallel): TASK 9, TASK 11
