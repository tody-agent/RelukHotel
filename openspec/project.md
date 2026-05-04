# CapyInn — Project Brief

## Vision
Trở thành PMS thay thế SkyHotel cho phân khúc mini-hotel/guesthouse Việt Nam, với 4 lợi thế cạnh tranh:
1. **Local-first**: dữ liệu khách không lên cloud (privacy + chạy offline).
2. **OCR CCCD tự động**: lễ tân không phải gõ tay.
3. **Trả 1 lần dùng mãi**: không SaaS subscription.
4. **Mở để tự động hóa** (MCP + n8n + Zalo).

## Strategic Roadmap (6 Changes)
| # | Change | Mục tiêu | Ưu tiên |
|---|---|---|---|
| 01 | pricing-engine-vn | Tính tiền giống SkyHotel: giờ/đêm/ngày/tháng + 4 phụ trội + giá theo thời điểm + extra bed | 🔴 BLOCKER |
| 02 | front-desk-pos-and-folio | Bán nước/dịch vụ tại quầy, hóa đơn dịch vụ độc lập, ký gửi liên phòng, trả lại dịch vụ | 🔴 BLOCKER |
| 03 | einvoice-vn-integration | Tích hợp MISA meInvoice + Viettel SInvoice phát hành HĐĐT khi check-out / tại quầy | 🔴 BLOCKER PHÁP LÝ |
| 04 | shift-cash-management | Giao ca + giao tiền quản lý + chênh lệch + lịch sử | 🟠 HIGH |
| 05 | rbac-audit-multiproperty | Phân quyền chi tiết, audit log, multi-property | 🟠 HIGH |
| 06 | windows-printing-hardware | Windows first-class, ESC/POS 80mm, khóa từ, bộ điều khiển điện | 🟡 MEDIUM |

## Definition of Done cho mỗi change
- ✅ Tất cả `tasks.md` checked.
- ✅ Unit tests cargo & vitest pass; Clippy zero warning.
- ✅ Đối chiếu acceptance scenarios trong `specs/` đều pass thủ công với UI.
- ✅ Migration đã chạy thành công trên DB cũ (không mất dữ liệu).
- ✅ README + CHANGELOG cập nhật.

## Non-goals (giai đoạn này)
- Channel Manager (Agoda/Booking sync) — để giai đoạn sau.
- Mobile native app cho khách — để giai đoạn sau.
- Báo cáo kế toán đầy đủ chuẩn TT200 — giai đoạn sau.
