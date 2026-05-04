# Delta for Room Type

## MODIFIED Requirements

### Requirement: Room Type Pricing Linkage
The system SHALL allow each room_type to be linked to one or more rate_plans, with exactly one marked as `is_default=1`. The default rate plan is used for stays where no plan is explicitly chosen.

#### Scenario: Default rate plan
- GIVEN room_type "Standard" có 2 rate plans: "Default" (is_default=1) và "Agoda"
- WHEN tạo stay không chọn rate plan
- THEN engine dùng "Default"

#### Scenario: Channel rate plan via template
- GIVEN room_type "Standard" có rate plan "Agoda"
- WHEN lễ tân chọn template "Agoda" tại check-in
- THEN engine dùng plan Agoda thay vì Default
