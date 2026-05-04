# Autopilot Context — Self-Contained Task Prompts

> Each TASK section below contains ALL context needed for an AI agent that CANNOT access the filesystem.

## TASK 1: Backend — lock_pricing(stay_id) [2.12]

**Goal:** Implement `lock_pricing` — snapshot pricing at a point in time for invoice integrity.

**File to create/edit:** `mhm/src-tauri/src/commands/pricing.rs` (append after line 402)

**Existing CalcOutput type** (in `mhm/src-tauri/crates/pricing/src/stay.rs`):
```rust
pub struct CalcOutput {
    pub line_items: Vec<LineItem>,
    pub room_subtotal: u64,
    pub currency: String,
}
pub struct LineItem {
    pub description: String,
    pub amount: u64,
}
```

**DB columns already exist on `stay` table:**
```sql
ALTER TABLE stay ADD COLUMN locked_pricing_at TEXT;
ALTER TABLE stay ADD COLUMN locked_total INTEGER;
ALTER TABLE stay ADD COLUMN rate_plan_id TEXT REFERENCES rate_plan(id);
ALTER TABLE stay ADD COLUMN rate_plan_override_json TEXT;
ALTER TABLE stay ADD COLUMN occupants INTEGER NOT NULL DEFAULT 1;
```

**Implementation:**
```rust
/// Lock pricing for a stay — prevents recalculation after invoice.
/// 1. Load stay (check_in, check_out, rate_plan_id, occupants, rate_plan_override_json)
/// 2. If stay.locked_pricing_at IS NOT NULL → return error "Already locked"
/// 3. Load rate_plan (or parse override JSON)
/// 4. Load dynamic_price_rules for property
/// 5. Build CalcInput, call pricing::calc::calculate()
/// 6. UPDATE stay SET locked_total = result.room_subtotal, locked_pricing_at = datetime('now')
/// 7. Return CalcOutput as JSON
#[tauri::command]
pub async fn pricing_lock(
    state: State<'_, AppState>,
    stay_id: String,
) -> Result<serde_json::Value, String> {
    // Implementation here
}
```

**Also register in** `mhm/src-tauri/src/lib.rs` invoke_handler list.

**Acceptance:** `invoke("pricing_lock", { stayId: "xxx" })` → returns `{ line_items, room_subtotal, currency }` or error string.

---

## TASK 2: Backend — Tauri command pricing_lock [3.4]

**(Merged into TASK 1 — same implementation. TASK 2 is the Tauri wrapper around lock logic.)**

**If TASK 1 already created the `#[tauri::command] pricing_lock`, then TASK 2 only needs:**
1. Register `pricing_lock` in `mhm/src-tauri/src/lib.rs` invoke_handler
2. Test: unit test that calls the function with a mock DB

---

## TASK 3: Frontend — Step Editor for hourly_steps & surcharge [4.3]

**Goal:** Reusable `StepEditor` React component for managing step-function pricing tables.

**File to create:** `mhm/src/pages/settings/rate_plans/StepEditor.tsx`
**File to edit:** `mhm/src/pages/settings/rate_plans/RatePlanForm.tsx`

**Current RatePlanForm has placeholder tabs** (line 97-111):
```tsx
{/* TAB: GIÁ GIỜ */}
<TabsContent value="hourly" className="pt-4 space-y-4">
  <div className="bg-muted/50 p-4 rounded-md border text-sm text-muted-foreground mb-4">
    Thiết lập bảng giá bậc thang...
  </div>
  {/* Sẽ implement Dynamic Step Editor ở đây */}
  <Button variant="outline" className="w-full border-dashed gap-2">
    <Plus className="w-4 h-4" /> Thêm mốc giờ mới
  </Button>
</TabsContent>

{/* TAB: PHỤ TRỘI */}
<TabsContent value="surcharge" className="pt-4">
  <p className="text-sm text-muted-foreground mb-4">...</p>
  {/* Cấu trúc tương tự Step Editor */}
</TabsContent>
```

**StepEditor component spec:**
```tsx
// Props
interface HourlyStep { hour: number; price: number; }
interface SurchargeStep { up_to_hours: number; value_type: "amount" | "percent"; value: number; }

interface StepEditorProps {
  type: "hourly" | "surcharge";
  steps: HourlyStep[] | SurchargeStep[];
  onChange: (steps: any[]) => void;
  maxHours?: number;
  onMaxHoursChange?: (v: number) => void;
}
```

**UI requirements:**
- Table with rows: each row = 1 step with Trash2 icon to delete
- "Thêm mốc" button at bottom (Plus icon, border-dashed)
- For hourly: 2 columns [Giờ thứ | Giá VND]
- For surcharge: 3 columns [Tối đa (giờ) | Loại (Số tiền/%) | Giá trị]
- Validation: hours must be ascending, values > 0
- shadcn/ui: `import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";`
- Icons: `import { Plus, Trash2 } from "lucide-react";`

---

## TASK 4: Frontend — Dynamic Pricing Page [4.4]

**Goal:** Settings page to manage `dynamic_price_rule` records.

**File to create:** `mhm/src/pages/settings/DynamicPricingSection.tsx`
**File to edit:** `mhm/src/pages/settings/index.tsx` — add import and tab

**Backend commands already exist:**
```typescript
// List all rules
const rules = await invoke<DynamicRule[]>("dynamic_rule_list", { propertyId });

// Create/update
await invoke("dynamic_rule_upsert", {
  id: null, // null = create, string = update
  propertyId, name, appliesTo, strategy,
  weekdayMask, specificDatesJson, hourStart, hourEnd,
  activeFrom, activeTo, enabled
});

// Delete
await invoke("dynamic_rule_delete", { ruleId });
```

**DB schema reference:**
```sql
CREATE TABLE dynamic_price_rule (
  id TEXT PRIMARY KEY, property_id TEXT NOT NULL,
  name TEXT NOT NULL,
  applies_to TEXT NOT NULL CHECK(applies_to IN ('night','overnight','hourly','late_day','late_night','early_day','early_night')),
  strategy TEXT NOT NULL CHECK(strategy IN ('replace','add')),
  weekday_mask INTEGER NOT NULL DEFAULT 127, -- bit 0=Mon..6=Sun
  specific_dates_json TEXT,
  hour_start INTEGER, hour_end INTEGER,
  active_from TEXT, active_to TEXT,
  enabled INTEGER NOT NULL DEFAULT 1
);
```

**UI:** Card list of rules, each showing name + applies_to + strategy + weekday badges + enabled toggle. "Thêm quy tắc mới" button opens form dialog. Uses TASK 5 pickers.

---

## TASK 5: Frontend — DateRange + DayOfWeek picker [4.5]

**Goal:** 2 reusable picker components for Dynamic Pricing form.

**Files to create:**
- `mhm/src/components/shared/DayOfWeekPicker.tsx`
- `mhm/src/components/shared/DateRangePicker.tsx`

**DayOfWeekPicker:**
```tsx
interface DayOfWeekPickerProps {
  value: number; // bitmask 0-127
  onChange: (mask: number) => void;
}
// UI: 7 toggle buttons [T2 T3 T4 T5 T6 T7 CN]
// Active: bg-blue-500 text-white rounded-full w-9 h-9
// Inactive: bg-slate-100 text-slate-600
// Click toggles bit: mask ^ (1 << dayIndex)
```

**DateRangePicker:**
```tsx
interface DateRangePickerProps {
  from: string | null; // ISO date or null
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
}
// UI: 2x input[type=date] + checkbox "Không giới hạn" (sets null)
```

---

## TASK 6: Frontend — Multi-room-type value editor [4.6]

**Goal:** Editor for `dynamic_price_rule_value` — different price per room type per rule.

**File to create:** `mhm/src/pages/settings/RoomTypeValueEditor.tsx`

**Data:** `dynamic_price_rule_value` table: (rule_id, room_type_id, value INTEGER)

```tsx
interface RoomTypeValueEditorProps {
  ruleId: string;
  strategy: "replace" | "add";
  values: Array<{ room_type_id: string; room_type_name: string; value: number }>;
  onChange: (values: Array<{ room_type_id: string; value: number }>) => void;
}
// UI: Table [Loại phòng (label) | Giá trị VND (input)]
// Load room types via invoke("get_room_types")
// Label explains: Replace = giá thay thế, Add = delta cộng thêm
```

---

## TASK 7: Frontend — Check-in pricing preview [5.1]

**Goal:** Replace hardcoded `base_price * nights` in CheckinSheet with real-time pricing engine call.

**File to edit:** `mhm/src/components/CheckinSheet.tsx`

**Current code (line 121-125):**
```tsx
const vacantRooms = rooms.filter((r) => r.status === "vacant");
const selectedRoomData = rooms.find((r) => r.id === selectedRoom);
const totalPrice = selectedRoomData
    ? selectedRoomData.base_price * nights
    : 0;
```

**Replace with:**
```tsx
const [pricingPreview, setPricingPreview] = useState<{
  line_items: Array<{ description: string; amount: number }>;
  room_subtotal: number;
  currency: string;
} | null>(null);
const [pricingMode, setPricingMode] = useState("auto");

useEffect(() => {
  if (!selectedRoom || !selectedRoomData) { setPricingPreview(null); return; }
  const timer = setTimeout(async () => {
    try {
      const now = new Date();
      const checkOut = new Date(now.getTime() + nights * 86400000);
      const result = await invoke("calculate_price_v2", {
        roomTypeId: selectedRoomData.type,
        checkIn: now.toISOString(),
        checkOut: checkOut.toISOString(),
        occupants: guests.length,
        mode: pricingMode === "auto" ? null : pricingMode,
      });
      setPricingPreview(result);
    } catch { setPricingPreview(null); }
  }, 200); // debounce
  return () => clearTimeout(timer);
}, [selectedRoom, nights, guests.length, pricingMode]);

const totalPrice = pricingPreview?.room_subtotal ?? 0;
```

**Also add mode selector dropdown in footer** (before total display):
```tsx
<select value={pricingMode} onChange={e => setPricingMode(e.target.value)}>
  <option value="auto">Tự động</option>
  <option value="hourly">Theo giờ</option>
  <option value="overnight">Qua đêm</option>
  <option value="night">Theo ngày</option>
  <option value="monthly">Theo tháng</option>
</select>
```

---

## TASK 8: Frontend — Calculator panel breakdown [5.2]

**Goal:** Show line-item breakdown in CheckinSheet footer.

**File to edit:** `mhm/src/components/CheckinSheet.tsx`

**Replace the total display block** (line 447-456) with:
```tsx
{pricingPreview && (
  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
    {pricingPreview.line_items.map((item, i) => (
      <div key={i} className="flex justify-between text-xs text-brand-muted">
        <span>{item.description}</span>
        <span className="tabular-nums">{fmtMoney(item.amount)}</span>
      </div>
    ))}
    <div className="border-t border-slate-200 pt-1.5 flex justify-between">
      <span className="text-sm font-bold text-brand-text">Tổng cộng</span>
      <span className="text-base font-bold text-emerald-600 tabular-nums">
        {fmtMoney(pricingPreview.room_subtotal)}
      </span>
    </div>
  </div>
)}
```

`fmtMoney` is already imported from `@/lib/format`.

---

## TASK 9: Frontend — Pencil icon "Linh động giá" [5.3]

**Goal:** Allow front-desk staff to override rate_plan for a single stay.

**File to edit:** `mhm/src/components/CheckinSheet.tsx`

**Business rule (Decision 3):** Override = deep-clone rate_plan as JSON. Changes to base rate_plan do NOT affect stays with override. Stored in `stay.rate_plan_override_json`.

**Implementation:**
1. Add state: `const [overrideJson, setOverrideJson] = useState<string | null>(null)`
2. Add `<Pencil>` icon next to calculator panel title
3. Click opens a Dialog with editable fields: night_rate, overnight_rate, hourly steps
4. On confirm: serialize to JSON, set overrideJson state
5. Pass overrideJson to `calculate_price_v2` call (add `overrideJson` param)
6. On CheckIn submit: include overrideJson in checkIn payload → saved to stay.rate_plan_override_json

**Icon:** `import { Pencil } from "lucide-react";`

---

## TASK 10: Frontend — Checkout dialog pricing [5.4 + 5.5]

**Goal:** Integrate pricing_preview into CheckoutSettlementModal with late checkout warning.

**File to edit:** `mhm/src/components/CheckoutSettlementModal.tsx`

**Current code (line 62):** calls `preview_checkout_settlement`

**Replace with:** call `calculate_price_v2` using actual checkout time (now):
```typescript
const actualCheckout = new Date().toISOString();
const pricingResult = await invoke("calculate_price_v2", {
  roomTypeId: booking.room_type,
  checkIn: booking.check_in,
  checkOut: actualCheckout,
  occupants: booking.occupants || 1,
  mode: null, // auto
});
```

**Add warning banner** when checkout hour > 18:
```tsx
{new Date().getHours() > 18 && (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm font-medium">
    ⚠️ Checkout muộn sau 18:00 — hệ thống tính 100% giá ngày tiếp theo
  </div>
)}
```

**Show line_items breakdown** (same pattern as TASK 8).

---

## TASK 11: Vitest E2E check-in dialog [6.10]

**Goal:** 5 smoke tests for CheckinSheet component.

**File to create:** `mhm/src/components/CheckinSheet.test.tsx`

**Test infrastructure:**
- Config: `mhm/vitest.config.ts` (jsdom, setup: `tests/setup.ts`)
- Mock: `@tauri-apps/api/core` aliased to `mhm/src/__mocks__/tauri-core.ts`
- Imports: `@testing-library/react`, `@testing-library/user-event`

**5 test cases:**
```typescript
import { render, screen } from "@testing-library/react";
import CheckinSheet from "./CheckinSheet";

// Mock useHotelStore to provide rooms
vi.mock("../stores/useHotelStore", () => ({
  useHotelStore: () => ({
    rooms: [
      { id: "101", status: "vacant", type: "standard", base_price: 350000 },
    ],
    checkIn: vi.fn(),
    fetchRooms: vi.fn(),
    isCheckinOpen: true,
    setCheckinOpen: vi.fn(),
  }),
}));

test("renders title", () => { /* check "Check-in Khách Mới" */ });
test("room selector shows vacant rooms", () => { /* select 101 */ });
test("pricing preview called on room select", () => { /* verify invoke */ });
test("quick mode hides CCCD field", () => { /* no "Số CCCD" label */ });
test("submit disabled without guest name", () => { /* button disabled */ });
```

---

## TASK 12: Documentation [7.1 + 7.2 + 7.3]

**Goal:** Update README, create user guide, add CHANGELOG entry.

### 7.1 — Edit `README.md` (project root)
After "### Billing, payments, and reporting" section (~line 128), add:
```markdown
### Pricing

- Multi-mode pricing engine: hourly, overnight, daily, and monthly rate plans
- Step-function hourly pricing with automatic fallback to daily rates
- Dynamic pricing rules: weekend surcharges, holiday rates, specific-date overrides
- Early check-in and late check-out surcharge with configurable step thresholds
- Extra bed charging based on occupant count vs room capacity
- Price override ("Linh động giá") per stay without affecting base rate plan
- Real-time pricing preview during check-in and check-out
```

### 7.2 — Create `docs/pricing-guide.md`
Vietnamese user guide with 7 examples (A-G from proposal):
- A: Khách giờ motel (1h=80k, 2h=100k, step pricing, max 6h→night)
- B: KS du lịch (400k/night, late 12-15h=30%, 15-18h=50%, >18h=100%)
- C: Dynamic pricing (T6-T7 +50k Standard, +70k Superior)
- D: Hourly + dynamic (22h-2h surcharge per hour)
- E: Extra bed (capacity 2, 100k/person/night extra)
- F: Linh động giá (override 350k→250k for 1 stay)
- G: Monthly (6M/month + residual 250k/day or full_month)

### 7.3 — Edit `CHANGELOG.md`
Under `## Unreleased`, add:
```markdown
### Added
- Pricing Engine VN: multi-mode pricing (hourly, overnight, daily, monthly)
- Rate Plan configuration with 5 tab groups
- Dynamic pricing rules with weekend/holiday/date overlays
- Real-time pricing preview in check-in and check-out dialogs
- Price locking for invoice integrity
- Calculator panel with line-item breakdown
```
