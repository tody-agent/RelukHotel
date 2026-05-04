# Delta for RBAC

## ADDED Requirements

### Requirement: Permission-Based Access Control
The system MUST guard every mutation Tauri command with explicit permission check. Read-only commands MAY skip checks but list/detail commands MUST scope by property_id of current session.

### Requirement: Built-in Roles
The system MUST seed 3 built-in roles per property on creation: Admin (all perms), Lễ tân (8 default perms), Kế toán (report perms). Built-in roles MUST NOT be deletable.

### Requirement: Custom Roles
The system MUST allow admins to create custom roles with arbitrary permission combinations.

#### Scenario: Custom role
- GIVEN admin tạo role "Quản lý ca đêm" với perms {occupancy_view, flexible_pricing, einvoice_issue, shift_history_view}
- WHEN gán cho user
- THEN user có đúng 4 quyền đó
