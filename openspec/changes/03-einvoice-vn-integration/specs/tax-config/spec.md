# Delta for Tax Config

## ADDED Requirements

### Requirement: VAT Rate per Service & Room Type
The system MUST allow configuring VAT rate (0%, 5%, 8%, 10%) per service and per room_type. Default room VAT = 5%, default service VAT = 8% (current VN policy as of 2025; admin can change).

#### Scenario: Configure phở 8% (NĐ giảm thuế)
- GIVEN service "Phở bò"
- WHEN admin sửa VAT thành 8%
- THEN service_line tạo từ "Phở bò" có vat_rate=8 mặc định

### Requirement: Buyer Tax Code Validation
The system MUST validate Vietnamese tax codes: exactly 10 digits OR 10-3 digits (XXXXXXXXXX-XXX format), and warn user before submitting if invalid.

#### Scenario: Invalid MST
- GIVEN user nhập MST "12345"
- WHEN click submit
- THEN warning: "MST không hợp lệ — phải có 10 hoặc 14 ký tự"
