# Design: Pricing Engine VN

## Crate Layout
```
mhm/src-tauri/
├── crates/
│   └── pricing/                # New crate
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── rate_plan.rs    # Domain types
│           ├── calc.rs         # Pure calculation
│           ├── dynamic.rs      # Time-based price overlay
│           ├── stay.rs         # Stay & duration model
│           └── tests/
│               ├── case_a_motel.rs
│               ├── case_b_tourist.rs
│               ├── case_c_dynamic.rs
│               ├── case_d_hourly_dynamic.rs
│               ├── case_e_extra_bed.rs
│               └── case_g_monthly.rs
└── src/
    └── commands/
        └── pricing.rs          # Tauri commands wrapper
```

## DB Schema (Migration `0001_pricing_engine_v2.sql`)

```sql
-- Rate plan: bảng mẹ. Mỗi room_type có 1+ rate_plan (default + theo channel).
CREATE TABLE rate_plan (
  id            TEXT PRIMARY KEY,         -- ULID
  property_id   TEXT NOT NULL,
  room_type_id  TEXT NOT NULL,
  name          TEXT NOT NULL,            -- "Default", "Agoda", "Walk-in"
  is_default    INTEGER NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'VND',
  capacity      INTEGER NOT NULL,         -- số người chuẩn
  -- Giá theo ngày
  night_rate            INTEGER,          -- VND, integer (no float)
  -- Giá qua đêm
  overnight_rate        INTEGER,
  overnight_start_hour  INTEGER NOT NULL DEFAULT 21, -- giờ bắt đầu đêm
  -- Giá tháng
  monthly_rate          INTEGER,
  monthly_residual_mode TEXT CHECK(monthly_residual_mode IN ('per_day','full_month')),
  -- Giờ
  hourly_steps_json     TEXT,             -- JSON: [{"hour":1,"price":80000},{"hour":2,"price":100000}]
  hourly_max_hours      INTEGER,          -- vd 6, qua đó tính night_rate
  -- Phụ trội
  early_checkin_day_json   TEXT,          -- JSON same shape, value có thể "amount" hoặc "percent_of_night"
  early_checkin_night_json TEXT,
  late_checkout_day_json   TEXT,
  late_checkout_night_json TEXT,
  -- Extra bed
  extra_bed_per_person  INTEGER NOT NULL DEFAULT 0,

  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_type_id) REFERENCES room_type(id)
);

-- Giá theo thời điểm — overlay
CREATE TABLE dynamic_price_rule (
  id           TEXT PRIMARY KEY,
  property_id  TEXT NOT NULL,
  name         TEXT NOT NULL,
  -- Phạm vi áp dụng
  applies_to   TEXT NOT NULL CHECK(applies_to IN (
                   'night','overnight','hourly',
                   'late_day','late_night','early_day','early_night')),
  strategy     TEXT NOT NULL CHECK(strategy IN ('replace','add')),
  -- Khung thời điểm
  weekday_mask INTEGER NOT NULL DEFAULT 127, -- bit 0=Mon..bit 6=Sun
  specific_dates_json TEXT,                  -- ["2025-09-02","2026-01-29"]
  hour_start   INTEGER,                       -- 0-23, NULL = cả ngày
  hour_end     INTEGER,
  -- Áp giá cho từng room_type
  -- bảng phụ rule_room_type_value để mỗi loại phòng có giá khác nhau
  active_from  TEXT,                          -- NULL = always
  active_to    TEXT,
  enabled      INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE dynamic_price_rule_value (
  rule_id      TEXT NOT NULL,
  room_type_id TEXT NOT NULL,
  value        INTEGER NOT NULL,             -- amount nếu strategy=replace; delta nếu add
  PRIMARY KEY (rule_id, room_type_id),
  FOREIGN KEY (rule_id) REFERENCES dynamic_price_rule(id) ON DELETE CASCADE
);

-- Stay (có thể đã tồn tại, chỉ ALTER thêm cột nếu cần)
ALTER TABLE stay ADD COLUMN rate_plan_id TEXT REFERENCES rate_plan(id);
ALTER TABLE stay ADD COLUMN rate_plan_override_json TEXT;  -- "linh động giá" snapshot
ALTER TABLE stay ADD COLUMN occupants INTEGER NOT NULL DEFAULT 1;
ALTER TABLE stay ADD COLUMN locked_pricing_at TEXT;        -- chốt giá (HĐĐT)
ALTER TABLE stay ADD COLUMN locked_total INTEGER;
```

## Domain Types (Rust)

```rust
// rate_plan.rs
#[derive(Clone, Debug)]
pub struct RatePlan {
    pub id: Ulid,
    pub capacity: u32,
    pub night_rate: Option<u64>,
    pub overnight: Option<OvernightRate>,
    pub monthly: Option<MonthlyRate>,
    pub hourly: Option<HourlyRate>,
    pub early_checkin_day:   Vec<SurchargeStep>,
    pub early_checkin_night: Vec<SurchargeStep>,
    pub late_checkout_day:   Vec<SurchargeStep>,
    pub late_checkout_night: Vec<SurchargeStep>,
    pub extra_bed_per_person: u64,
}

pub enum SurchargeValue { Amount(u64), PercentOfNight(u8) }

pub struct SurchargeStep {
    pub up_to_hours: u32,        // 1, 2, 3...
    pub value: SurchargeValue,
}

pub struct HourlyRate {
    pub steps: Vec<(u32 /*hour*/, u64 /*total_price*/)>,
    pub max_hours: u32,           // qua đó fallback sang night
}

pub struct OvernightRate {
    pub price: u64,
    pub start_hour: u8,           // 21
}

pub struct MonthlyRate {
    pub price: u64,
    pub residual_mode: ResidualMode,
}

pub enum ResidualMode { PerDay { day_rate: u64 }, FullMonth }
```

## Algorithm

```rust
pub fn calculate(input: &CalcInput) -> CalcOutput {
    // 1. Pick stay_mode based on input.requested_mode OR auto-detect:
    //    - If duration < hourly.max_hours AND hourly exists  -> Hourly
    //    - Else if check_in.hour >= overnight.start_hour     -> Overnight (1 đêm)
    //    - Else if duration approx N months                  -> Monthly
    //    - Else                                              -> Night
    let mode = decide_mode(input);

    // 2. Apply dynamic rules theo mode + thời điểm bắt đầu
    let effective_rate = apply_dynamic_rules(input.rate_plan, &input.dynamic_rules, &mode, input.check_in);

    // 3. Compute base
    let base = match mode {
        Mode::Hourly  => compute_hourly(&effective_rate, &input.duration),
        Mode::Night   => compute_nights(&effective_rate, &input.duration),
        Mode::Overnight => compute_overnights(&effective_rate, &input.duration),
        Mode::Monthly => compute_monthly(&effective_rate, &input.duration),
    };

    // 4. Surcharges (chỉ áp với Night/Overnight)
    let early = compute_early_surcharge(&effective_rate, mode, input.check_in);
    let late  = compute_late_surcharge(&effective_rate, mode, input.check_out);

    // 5. Extra bed (chỉ áp Night/Overnight, không áp Hourly)
    let extra = compute_extra_bed(&effective_rate, input.occupants, &input.duration, mode);

    // 6. Apply override "linh động giá" nếu có (override toàn bộ rate_plan trước bước 2)
    // ... trên thực tế override được resolve ở bước 0 bằng cách merge vào rate_plan trước.

    CalcOutput {
        line_items: vec![...],
        room_subtotal: base + early + late + extra,
        currency: "VND",
    }
}
```

## Decisions

### Decision 1: Integer VND, KHÔNG dùng float
- Tất cả tiền là `u64` đơn vị đồng. Không có cent.
- Tỷ giá USD lưu riêng `exchange_rate` integer × 100 (1 USD = 24.500.00 lưu là 2.450.000).

### Decision 2: Dynamic rule chỉ áp tại thời điểm bắt đầu một "đơn vị tính" 
- Vd 1 đêm bắt đầu lúc 21:00 thứ 6 → áp dynamic rule của thứ 6 cho cả đêm đó, KHÔNG split nửa đêm.
- Khách giờ thì áp theo từng giờ.
- Tham chiếu SkyHotel: "Nếu là hình thức tính qua đêm phần mềm sẽ tự biết cùng 1 ngày. Ví dụ đêm T7 sẽ được hiểu là từ tối T7 đến sáng CN sẽ được hiểu là đêm T7."

### Decision 3: Linh động giá là snapshot, không link
- Khi user "Linh động giá" tại check-in, ta deep-clone rate_plan thành JSON lưu vào `stay.rate_plan_override_json`. Sửa rate_plan gốc về sau KHÔNG ảnh hưởng stay đang có override.

### Decision 4: Auto-detect mode + user override
- UI có dropdown "Cách tính: [Auto | Giờ | Qua đêm | Theo ngày | Theo tháng]". Mặc định Auto.
- Khi mode = Auto, engine tự quyết theo Decision Tree ở Algorithm.

### Decision 5: Không hỗ trợ lịch âm trong v1
- `specific_dates_json` chỉ accept dương lịch ISO. Lễ Tết âm phải nhập tay. v2 sẽ thêm picker lunar.

## Data Flow

```
[UI Check-in dialog]
   │  user chọn room + ngày + occupants
   ▼
invoke('pricing_preview', { room_id, check_in, check_out, occupants, override? })
   │
   ▼
[Tauri command pricing::preview]
   │  load rate_plan + dynamic rules từ SQLite
   ▼
[capyinn_pricing::calculate(...)]    ← pure
   │
   ▼
CalcOutput { line_items, total }
   │
   ▼
[UI hiển thị bảng tính tiền realtime]
```

## Testing Strategy
- `cargo test` cho mỗi case A1..G3 trong proposal.md → mỗi case là 1 test function.
- `tests/golden/` chứa JSON input + expected output cho regression.
- Vitest E2E: render check-in dialog, mock rate_plan, kiểm tra DOM hiển thị đúng số.
