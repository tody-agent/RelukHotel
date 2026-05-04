# Tasks — RBAC + Audit + Multi-Property

## 1. DB Migration
- [ ] 1.1 `0005_rbac_audit.sql` (property, role, permission, role_permission, app_user, user_property_role, audit_event)
- [ ] 1.2 Seed permission catalog (25+ codes)
- [ ] 1.3 ALTER tất cả bảng nghiệp vụ thêm property_id
- [ ] 1.4 Migrate dữ liệu cũ: tạo property "Default", set property_id cho mọi row
- [ ] 1.5 Tạo built-in role "Admin" (full perms), "Lễ tân" (8 perms cơ bản), "Kế toán"

## 2. Backend — Auth & RBAC
- [ ] 2.1 `auth_login(username, password)` → session token (in-memory)
- [ ] 2.2 `auth_session_extract` middleware cho mọi command
- [ ] 2.3 `require_permission(code)` helper
- [ ] 2.4 CRUD role + role_permission + user
- [ ] 2.5 `current_user_permissions(property_id)`

## 3. Backend — Audit
- [ ] 3.1 `audit::log(actor, action, entity, before, after)`
- [ ] 3.2 Macro `#[audited(action="...")]` (hoặc helper) gắn vào commands
- [ ] 3.3 `audit_query(filter)` với pagination
- [ ] 3.4 `audit_restore(event_id)` cho room/stay/folio merged

## 4. Backend — Multi-property
- [ ] 4.1 Mọi query thêm WHERE property_id = ?
- [ ] 4.2 `property_list()`, `property_create()`, `property_update()`
- [ ] 4.3 Session lưu current_property_id

## 5. Frontend
- [ ] 5.1 Login screen + remember session
- [ ] 5.2 Top bar dropdown chọn property
- [ ] 5.3 Page "Nhân viên > Người dùng" (CRUD)
- [ ] 5.4 Page "Nhân viên > Nhóm phân quyền" (role + matrix permission)
- [ ] 5.5 Page "Khách sạn > Nhật ký sử dụng" (audit log với filter)
- [ ] 5.6 Hide UI elements user không có quyền (vd ẩn nút "Sửa loại phòng")

## 6. Tests
- [ ] 6.1 Unit permission check 5 case
- [ ] 6.2 Integration: user no permission → 403
- [ ] 6.3 Integration: full audit chain (action → log → query → restore)
- [ ] 6.4 Multi-property isolation: user A của property A query → không thấy data B
- [ ] 6.5 Built-in role cannot be deleted

## 7. Docs
- [ ] 7.1 Permission catalog table trong docs
- [ ] 7.2 User guide phân quyền
- [ ] 7.3 CHANGELOG
