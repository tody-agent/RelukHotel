# Proposal: RBAC chi tiết + Audit Log + Multi-Property

## Why
SkyHotel có 25+ permissions chi tiết và 1 tài khoản admin có thể quản nhiều khách sạn. Đây là yêu cầu:
- Khách sạn có nhiều phân hệ (kế toán, lễ tân, quản lý) cần phân quyền chi tiết.
- Chủ chuỗi 2-5 khách sạn (rất phổ biến ở VN) cần multi-property trong 1 app.
- Audit log để truy vết: ai sửa giờ check-in, ai xóa hóa đơn, ai phát hành HĐĐT...

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/bat-dau-su-dung-va-cai-dat-ks/cai-dat-nhom-phan-quyen
- https://hotro.skyhotel.vn/docs/huong-dan-khac/xu-ly-thao-tac-sai

## What Changes
- Schema `role`, `permission`, `role_permission`, `user_role` (per property).
- 25+ permission codes mapping nghiệp vụ.
- Mọi mutation Tauri command kiểm tra permission của caller.
- Audit log table `audit_event` ghi: actor, action, entity_type, entity_id, before_json, after_json, ts.
- Multi-property: `property` table; user có thể link nhiều property; selector trên top bar.

## Permission Catalog (parity SkyHotel)
| Code | Nghĩa |
|---|---|
| floor_plan_edit | Sửa sơ đồ |
| room_type_edit | Sửa loại phòng |
| rate_template_edit | Sửa giá mẫu |
| dynamic_price_edit | Sửa giá theo thời điểm |
| service_inventory_edit | Sửa dv & kho |
| pricing_config_edit | Cài đặt cách tính tiền |
| invoice_delete | Xóa HĐ + khách hàng |
| report_export | Tải báo cáo Excel |
| revenue_view | Xem doanh thu |
| analytics_view | Xem phân tích biểu đồ |
| ar_view | Công nợ + phiếu thu |
| expense_manage | Quản lý chi phí |
| pl_view | Kết quả kinh doanh |
| account_check | Kiểm tra $ tài khoản |
| guest_list_view | DS khách hàng |
| cash_history_view | Lịch sử giao tiền |
| shift_history_view | Lịch sử giao ca |
| flexible_pricing | Linh động giá phòng |
| edit_checkin_time | Sửa giờ check-in |
| audit_log_view | Nhật ký sử dụng |
| occupancy_view | Hiện trạng phòng |
| consigned_invoice_delete | Xóa dv/HĐ ký gửi |
| service_return | Trả lại dịch vụ |
| flexible_service_price | Linh động giá dịch vụ |
| einvoice_issue | Phát hành HĐĐT |
| einvoice_cancel | Hủy HĐĐT |
| cash_manager_withdraw | Rút tiền quầy |

## Acceptance Scenarios

### A. Tạo role & assign
- A1: Admin tạo role "Lễ tân" với 8 permission cơ bản (occupancy_view, guest_list_view, flexible_pricing, ...). Gán cho user "Mai" tại property "Hotel Hoa Mai".

### B. Permission check
- B1: User "Mai" (Lễ tân) cố sửa rate_plan → từ chối "Bạn không có quyền".
- B2: Admin sửa rate_plan → OK.

### C. Audit log
- C1: User "Hoa" sửa giờ check-in phòng 101 từ 14:00 → 12:00 → audit_event ghi {actor:Hoa, action:'edit_checkin_time', entity:'stay#abc', before:{check_in:14:00}, after:{check_in:12:00}}.

### D. Multi-property switch
- D1: User là admin của Hotel A và Hotel B. Dropdown top bar chọn → toàn bộ data đổi context.
- D2: Báo cáo doanh thu có option "All properties" / "Hotel A" / "Hotel B".

### E. Restore from audit
- E1: Phòng 101 bị xóa nhầm → vào "Nhật ký" → tìm action='room_delete' → click "Khôi phục" → phòng được phục hồi từ before_json.
