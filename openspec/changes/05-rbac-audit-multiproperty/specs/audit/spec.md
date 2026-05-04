# Delta for Audit

## ADDED Requirements

### Requirement: Comprehensive Audit Trail
The system MUST log every mutation with `audit_event` containing actor, action, entity_type, entity_id, before_json, after_json, occurred_at.

### Requirement: Restore from Audit
The system MUST support restoring deleted entities (room, stay) and reverting merged folios from audit events that contain valid before_json.

#### Scenario: Restore deleted room
- GIVEN audit event action='room.delete' với before_json hợp lệ
- WHEN admin click "Khôi phục"
- THEN room được tạo lại với cùng id + thuộc tính
- AND audit event mới 'audit.restore' ghi nhận
