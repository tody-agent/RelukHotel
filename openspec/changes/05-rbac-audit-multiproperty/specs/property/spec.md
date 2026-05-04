# Delta for Property

## ADDED Requirements

### Requirement: Multi-Property Support
The system MUST support multiple properties per user account. Every business entity (room, folio, einvoice, etc.) MUST belong to exactly one property.

#### Scenario: Cross-property isolation
- GIVEN user U có role tại property A nhưng không có ở B
- WHEN U query rooms với current_property=B
- THEN trả lỗi 403 hoặc empty (tùy ngữ cảnh)
