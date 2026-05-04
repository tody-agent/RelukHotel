# 📦 BỘ KẾ HOẠCH NÂNG CẤP CAPYINN THEO CHUẨN OPENSPEC

## Cấu trúc thư mục đề xuất

```
CapyInn/
└── openspec/
    ├── config.yaml
    ├── project.md                              # Context chung của dự án
    ├── specs/                                  # (Source of truth - sẽ build dần)
    │   └── .gitkeep
    └── changes/                                # 6 change proposals theo thứ tự ưu tiên
        ├── 01-pricing-engine-vn/               # 🥇 Ưu tiên 1
        │   ├── proposal.md
        │   ├── design.md
        │   ├── tasks.md
        │   └── specs/
        │       ├── pricing/spec.md
        │       └── room-type/spec.md
        ├── 02-front-desk-pos-and-folio/        # 🥈 Ưu tiên 2: Bán hàng tại quầy
        │   ├── proposal.md
        │   ├── design.md
        │   ├── tasks.md
        │   └── specs/
        │       ├── pos/spec.md
        │       ├── folio/spec.md
        │       └── inventory/spec.md
        ├── 03-einvoice-vn-integration/         # 🥉 Ưu tiên 3: MISA / Viettel
        │   ├── proposal.md
        │   ├── design.md
        │   ├── tasks.md
        │   └── specs/
        │       ├── einvoice/spec.md
        │       └── tax-config/spec.md
        ├── 04-shift-cash-management/           # Giao ca, giao tiền quản lý
        │   ├── proposal.md
        │   ├── design.md
        │   ├── tasks.md
        │   └── specs/
        │       └── shift/spec.md
        ├── 05-rbac-audit-multiproperty/        # Phân quyền, audit log, nhiều KS
        │   ├── proposal.md
        │   ├── design.md
        │   ├── tasks.md
        │   └── specs/
        │       ├── rbac/spec.md
        │       ├── audit/spec.md
        │       └── property/spec.md
        └── 06-windows-printing-hardware/       # Windows-first, in nhiệt, khóa từ
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── specs/
                ├── platform/spec.md
                └── hardware/spec.md
```

---

## 📄 `openspec/config.yaml`

```yaml
schema: spec-driven

context: |
  Project: CapyInn — Offline-first PMS cho mini hotel & guesthouse Việt Nam.
  Mục tiêu chiến lược: Thay thế SkyHotel cho phân khúc 5–30 phòng.

  Tech stack:
    App shell: Tauri 2
    Backend:   Rust (sqlx + SQLite, async via tokio)
    Frontend:  React 19 + TypeScript + Tailwind 4 + shadcn/ui
    State:     Zustand
    OCR:       ocr-rs + PaddleOCR v5 + MNN (offline)
    Tests:     Vitest + cargo test + Clippy

  Repo layout: ~/CapyInn/mhm/{src, src-tauri, tests, models}
  Runtime root (user data): ~/CapyInn/

  Nguyên tắc thiết kế:
    1. Local-first, dữ liệu khách KHÔNG rời máy trừ khi user opt-in.
    2. Pure-function pricing engine, idempotent, có unit test cho từng case.
    3. Mọi thao tác nghiệp vụ phải ghi audit_log (actor, before, after).
    4. Schema migration qua sqlx migrate; KHÔNG drop dữ liệu.
    5. Cross-platform first (Windows + macOS + Linux), không macOS-only.
    6. Tuân thủ pháp lý VN: HĐĐT theo NĐ 123/2020 và NĐ 70/2025.

  Đối thủ tham chiếu: SkyHotel (skyhotel.vn). Khi có ambiguity về nghiệp vụ,
  ưu tiên đối chiếu với hotro.skyhotel.vn để parity.

rules:
  proposal:
    - Ghi rõ tham chiếu SkyHotel (URL doc) cho từng tính năng nếu có.
    - Liệt kê acceptance test cases đối chiếu SkyHotel.
  specs:
    - Dùng định dạng GIVEN/WHEN/THEN có tiếng Việt được, nhưng key terms giữ nguyên (RFC 2119: MUST/SHALL/SHOULD/MAY).
    - Mọi requirement liên quan tiền phải có ví dụ số cụ thể.
  design:
    - Liệt kê migrations SQL cụ thể (tên file, schema thay đổi).
    - Có sơ đồ data flow nếu cross-module.
  tasks:
    - Nhóm theo: Backend (Rust) / Frontend (React) / DB Migration / Tests / Docs.
    - Mỗi task ≤ 1 ngày công.
```

---

## 📄 `openspec/project.md`

```markdown
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
```

---

# 🥇 CHANGE 01 — `pricing-engine-vn`

## 📄 `openspec/changes/01-pricing-engine-vn/proposal.md`

```markdown
# Proposal: Pricing Engine VN (parity với SkyHotel)

## Why
CapyInn hiện tại chỉ có pricing đơn giản theo "night rate × số đêm". Đây là lý do số 1 khiến CapyInn KHÔNG thay thế được SkyHotel cho khách sạn VN — vì khách sạn VN thực tế bán đồng thời nhiều hình thức trên cùng 1 phòng:

1. **Khách giờ** (rest, motel-style): 1h:80k, 2h:100k, mỗi giờ tiếp +20k.
2. **Qua đêm**: từ 21h hôm nay đến 12h hôm sau.
3. **Theo ngày** (Night): 12h–12h hôm sau.
4. **Theo tháng**: chu kỳ ngày-này-tháng-này → ngày-này-tháng-sau.
5. **Phụ trội** check-in sớm + check-out muộn (với cả ngày và đêm), tính theo tiền hoặc % giá đêm.
6. **Extra bed**: vượt số người tiêu chuẩn → phụ thu × số người vượt × số đêm.
7. **Giá theo thời điểm** (peak/lễ Tết): replace hoặc add lên giá gốc, theo khung giờ + ngày trong tuần + ngày cụ thể.
8. **Giá mẫu** (Agoda, Booking, Mytour) áp nhanh khi check-in.

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/bat-dau-su-dung-va-cai-dat-ks/cai-dat-gia-phong-loai-phong
- https://hotro.skyhotel.vn/docs/bat-dau-su-dung-va-cai-dat-ks/gia-theo-thoi-diem
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/chinh-sua-gia-ban-phong

## What Changes
- Thiết kế lại schema DB theo "Rate Plan" pattern thay vì "rate per room".
- Xây Rust crate `capyinn-pricing` thuần, có 100% unit test.
- UI: trang "Loại phòng & Cài đặt" mới cho phép cấu hình đầy đủ 5 hình thức + 4 phụ trội.
- UI: trang "Giá theo thời điểm" và "Giá mẫu".
- UI: ô "Linh động giá" (pencil icon) tại check-in.

## Scope
**In scope:**
- Tính tiền cho 1 lượt khách (1 booking 1 phòng 1 lần lưu trú).
- Tính cộng dồn cho group booking (mỗi phòng 1 stay, gom lại folio).
- Cấu hình + áp dụng giá theo thời điểm.
- Ô linh động giá (override 1 stay).

**Out of scope (cho change này):**
- HĐĐT (xem change 03).
- Yield management AI (gợi ý giá tự động) — tương lai.
- Lịch âm cho ngày lễ (chỉ làm dương lịch trước, lịch âm để v2).

## Approach
- Pure-function pricing engine viết bằng Rust, input là `(RatePlan, Stay, ServiceLines, DynamicRules, Now)` → output là `Folio { line_items, subtotal, discount, total }`.
- Engine được expose qua Tauri command `pricing.preview` để FE dùng cả khi check-in (preview) lẫn check-out (chốt).
- Quyết định: KHÔNG cache giá vào DB tại check-in — luôn tính lại tại check-out theo `actual_check_out_time`. Lý do: nếu khách check-out trễ 2h thì pricing phải reflect, nếu cache thì phải invalidate phức tạp.
- Tuy nhiên có cơ chế `pricing.lock(stay_id)` để chốt giá khi cần (dùng cho HĐĐT đã phát hành).

## Acceptance Scenarios (đối chiếu SkyHotel)

### A. KS thông thường (mini hotel/motel)
**Cấu hình phòng đơn:**
- Giá ngày: 350.000đ
- Giá qua đêm: 280.000đ
- Giờ: 1h=80k, mỗi giờ +30k, max 6h, qua h7 tính giá ngày
- Phụ trội checkin sớm/checkout muộn (cả ngày và đêm): mỗi tiếng +30k

**Test cases:**
- A1: Vào 09:00 ra 13:00 → 4h × giá giờ = 1h:80k + 2h:110k + 3h:140k + 4h:170k = `170.000đ`
- A2: Vào 12:00 ra 12:00 hôm sau → 1 night = `350.000đ`
- A3: Vào 12:00 ra 14:00 hôm sau → 1 night + 2h late = `350.000 + 60.000 = 410.000đ`
- A4: Vào 21:00 ra 12:00 hôm sau → 1 overnight = `280.000đ`
- A5: Vào 19:00 (sớm 2h so với 21:00) ra 12:00 hôm sau → 1 overnight + 2h early = `280.000 + 60.000 = 340.000đ`

### B. KS du lịch
**Cấu hình phòng Standard:**
- Giá ngày: 400.000đ
- Check-in sớm: free
- Check-out muộn: 12-15h: 30%, 15-18h: 50%, sau 18h: 100% giá ngày

**Test cases:**
- B1: Vào 10:00 ra 12:00 hôm sau → 1 night = `400.000đ`
- B2: Vào 12:00 ra 14:00 hôm sau → 1 night + 30% late = `400.000 + 120.000 = 520.000đ`
- B3: Vào 12:00 ra 19:00 hôm sau → 2 nights (vì >18h tính 100%) = `800.000đ`

### C. Giá theo thời điểm
**Quy định:** Đêm T6, T7 cộng thêm 50.000đ vào Standard, 70.000đ vào Superior.
- C1: Khách Standard ở đêm thứ Sáu → `(400 + 50) = 450.000đ`
- C2: Khách Standard ở 2 đêm T5+T6 → `400 + 450 = 850.000đ`

### D. Khách giờ + giá theo thời điểm khung 22h–02h sáng
- D1: Vào 23:00 T2, ra 01:00 T3 → 2h = `100k + (20k × 2)` (T2-T6 quy định +20k/giờ trong khung) = `140.000đ`
- D2: Vào 23:00 T7, ra 01:00 CN → 2h = `100k + (30k × 2)` = `160.000đ`

### E. Extra bed
**Cấu hình:** Phòng đôi capacity 2, extra bed 100k/người/đêm.
- E1: 3 người ở 2 đêm 1 phòng đôi 350k/đêm → `700k + (1 × 100k × 2) = 900.000đ`

### F. Linh động giá (override)
- F1: Phòng đôi 350k/đêm; lễ tân override còn 250k/đêm cho khách Agoda → tính theo 250k.
- F2: Sau khi khách check-out, phòng quay về giá gốc 350k cho khách kế tiếp.

### G. Giá theo tháng
**Cấu hình:** Tháng 6.000.000đ, sau đủ tháng tính theo ngày 250k.
- G1: Khách 12/01 → 12/02 → 1 tháng = `6.000.000đ`
- G2: Khách 12/01 → 20/02 → 1 tháng + 8 ngày × 250k = `8.000.000đ`
- G3: Chế độ "đủ tháng": 12/01 → 20/02 → 2 tháng = `12.000.000đ`

## Migration Plan
- Migration `001_pricing_engine_v2.sql` thêm bảng mới (xem design.md), KHÔNG drop bảng cũ.
- Script migrate dữ liệu cũ: convert `room_type.night_rate` → `rate_plan` cơ bản với `night_rate` only, các field khác null. Khách sạn sẽ vào UI cập nhật dần.

## Risks
- **Sai số học**: tính tiền sai 1.000đ là khách sạn mất niềm tin. → Mitigation: phủ unit test 100+ case, có "calculator audit panel" trong UI hiển thị từng dòng cộng/trừ.
- **Performance**: pricing.preview gọi mỗi lần user thay đổi UI có thể chậm. → Mitigation: pricing engine pure & nhanh (<5ms/call), throttle FE 200ms.
- **Edge case timezone**: VN UTC+7, không DST → tương đối đơn giản, nhưng phải lock TZ ở DB (TEXT ISO 8601 với offset).
```

## 📄 `openspec/changes/01-pricing-engine-vn/design.md`

````markdown
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
````

## 📄 `openspec/changes/01-pricing-engine-vn/tasks.md`

```markdown
# Tasks — Pricing Engine VN

## 1. DB & Migration
- [ ] 1.1 Tạo migration `0001_pricing_engine_v2.sql` (rate_plan, dynamic_price_rule, dynamic_price_rule_value, ALTER stay)
- [ ] 1.2 Viết script migrate `room_type.night_rate` cũ → `rate_plan` mặc định
- [ ] 1.3 Test migration trên DB sample không mất dữ liệu

## 2. Backend — Pricing Crate (Rust)
- [ ] 2.1 Tạo `crates/pricing/` với Cargo.toml
- [ ] 2.2 Domain types: `RatePlan`, `SurchargeStep`, `HourlyRate`, `OvernightRate`, `MonthlyRate`, `CalcInput`, `CalcOutput`
- [ ] 2.3 `decide_mode()` — auto-detect mode
- [ ] 2.4 `compute_hourly()` — step function + max_hours fallback
- [ ] 2.5 `compute_nights()` — N nights × night_rate, áp dynamic rule cho mỗi đêm
- [ ] 2.6 `compute_overnights()` — tương tự nhưng start_hour
- [ ] 2.7 `compute_monthly()` — 2 chế độ residual
- [ ] 2.8 `compute_early_surcharge()` + `compute_late_surcharge()`
- [ ] 2.9 `compute_extra_bed()`
- [ ] 2.10 `apply_dynamic_rules()` — overlay replace/add
- [ ] 2.11 Public API `calculate(&CalcInput) -> CalcOutput`
- [ ] 2.12 Snapshot/lock: `lock_pricing(stay_id) -> CalcOutput` lưu vào stay

## 3. Backend — Tauri Commands
- [ ] 3.1 `pricing_preview(room_id, check_in, check_out, occupants, override_json?)`
- [ ] 3.2 `rate_plan_list(property_id)` / `rate_plan_upsert(...)` / `rate_plan_delete(id)`
- [ ] 3.3 `dynamic_rule_list(...)` / `dynamic_rule_upsert(...)` / `dynamic_rule_delete(id)`
- [ ] 3.4 `pricing_lock(stay_id)`

## 4. Frontend — Cấu hình
- [ ] 4.1 Page "Loại phòng & Cài đặt" → tab Rate Plans
- [ ] 4.2 Form RatePlan với 5 nhóm tab: Cơ bản | Giờ | Phụ trội | Extra bed | USD
- [ ] 4.3 Step editor cho hourly_steps & surcharge (thêm/xóa hàng)
- [ ] 4.4 Page "Giá theo thời điểm" với list + form
- [ ] 4.5 DateRange + DayOfWeek picker + chế độ replace/add
- [ ] 4.6 Multi-room-type value editor

## 5. Frontend — Sử dụng
- [ ] 5.1 Check-in dialog gọi `pricing_preview` realtime
- [ ] 5.2 Hiển thị "Calculator panel" — break down từng line item
- [ ] 5.3 Pencil icon "Linh động giá" mở dialog override (clone rate_plan thành JSON editable)
- [ ] 5.4 Check-out dialog gọi `pricing_preview` lại với actual times
- [ ] 5.5 Hiển thị warning nếu late check-out vượt ngưỡng max → tính 100% giá ngày

## 6. Tests
- [ ] 6.1 Unit test: tất cả case A1..A5 (motel)
- [ ] 6.2 Unit test: tất cả case B1..B3 (tourist)
- [ ] 6.3 Unit test: case C1, C2 (dynamic price)
- [ ] 6.4 Unit test: case D1, D2 (hourly + dynamic)
- [ ] 6.5 Unit test: case E1 (extra bed)
- [ ] 6.6 Unit test: case F1, F2 (override linh động)
- [ ] 6.7 Unit test: case G1, G2, G3 (monthly)
- [ ] 6.8 Property-based test: tổng line_items luôn = total
- [ ] 6.9 Property-based test: pricing là idempotent (gọi 2 lần ra cùng kết quả)
- [ ] 6.10 Vitest E2E check-in dialog với 5 case smoke

## 7. Docs
- [ ] 7.1 Cập nhật README "Key features → Pricing"
- [ ] 7.2 User guide markdown với tất cả 7 ví dụ từ SkyHotel
- [ ] 7.3 CHANGELOG entry
```

## 📄 `openspec/changes/01-pricing-engine-vn/specs/pricing/spec.md`

```markdown
# Delta for Pricing

## ADDED Requirements

### Requirement: Multi-mode Rate Plan
The system MUST support per-room-type rate plans containing simultaneously up to 5 stay modes: Hourly, Night, Overnight, Monthly, plus Extra Bed surcharge.

#### Scenario: Motel typical config
- GIVEN một rate_plan có night_rate=350.000, overnight_rate=280.000, hourly steps {1h:80k, 2h:110k, 3h:140k, 4h:170k}, max_hours=6
- WHEN engine.calculate được gọi với stay 4h (mode Hourly)
- THEN line item "Tiền phòng (Giờ × 4)" = 170.000đ và total = 170.000đ

#### Scenario: Auto-fallback hourly to night
- GIVEN cùng rate_plan, max_hours=6
- WHEN khách ở 7h (vượt max_hours)
- THEN engine tự fallback Mode → Night, tính 1 night = 350.000đ

### Requirement: Time-based Surcharges
The system MUST support 4 separate surcharge configurations: early-checkin-day, early-checkin-night, late-checkout-day, late-checkout-night, each as a step function of hours, value being either fixed amount or percent of night_rate.

#### Scenario: Late checkout fixed amount
- GIVEN late_checkout_day = [{up_to:1, +30k}, {up_to:2, +60k}, {up_to:3, +90k}]
- WHEN khách ở 1 đêm và check-out muộn 2h
- THEN line "Phụ trội checkout muộn 2h" = 60.000đ

#### Scenario: Late checkout percent
- GIVEN late_checkout_day = [{up_to:3, 30%}, {up_to:6, 50%}], beyond=100%
- AND night_rate = 400.000đ
- WHEN khách check-out muộn 4h
- THEN phụ trội = 50% × 400.000 = 200.000đ

#### Scenario: Late checkout overflow → +1 night
- GIVEN cùng config trên, beyond=100% (max bracket = 6h, vượt 6h tính như 1 đêm thêm)
- WHEN khách check-out muộn 7h
- THEN engine cộng thêm 1 night thay vì 100% phụ trội (tham chiếu SkyHotel doc B3)

### Requirement: Extra Bed Calculation
The system MUST calculate extra bed surcharge as `(occupants - capacity) × extra_bed_per_person × nights` when occupants > capacity, otherwise 0. Extra bed only applies in Night/Overnight modes, NOT Hourly.

#### Scenario: 3 guests in double room (capacity 2)
- GIVEN rate_plan capacity=2, extra_bed_per_person=100k, night_rate=350k
- WHEN khách 3 người ở 2 đêm
- THEN total = (350k × 2) + (1 × 100k × 2) = 900.000đ

### Requirement: Dynamic Pricing Rules
The system MUST allow defining time-based price rules that overlay base rate plan, scoped by weekday-mask, hour-range, and/or specific dates, with strategy `replace` (set new value) or `add` (delta to base).

#### Scenario: Friday/Saturday overnight surcharge
- GIVEN một rule strategy=add, applies_to=overnight, weekday_mask = bit_F | bit_S, value = 50.000đ cho Standard
- AND khách Standard giá đêm gốc 280.000đ
- WHEN khách qua đêm thứ Sáu
- THEN giá đêm tính 280.000 + 50.000 = 330.000đ

#### Scenario: Hourly rule in late-night window
- GIVEN rule applies_to=hourly, hour_range 22:00–02:00, weekday=T2-T6, strategy=add, +20k/giờ
- WHEN khách ở 23:00 T2 → 01:00 T3 (2 giờ trong khung)
- THEN mỗi giờ trong khung +20k → adjustment = 40.000đ thêm vào tiền phòng cơ bản

### Requirement: Per-Stay Override (Linh động giá)
The system MUST allow front-desk users with `flexible_pricing` permission to override rate plan for one stay only, persisted as a JSON snapshot on the stay row, without affecting the master rate plan.

#### Scenario: Override at check-in
- GIVEN khách Agoda được giá đặc biệt 250k/đêm (gốc 350k)
- WHEN lễ tân click pencil icon → sửa night_rate thành 250k → "Áp dụng cho lượt này"
- THEN stay.rate_plan_override_json được lưu, calculate dùng override
- AND khi khách kế tiếp vào phòng đó, override KHÔNG còn (về giá gốc 350k)

### Requirement: Monthly Stay Modes
The system MUST support monthly billing with 2 residual modes: `per_day` (extra days × day_rate) or `full_month` (every month started counts as full month).

#### Scenario: Per-day residual
- GIVEN monthly_rate=6.000.000đ, residual_mode=per_day, day_rate=250k
- WHEN khách 12/01 → 20/02 (1 tháng + 8 ngày)
- THEN total = 6.000.000 + (8 × 250.000) = 8.000.000đ

#### Scenario: Full-month residual
- GIVEN cùng tham số nhưng residual_mode=full_month
- WHEN khách 12/01 → 20/02
- THEN total = 6.000.000 × 2 = 12.000.000đ

### Requirement: Pricing Lock
The system MUST allow locking the calculated total of a stay (e.g., when an e-invoice is issued), persisting `locked_total` and `locked_pricing_at`. Subsequent re-calculations MUST return the locked value, not recompute.

#### Scenario: Lock after e-invoice
- GIVEN stay đã check-out với total=520.000đ, đã phát hành HĐĐT
- WHEN engine.calculate được gọi lại sau đó
- THEN trả về locked_total=520.000đ kèm flag `is_locked: true`

## REMOVED Requirements

### Requirement: Single Night Rate per Room Type
(Deprecated. Thay bằng RatePlan đầy đủ. Migration sẽ tự convert.)
```

## 📄 `openspec/changes/01-pricing-engine-vn/specs/room-type/spec.md`

```markdown
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
```

---

# 🥈 CHANGE 02 — `front-desk-pos-and-folio`

## 📄 `openspec/changes/02-front-desk-pos-and-folio/proposal.md`

```markdown
# Proposal: POS tại quầy + Hóa đơn dịch vụ + Ký gửi liên phòng

## Why
Hiện CapyInn chỉ tracking "charge" gắn với booking. Khách sạn VN cần 3 luồng bán hàng dịch vụ:

1. **Thêm dịch vụ vào hóa đơn phòng** khi khách đang ở (mini-bar, giặt ủi, ăn sáng).
2. **Bán lẻ tại quầy** cho khách vãng lai (chai nước, gói bim bim, tour) → hóa đơn dịch vụ độc lập, KHÔNG gắn phòng.
3. **Ký gửi hóa đơn liên phòng** (folio transfer): trả phòng A nhưng gộp tiền vào phòng B (gia đình ở 2 phòng).
4. **Trả lại dịch vụ** (số lượng âm) khi khách trả lại không dùng.

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/ban-hoac-tra-lai-dich-vu
- https://hotro.skyhotel.vn/docs/bat-dau-su-dung-va-cai-dat-ks/khoi-tao-dich-vu-va-kho

## What Changes
- Khái niệm **Folio** tách khỏi Stay: 1 folio có thể chứa 0..n stays + 0..n service_lines + 0..n payments + 0..n deposits. (Stay không có folio = walk-in retail; Stay có folio gắn với 1 folio duy nhất.)
- Trang "POS tại quầy" — cashier UI: chọn dịch vụ → số lượng → thanh toán → in.
- Tính năng "Ký gửi vào phòng khác" trong dialog check-out.
- Tính năng "Trả lại dịch vụ" với số lượng âm.
- Quản lý nhập/xuất kho cải thiện: ghi log từng lần xuất/nhập, FIFO, cảnh báo tồn kho thấp.
- Nhóm dịch vụ (service group): Đồ uống / Đồ ăn / Giặt ủi / Tour / Khác.
- Flag mỗi dịch vụ: `track_inventory`, `internal_only` (không hiện trên HĐ khách), `requires_kitchen_print` (in chuyển bếp/bar).

## Scope
**In scope:**
- POS tại quầy với UX nhanh (hot-key, search, ảnh sản phẩm).
- Folio model + folio transfer.
- Inventory tracking với cảnh báo.
- In hóa đơn 80mm cho POS (bridge sang change 06 cho ESC/POS native, ở change này dùng HTML print).

**Out of scope:**
- Phát hành HĐĐT từ POS — xem change 03.
- Tích hợp với máy quét barcode — change 06.
- Print kitchen ticket riêng — change 06.

## Acceptance Scenarios

### A. Bán lẻ tại quầy
- A1: Khách vãng lai vào quầy mua 2 chai nước (15k) + 1 mì gói (10k) → hóa đơn 40k → thanh toán tiền mặt → in hóa đơn → giảm tồn kho.
- A2: Cùng A1 nhưng dịch vụ "Tour Đà Lạt 1 ngày" KHÔNG track_inventory → tồn kho không thay đổi.

### B. Thêm dịch vụ vào phòng đang ở
- B1: Phòng 101 đang có khách → click → "Trả phòng/Cập nhật HĐ" → thêm 3 chai Coca → folio.subtotal_services = 30.000đ.
- B2: Lễ tân nhập nhầm 5 chai thành 3 → cập nhật số lượng = 3 → tính lại đúng.

### C. Trả lại dịch vụ
- C1: Phòng đã thêm 3 chai Coca, khách trả lại 1 chai → thêm dòng dịch vụ Coca với qty = -1, tổng = 20.000đ; tồn kho tăng 1.

### D. Ký gửi liên phòng (folio transfer)
- D1: Phòng 101 (folio F1) và 102 (folio F2) là 1 gia đình. Tại check-out 102, chọn "Chuyển hóa đơn vào phòng 101" → folio F2 merge vào F1; F2 closed empty; phòng 102 trạng thái dirty.
- D2: Tại check-out đoàn (giữ Ctrl chọn nhiều phòng → "Trả phòng đoàn") → các stay merge vào folio đại diện, mỗi stay vẫn giữ trace thông tin gốc trong line_items.

### E. Inventory cảnh báo
- E1: Coca tồn kho 5, threshold 10 → dashboard hiện chip "Coca: 5/10 ⚠️".
- E2: Bán hết → tồn 0 → POS chặn không cho thêm vào folio (toast "Hết hàng — vui lòng nhập kho").

### F. Nội bộ (internal_only)
- F1: "Bàn chải đánh răng" được flag internal_only → không hiện trên menu POS, không hiện trên hóa đơn khách, nhưng có trong báo cáo xuất kho.

## Approach
- Refactor schema: `folio` table mới, `service_line` gắn vào folio_id thay vì stay_id trực tiếp.
- Stay có `folio_id`. Khi check-in khách lẻ → tạo folio mới + stay link folio.
- Khi chuyển folio: cập nhật `folio.merged_into_id`, mọi line_items của folio cũ link sang folio mới.
- POS retail = tạo folio không có stay, đóng folio ngay khi thanh toán.

## Risks
- Folio refactor có thể break check-out flow hiện tại. → Mitigation: làm migration giữ tương thích, viết integration test full check-in→check-out trước khi merge.
- UX POS phải nhanh — testers thử với 30 dịch vụ phổ biến phải <2 click/lần thêm.
```

## 📄 `openspec/changes/02-front-desk-pos-and-folio/design.md`

````markdown
# Design: POS + Folio

## DB Schema (Migration `0002_folio_pos.sql`)

```sql
-- Folio: hộ chứa các transaction tiền của 1 nhóm khách
CREATE TABLE folio (
  id              TEXT PRIMARY KEY,         -- ULID
  property_id     TEXT NOT NULL,
  code            TEXT NOT NULL UNIQUE,     -- "F-2025-000123"
  kind            TEXT NOT NULL CHECK(kind IN ('room','retail','group')),
  status          TEXT NOT NULL CHECK(status IN ('open','closed','merged')),
  primary_guest_id TEXT,
  opened_at       TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at       TEXT,
  merged_into_id  TEXT REFERENCES folio(id),
  note            TEXT,
  created_by      TEXT NOT NULL,
  source          TEXT,                     -- "Walk-in","Agoda","Booking.com"
  -- Cached totals (computed; refresh on change)
  subtotal_room   INTEGER NOT NULL DEFAULT 0,
  subtotal_service INTEGER NOT NULL DEFAULT 0,
  discount        INTEGER NOT NULL DEFAULT 0,
  surcharge       INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL DEFAULT 0,
  paid            INTEGER NOT NULL DEFAULT 0,
  balance         INTEGER NOT NULL DEFAULT 0
);

-- ALTER stay: link to folio
ALTER TABLE stay ADD COLUMN folio_id TEXT REFERENCES folio(id);

-- Service catalog
CREATE TABLE service_group (
  id            TEXT PRIMARY KEY,
  property_id   TEXT NOT NULL,
  name          TEXT NOT NULL,             -- "Đồ uống","Đồ ăn"
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE service (
  id              TEXT PRIMARY KEY,
  property_id     TEXT NOT NULL,
  group_id        TEXT REFERENCES service_group(id),
  name            TEXT NOT NULL,
  unit            TEXT NOT NULL DEFAULT 'cái',
  default_price   INTEGER NOT NULL,
  track_inventory INTEGER NOT NULL DEFAULT 1,
  internal_only   INTEGER NOT NULL DEFAULT 0,
  image_path      TEXT,
  hotkey          TEXT,                     -- "F1","CTRL+1"
  enabled         INTEGER NOT NULL DEFAULT 1,
  -- thuế suất default cho HĐĐT
  vat_rate        INTEGER NOT NULL DEFAULT 8 -- 0/5/8/10
);

-- Many-to-one alternate prices (theo SkyHotel: 1 dv có nhiều giá bán cùng xuất kho)
CREATE TABLE service_price_variant (
  id          TEXT PRIMARY KEY,
  service_id  TEXT NOT NULL REFERENCES service(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,                -- "Giá Agoda","Giá lễ"
  price       INTEGER NOT NULL
);

-- Service line trên folio (có thể qty âm = trả lại)
CREATE TABLE service_line (
  id            TEXT PRIMARY KEY,
  folio_id      TEXT NOT NULL REFERENCES folio(id),
  service_id    TEXT NOT NULL REFERENCES service(id),
  qty           INTEGER NOT NULL,           -- âm = trả lại
  unit_price    INTEGER NOT NULL,           -- snapshot tại thời điểm bán
  vat_rate      INTEGER NOT NULL DEFAULT 8,
  note          TEXT,
  posted_at     TEXT NOT NULL DEFAULT (datetime('now')),
  posted_by     TEXT NOT NULL
);

-- Inventory movement (FIFO + audit)
CREATE TABLE inventory_movement (
  id          TEXT PRIMARY KEY,
  service_id  TEXT NOT NULL REFERENCES service(id),
  kind        TEXT NOT NULL CHECK(kind IN ('in','out','adjust','return')),
  qty         INTEGER NOT NULL,             -- always positive; kind quyết hướng
  unit_cost   INTEGER,                      -- giá nhập (cho FIFO)
  ref_type    TEXT,                         -- "service_line","manual","init"
  ref_id      TEXT,
  note        TEXT,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
  by_user     TEXT NOT NULL
);

CREATE TABLE inventory_threshold (
  service_id  TEXT PRIMARY KEY REFERENCES service(id),
  low_warn    INTEGER NOT NULL DEFAULT 0
);

-- Payment
CREATE TABLE payment (
  id           TEXT PRIMARY KEY,
  folio_id     TEXT NOT NULL REFERENCES folio(id),
  amount       INTEGER NOT NULL,
  method       TEXT NOT NULL CHECK(method IN ('cash','card','transfer','momo','zalopay','vnpay','other')),
  is_deposit   INTEGER NOT NULL DEFAULT 0,
  ref_no       TEXT,
  paid_at      TEXT NOT NULL DEFAULT (datetime('now')),
  by_user      TEXT NOT NULL
);
```

## Folio Lifecycle

```
                  ┌──────────┐
                  │  Walk-in │
                  └────┬─────┘
                       │ create folio kind=retail
                       ▼
            ┌──────────────────┐
            │  folio.open      │
            └──────┬───────────┘
                   │ add service_lines
                   │ add payments
                   ▼
            ┌──────────────────┐
            │  folio.closed    │
            └──────────────────┘

       ┌─────────────┐
       │  Check-in   │
       └──────┬──────┘
              │ create folio kind=room + stay link folio
              ▼
       ┌──────────────────┐
       │  folio.open      │←──── add services anytime
       └──────┬───────────┘
              │ Check-out
              │ option A: trả phòng & thanh toán → status=closed
              │ option B: ký gửi vào phòng khác  → status=merged
              │                                    merged_into_id=other_folio.id
              ▼
       (A) closed   (B) merged_into another open folio
```

## Algorithm: Folio Merge

```rust
pub fn merge_folio(src: FolioId, dst: FolioId, conn: &mut Conn) -> Result<()> {
    let mut tx = conn.transaction()?;
    // 1. Move all service_lines & payments src → dst
    sqlx::query!("UPDATE service_line SET folio_id = ?1 WHERE folio_id = ?2", dst, src)
        .execute(&mut tx).await?;
    sqlx::query!("UPDATE payment SET folio_id = ?1 WHERE folio_id = ?2", dst, src)
        .execute(&mut tx).await?;
    // 2. Move stay links
    sqlx::query!("UPDATE stay SET folio_id = ?1 WHERE folio_id = ?2", dst, src)
        .execute(&mut tx).await?;
    // 3. Mark src as merged
    sqlx::query!(
        "UPDATE folio SET status='merged', merged_into_id=?1, closed_at=datetime('now') WHERE id=?2",
        dst, src
    ).execute(&mut tx).await?;
    // 4. Refresh dst totals
    refresh_folio_totals(dst, &mut tx).await?;
    tx.commit()?;
    Ok(())
}
```

## POS UX

```
┌─────────────────────────────────────────────┬──────────────────┐
│ Search [_______________]   F2 Đồ uống F3 Đồ │   Cart           │
│                                              │ ─────────        │
│  ┌────────┐ ┌────────┐ ┌────────┐           │ Coca  ×2  30.000 │
│  │ Coca   │ │ Bò Húc │ │ Mì gói │           │ Mì    ×1  10.000 │
│  │ 15k    │ │ 18k    │ │ 10k    │           │ ─────────        │
│  └────────┘ └────────┘ └────────┘           │ Total    40.000  │
│                                              │                  │
│                                              │ [Cash] [Card]    │
│                                              │ [Print] [HĐĐT]   │
└─────────────────────────────────────────────┴──────────────────┘
```

## Decisions

### D1: Folio luôn tồn tại, kể cả walk-in
- Mọi giao dịch tiền có folio. Walk-in retail → folio kind=retail, đóng ngay sau thanh toán. Đơn giản hóa reporting.

### D2: Service line giữ snapshot price
- `unit_price` được snapshot tại thời điểm bán. Nếu sau này admin sửa giá `service.default_price`, service_line cũ KHÔNG đổi.

### D3: Trả lại dịch vụ = qty âm, không update qty cũ
- Tham chiếu SkyHotel: "qty âm". Giữ audit history rõ.
- Inventory tự cộng lại tồn khi qty âm.

### D4: VAT lưu trên từng line, không trên folio
- Lý do: HĐĐT có thể có nhiều thuế suất khác nhau (phòng 5%, dịch vụ ăn 8%, đồ uống có cồn 10%).

### D5: POS retail KHÔNG track guest mặc định
- Optional: search/chọn guest có sẵn để gán folio (cho khách thân quen).
````

## 📄 `openspec/changes/02-front-desk-pos-and-folio/tasks.md`

```markdown
# Tasks — POS + Folio

## 1. DB & Migration
- [ ] 1.1 Migration `0002_folio_pos.sql` (folio, service_group, service, service_price_variant, service_line, inventory_movement, inventory_threshold, payment + ALTER stay)
- [ ] 1.2 Migrate dữ liệu cũ: tạo folio cho mỗi stay hiện có, link service/payment cũ
- [ ] 1.3 Trigger refresh folio totals on insert/update service_line, payment

## 2. Backend — Folio Service
- [ ] 2.1 `folio_create(kind, ...)` 
- [ ] 2.2 `folio_add_service_line(folio_id, service_id, qty, unit_price?, note?)`
- [ ] 2.3 `folio_remove_service_line(line_id)` — soft via reverse?
- [ ] 2.4 `folio_add_payment(folio_id, amount, method, is_deposit)`
- [ ] 2.5 `folio_close(folio_id)` — guard: balance phải = 0 hoặc có chuyển công nợ
- [ ] 2.6 `folio_merge(src, dst)` (transaction-safe)
- [ ] 2.7 `folio_refresh_totals(folio_id)`
- [ ] 2.8 `folio_get(folio_id) -> FolioWithLines`

## 3. Backend — Inventory Service
- [ ] 3.1 `inventory_post_movement(service_id, kind, qty, unit_cost?, ref?)`
- [ ] 3.2 `inventory_balance(service_id) -> i64`
- [ ] 3.3 `inventory_check_threshold() -> Vec<LowStockItem>`
- [ ] 3.4 Trigger: khi thêm service_line track_inventory → auto post movement kind=out
- [ ] 3.5 Trigger: khi qty âm → auto post movement kind=return

## 4. Backend — POS Tauri Commands
- [ ] 4.1 `pos_quick_add(service_id, qty)` (folio retail current cashier)
- [ ] 4.2 `pos_open_session()` / `pos_close_session()`
- [ ] 4.3 `pos_search_service(query)` cho autocomplete

## 5. Frontend — POS Page
- [ ] 5.1 Layout: lưới sản phẩm bên trái + cart bên phải
- [ ] 5.2 Tab nhóm dịch vụ (F1..F12 hotkey)
- [ ] 5.3 Search box (focused mặc định)
- [ ] 5.4 Cart với edit qty inline + xóa line
- [ ] 5.5 Payment dialog: tiền mặt / chuyển khoản / thẻ
- [ ] 5.6 Sau thanh toán: in HTML hóa đơn 80mm + clear cart
- [ ] 5.7 Hot-key: Esc=clear, F9=in, F10=thanh toán

## 6. Frontend — Service Catalog Admin
- [ ] 6.1 Page "Dịch vụ & Kho" tab Danh sách dịch vụ
- [ ] 6.2 Form thêm/sửa service với tất cả flag (track_inventory, internal_only, vat_rate)
- [ ] 6.3 Quản lý nhóm dịch vụ (CRUD)
- [ ] 6.4 Page "Nhập kho": form thêm movement kind=in
- [ ] 6.5 Page "Tồn kho hiện tại" với cảnh báo low stock
- [ ] 6.6 Lịch sử movements với filter theo service & ngày

## 7. Frontend — Folio Operations on Room
- [ ] 7.1 Trong dialog "Trả phòng/Cập nhật HĐ": tab "Dịch vụ" — thêm/trả lại
- [ ] 7.2 Trạng thái HĐ: dropdown {Thanh toán tại chỗ, Ký gửi vào phòng khác, Đưa vào công nợ, Chưa thanh toán}
- [ ] 7.3 Khi chọn "Ký gửi vào phòng khác": picker chọn folio đích → confirm
- [ ] 7.4 Hiển thị "Hóa đơn ký gửi từ phòng X" trên folio đích
- [ ] 7.5 Tạo hóa đơn dịch vụ độc lập (button "Tạo hóa đơn dịch vụ" trên dashboard)

## 8. Tests
- [ ] 8.1 Unit folio merge: src lines/payments → dst, src.status=merged
- [ ] 8.2 Unit inventory: add line track → balance giảm
- [ ] 8.3 Unit inventory: line qty âm → balance tăng
- [ ] 8.4 Unit inventory: internal_only không hiện trên POS query
- [ ] 8.5 Integration: full walk-in retail flow (open→add 2 lines→pay→close)
- [ ] 8.6 Integration: room folio + ký gửi sang phòng khác → folio.status=merged
- [ ] 8.7 E2E Vitest: POS hot-key F1, search, add, pay
- [ ] 8.8 Property test: sum of payments + service_lines + room subtotal == folio.total

## 9. Docs
- [ ] 9.1 User guide POS (3 video ngắn: bán lẻ, thêm dv vào phòng, ký gửi)
- [ ] 9.2 README cập nhật mục "POS"
- [ ] 9.3 CHANGELOG
```

## 📄 `openspec/changes/02-front-desk-pos-and-folio/specs/pos/spec.md`

```markdown
# Delta for POS

## ADDED Requirements

### Requirement: Walk-in Retail Sale
The system MUST allow a cashier to create a retail folio (no room linkage), add service lines, accept payment, and print a receipt — all without requiring guest data.

#### Scenario: Quick walk-in
- GIVEN cashier mở POS, tồn kho Coca=10
- WHEN cashier nhấn hotkey F1 (Đồ uống) → click "Coca" 2 lần → "Tiền mặt 30.000"
- THEN folio kind=retail tạo ra, 1 service_line Coca×2 unit_price=15000, payment=30000, folio.status=closed
- AND inventory_movement kind=out qty=2 với ref_id=service_line.id
- AND tồn Coca = 8

### Requirement: Service Inventory Tracking
The system MUST decrement inventory automatically when a `track_inventory` service is sold, and increment when a return (negative qty) is posted. Internal_only services MUST NOT appear in POS catalog.

#### Scenario: Auto decrement on sale
- GIVEN service "Coca" track_inventory=1, balance=5
- WHEN add service_line qty=2
- THEN balance = 3, có movement out qty=2

#### Scenario: Hide internal-only
- GIVEN service "Bàn chải" internal_only=1
- WHEN gọi `pos_search_service("bàn")`
- THEN không trả "Bàn chải"

### Requirement: Low Stock Warning
The system SHALL surface a low-stock warning chip on dashboard for any service where `inventory_balance < threshold.low_warn`.

#### Scenario: Below threshold
- GIVEN Coca balance=4, threshold=10
- WHEN dashboard render
- THEN có chip "Coca: 4/10 ⚠️"

### Requirement: Negative Quantity Return
The system MUST allow posting a service_line with negative qty to represent a guest returning a previously charged service. Inventory increments accordingly.

#### Scenario: Return one Coca
- GIVEN folio F1 đã có service_line Coca qty=3
- WHEN add line Coca qty=-1
- THEN folio subtotal_service = 2 × 15000 = 30000
- AND tồn Coca tăng 1
```

## 📄 `openspec/changes/02-front-desk-pos-and-folio/specs/folio/spec.md`

```markdown
# Delta for Folio

## ADDED Requirements

### Requirement: Folio as Container
The system MUST treat Folio as the single financial container for any group of charges. A folio MAY contain 0..n stays, 0..n service_lines, 0..n payments. A stay MUST belong to exactly one folio.

### Requirement: Folio Transfer (Ký gửi liên phòng)
The system MUST allow merging an open folio into another open folio. After merge: source folio status=merged with merged_into_id pointing to destination; all service_lines, payments, and stays of source are reassigned to destination; destination totals refreshed.

#### Scenario: Family transfer at check-out
- GIVEN folio F1 (room 101) total=500.000, F2 (room 102) total=300.000, both open
- WHEN trả phòng 102, chọn "Ký gửi vào 101"
- THEN F2.status=merged, F2.merged_into_id=F1, F1.total=800.000
- AND room 102 trạng thái dirty (chưa dọn)

### Requirement: Folio Status Transitions
The system MUST enforce valid status transitions:
- `open` → `closed` (khi balance=0 và không còn stay đang ở)
- `open` → `merged` (khi merge sang folio khác)
- `closed` → (terminal)
- `merged` → (terminal)

#### Scenario: Cannot close with non-zero balance
- GIVEN folio F1 total=500.000, paid=300.000, balance=200.000
- WHEN gọi folio_close(F1) without "đưa vào công nợ"
- THEN trả lỗi "Folio còn nợ 200.000đ"
```

## 📄 `openspec/changes/02-front-desk-pos-and-folio/specs/inventory/spec.md`

```markdown
# Delta for Inventory

## ADDED Requirements

### Requirement: Movement Audit Trail
The system MUST record every inventory change as a movement row with kind in {in, out, adjust, return}, immutable. Balance is computed = SUM(qty * direction) per service.

#### Scenario: Audit chain
- GIVEN nhập 100 Coca → bán 30 → trả lại 2 → kiểm kê điều chỉnh -1
- THEN movements gồm 4 dòng (in 100, out 30, return 2, adjust -1)
- AND balance = 100 - 30 + 2 - 1 = 71

### Requirement: FIFO Cost Tracking
The system SHOULD track unit_cost per `in` movement and compute weighted-average cost for reporting (báo cáo bình quân gia quyền tham chiếu SkyHotel).

#### Scenario: Avg cost
- GIVEN nhập 50 Coca @ 12.000 + 50 Coca @ 14.000
- WHEN báo cáo cost
- THEN avg = (50*12000 + 50*14000)/100 = 13.000
```

---

# 🥉 CHANGE 03 — `einvoice-vn-integration` (HĐĐT MISA / Viettel)

## 📄 `openspec/changes/03-einvoice-vn-integration/proposal.md`

```markdown
# Proposal: Tích hợp Hóa đơn điện tử VN (MISA meInvoice + Viettel SInvoice)

## Why
Khách sạn VN BẮT BUỘC phát hành hóa đơn điện tử (HĐĐT) theo:
- **Nghị định 123/2020/NĐ-CP** quy định về HĐĐT.
- **Nghị định 70/2025/NĐ-CP** sửa đổi NĐ123, mở rộng yêu cầu HĐĐT khởi tạo từ máy tính tiền cho hộ kinh doanh, doanh nghiệp ngành dịch vụ ăn uống, lưu trú có doanh thu trên ngưỡng quy định, và áp dụng từ 01/06/2025.

Không có HĐĐT = CapyInn KHÔNG bán được cho khách sạn nào ở VN. Đây là **blocker pháp lý**.

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/huong-dan-khac/cap-nhat-ky-hieu-hoa-don-may-tinh-tien

2 nhà cung cấp HĐĐT phổ biến nhất (target tích hợp đầu tiên):
- **MISA meInvoice** (https://www.meinvoice.vn) — REST API, OAuth2.
- **Viettel SInvoice** (https://sinvoice.viettel.vn) — REST API + SOAP cũ.

(Phase tiếp theo: VNPT, BKAV, EasyInvoice — cùng abstraction.)

## What Changes
- Trait `EInvoiceProvider` trong Rust + 2 impl `MisaProvider`, `ViettelProvider`.
- Cấu hình kết nối: tax_code, ký_hiệu_hóa_đơn (đổi mỗi năm), API key/secret, env (sandbox/production), endpoint URL.
- Trên mỗi folio đóng (close) HOẶC mỗi POS retail thanh toán → option "Phát hành HĐĐT" → gọi provider → lưu mã CQT, mã tra cứu, link PDF.
- Hỗ trợ: phát hành mới, **thay thế** (HĐ sai sót lập thay thế), **điều chỉnh**, **hủy**.
- Queue cho HĐ khi mất Internet → retry tự động.
- Cập nhật ký hiệu hóa đơn theo năm với reminder đầu tháng 1.
- Mã số thuế khách hàng (B2B): nhập tay hoặc chọn từ danh bạ công ty.

## Scope
**In scope:**
- 2 providers: MISA, Viettel (sandbox + production).
- HĐĐT từ folio đóng (room + retail).
- Phát hành / thay thế / hủy.
- Queue + retry offline.
- Lưu PDF/XML local.
- In hóa đơn (HTML preview + link tra cứu CQT).

**Out of scope (giai đoạn này):**
- VNPT, BKAV, EasyInvoice (sẽ thêm sau bằng cùng trait).
- Hóa đơn xuất khẩu / hóa đơn ngoại tệ phức tạp.
- Báo cáo BC26 (sẽ làm cùng change 05 reporting).

## Key Compliance Notes (NĐ 123/2020 + NĐ 70/2025)
- Mỗi HĐĐT có **mã của cơ quan thuế (CQT)** (đối với HĐ có mã) hoặc **không có mã** tùy đăng ký doanh nghiệp.
- HĐ phải có: số HĐ, ký hiệu (vd `1C25TYY`), ngày lập, MST người bán + mua, nội dung hàng hóa/dịch vụ, đơn vị tính, số lượng, đơn giá, thành tiền, thuế suất, tiền thuế, tổng tiền thanh toán, chữ ký số.
- HĐĐT từ máy tính tiền có ký hiệu mẫu khác (`C` thay vì `K`, năm `25` cho 2025...).
- Khi sai → lập HĐ **thay thế** (kèm CV hủy HĐ cũ) hoặc **điều chỉnh** (CV điều chỉnh).
- Lưu trữ: HĐ phải lưu tối thiểu 10 năm (chuẩn kế toán VN).
- Đầu mỗi năm tài chính → đăng ký ký hiệu mới với CQT → cập nhật vào phần mềm.

## Acceptance Scenarios

### A. Cấu hình ban đầu (MISA)
- A1: Admin vào "Cài đặt > HĐĐT" → chọn provider "MISA meInvoice" → nhập tax_code, app_id, secret, environment=sandbox → "Test connection" → trả OK.
- A2: Cấu hình ký hiệu hóa đơn `C25TYY` cho năm 2025.

### B. Phát hành HĐĐT khi check-out
- B1: Folio room 101 đóng, total=520.000đ (480.000 phòng VAT 5% + 40.000 dịch vụ VAT 8%) → click "Phát hành HĐĐT" → MISA trả mã CQT + số HĐ → CapyInn lưu + in PDF.
- B2: Cùng B1 nhưng khách yêu cầu HĐ công ty → nhập MST người mua "0123456789" → MISA xuất HĐ B2B.

### C. Phát hành HĐĐT từ POS retail
- C1: Bán lẻ 2 chai nước 30.000 → thanh toán → option "HĐĐT" → phát hành → in.

### D. Offline queue
- D1: Mất Internet → click "Phát hành" → folio status=`einvoice_pending`, lưu queue → khi có lại Internet, worker tự retry → success → cập nhật mã CQT.

### E. Thay thế HĐ sai
- E1: HĐ B-001 đã phát hành nhầm số tiền → admin chọn "Lập HĐ thay thế" → tạo HĐ B-001-R với reference đến B-001 → MISA xác nhận → B-001 bị flag is_replaced.

### F. Cập nhật ký hiệu năm mới
- F1: Ngày 01/01/2026 → app banner "Đã sang năm mới — vui lòng cập nhật ký hiệu hóa đơn" → admin update từ `C25TYY` thành `C26TYY` → save.

### G. Multi-provider switch
- G1: Khách sạn đổi từ MISA sang Viettel → admin chọn Viettel + nhập credential → HĐ cũ vẫn link MISA, HĐ mới link Viettel.

## Risks
- API documentation cả 2 nhà cung cấp đều có thể đổi không báo trước. → Mitigation: viết integration test với mock + 1 test thực với sandbox account/tuần.
- Chữ ký số: 2 cách — nhà cung cấp tự ký bằng cert họ giữ, hoặc khách sạn tự dùng USB token. v1 chỉ hỗ trợ phương án 1 (đơn giản hơn).
- Sandbox khác production: phải có flag rõ ràng + warning UI.
```

## 📄 `openspec/changes/03-einvoice-vn-integration/design.md`

````markdown
# Design: HĐĐT VN Integration

## Trait Abstraction (Rust)

```rust
// crates/einvoice/src/lib.rs

#[async_trait]
pub trait EInvoiceProvider: Send + Sync {
    /// Phát hành HĐĐT mới
    async fn issue(&self, req: IssueRequest) -> Result<IssueResponse>;
    /// Lập HĐ thay thế
    async fn replace(&self, original_id: InvoiceId, new_req: IssueRequest) -> Result<IssueResponse>;
    /// Lập HĐ điều chỉnh
    async fn adjust(&self, original_id: InvoiceId, adjustment: AdjustRequest) -> Result<IssueResponse>;
    /// Hủy HĐ
    async fn cancel(&self, id: InvoiceId, reason: String) -> Result<()>;
    /// Tra cứu trạng thái
    async fn lookup(&self, id: InvoiceId) -> Result<InvoiceStatus>;
    /// Tải PDF/XML
    async fn download(&self, id: InvoiceId, format: Format) -> Result<Vec<u8>>;
    /// Health check
    async fn ping(&self) -> Result<()>;
}

pub struct IssueRequest {
    pub series: String,           // "C25TYY"
    pub invoice_date: NaiveDate,
    pub seller: SellerInfo,        // tax_code, name, address
    pub buyer: Option<BuyerInfo>,  // tax_code optional (B2C)
    pub items: Vec<InvoiceLine>,
    pub payment_method: PaymentMethod,
    pub note: Option<String>,
    pub idempotency_key: String,   // = folio.id để retry an toàn
}

pub struct InvoiceLine {
    pub name: String,
    pub unit: String,
    pub qty: i64,                  // có thể âm cho HĐ điều chỉnh
    pub unit_price: i64,
    pub vat_rate: u8,              // 0/5/8/10
    pub amount_excl_vat: i64,
    pub vat_amount: i64,
    pub amount_incl_vat: i64,
}

pub struct IssueResponse {
    pub provider_invoice_id: String,
    pub invoice_number: String,    // số HĐ do CQT cấp
    pub series: String,
    pub cqt_code: Option<String>,  // mã của CQT (nếu HĐ có mã)
    pub lookup_code: String,       // mã tra cứu công khai
    pub issued_at: DateTime<Utc>,
    pub pdf_url: Option<String>,
    pub xml: Option<String>,
}
```

## Provider Implementations

### MISA meInvoice
```rust
pub struct MisaProvider {
    pub tax_code: String,
    pub app_id: String,
    pub app_secret: String,
    pub base_url: String, // sandbox: https://sandbox.meinvoice.vn, prod: https://api.meinvoice.vn
    pub access_token: Arc<Mutex<Option<TokenCache>>>,
}

#[async_trait]
impl EInvoiceProvider for MisaProvider {
    async fn issue(&self, req: IssueRequest) -> Result<IssueResponse> {
        let token = self.ensure_token().await?;
        let body = self.map_to_misa_body(&req);
        let resp = http_post(&format!("{}/api/v1/invoices/issue", self.base_url))
            .bearer(&token)
            .json(&body)
            .header("X-Idempotency-Key", &req.idempotency_key)
            .send().await?;
        self.parse_misa_response(resp).await
    }
    // ...
}
```

### Viettel SInvoice
```rust
pub struct ViettelProvider {
    pub tax_code: String,
    pub username: String,
    pub password: String,  // encrypted at rest via OS keyring
    pub base_url: String,
    pub session: Arc<Mutex<Option<ViettelSession>>>,
}
```

## DB Schema (Migration `0003_einvoice.sql`)

```sql
CREATE TABLE einvoice_provider_config (
  id            TEXT PRIMARY KEY,
  property_id   TEXT NOT NULL,
  provider      TEXT NOT NULL CHECK(provider IN ('misa','viettel','vnpt','bkav')),
  environment   TEXT NOT NULL CHECK(environment IN ('sandbox','production')),
  tax_code      TEXT NOT NULL,
  series        TEXT NOT NULL,            -- "C25TYY"
  series_year   INTEGER NOT NULL,         -- 2025; reminder đổi đầu năm
  credentials_json TEXT NOT NULL,         -- encrypted JSON (OS keyring key id)
  base_url      TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE einvoice (
  id              TEXT PRIMARY KEY,            -- ULID
  property_id     TEXT NOT NULL,
  folio_id        TEXT REFERENCES folio(id),   -- NULL nếu HĐ standalone
  provider        TEXT NOT NULL,
  provider_invoice_id TEXT,
  series          TEXT NOT NULL,
  invoice_number  TEXT,
  cqt_code        TEXT,
  lookup_code     TEXT,
  status          TEXT NOT NULL CHECK(status IN (
                       'draft','pending','issued','replaced','adjusted','cancelled','failed')),
  issue_request_json TEXT NOT NULL,           -- snapshot input
  issue_response_json TEXT,                   -- response from provider
  pdf_path        TEXT,                       -- ~/CapyInn/einvoice/...
  xml_path        TEXT,
  buyer_tax_code  TEXT,
  buyer_name      TEXT,
  buyer_address   TEXT,
  total           INTEGER NOT NULL,
  vat_total       INTEGER NOT NULL,
  replaces_id     TEXT REFERENCES einvoice(id),
  adjusts_id      TEXT REFERENCES einvoice(id),
  cancelled_reason TEXT,
  issued_at       TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  created_by      TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT
);

CREATE INDEX idx_einvoice_status ON einvoice(status);
CREATE INDEX idx_einvoice_folio ON einvoice(folio_id);
```

## Queue & Retry

```rust
// Background worker chạy mỗi 30 giây
async fn einvoice_worker(pool: SqlitePool) {
    loop {
        tokio::time::sleep(Duration::from_secs(30)).await;
        let pending: Vec<EInvoiceRow> = sqlx::query_as!(
            EInvoiceRow,
            "SELECT * FROM einvoice WHERE status='pending' AND retry_count < 10 ORDER BY created_at"
        ).fetch_all(&pool).await.unwrap_or_default();

        for row in pending {
            let provider = build_provider(&row.provider, &row.property_id, &pool).await?;
            match provider.issue(parse(row.issue_request_json)).await {
                Ok(resp) => mark_issued(&pool, row.id, resp).await?,
                Err(e) if e.is_transient() => {
                    increment_retry(&pool, row.id, e.to_string()).await?;
                }
                Err(e) => {
                    mark_failed(&pool, row.id, e.to_string()).await?;
                }
            }
        }
    }
}
```

## Security

### Credentials at rest
- API key/secret KHÔNG lưu plain text trong SQLite.
- Dùng **Tauri keyring** (qua crate `keyring-rs`): credentials lưu trong:
  - macOS Keychain
  - Windows Credential Manager
  - Linux Secret Service (libsecret)
- DB chỉ lưu `keyring_handle: String` (vd `capyinn.einvoice.misa.{property_id}`).

### Idempotency
- Mọi `issue()` request gửi kèm `X-Idempotency-Key = einvoice.id` (= ULID).
- Provider hỗ trợ idempotency thì retry an toàn. Nếu không, ta check qua `lookup` trước khi retry.

## UI Flows

### Cài đặt provider
```
[Cài đặt > HĐĐT]
  Provider: [MISA ▼]
  Environment: [Sandbox ▼]
  Tax code (MST): [______________]
  App ID: [________]
  App Secret: [********]
  Series (Ký hiệu HĐ): [C25TYY] (đổi đầu năm)
  Base URL: [https://sandbox.meinvoice.vn]
  [Test connection]  [Save]
```

### Phát hành từ folio
```
[Trả phòng / Folio detail]
  ...
  [✓] Đã thanh toán
  [☐] Phát hành HĐĐT
       MST người mua: [________] (optional)
       Tên đơn vị:     [________]
       Địa chỉ:        [________]
  [Trả phòng & Phát hành HĐ]
```

### Reminder đầu năm
```
🟡 Đã sang năm 2026 — vui lòng cập nhật ký hiệu hóa đơn mới (hiện tại: C25TYY).
   [Cập nhật ngay]  [Để sau]
```

## Decisions

### D1: Idempotency key = einvoice.id
- Insert einvoice row với status='pending' TRƯỚC khi gọi API. Dùng id làm idempotency key. → retry không tạo trùng.

### D2: Sandbox flag rất rõ ràng trên UI
- Banner đỏ "🚨 SANDBOX — KHÔNG có giá trị pháp lý" trên mọi HĐ phát hành ở sandbox.

### D3: KHÔNG tự động phát hành HĐĐT
- User phải tick "Phát hành HĐĐT" trong dialog check-out / POS pay. Tránh phát hành nhầm cho khách không cần HĐ.
- Có flag global "Tự động phát hành cho mọi giao dịch ≥ X đồng" nếu khách sạn muốn.

### D4: Lưu PDF/XML offline
- Sau khi issued thành công, tải PDF + XML về `~/CapyInn/einvoice/{year}/{series}/{number}.{pdf|xml}`. Có thể offline tra cứu.

### D5: Format mapping
- Tạo module `mapping/folio_to_invoice.rs` dịch folio → IssueRequest. 1 folio → 1 invoice. Group line by VAT rate. Phòng và service đứng riêng line nếu khác VAT.
````

## 📄 `openspec/changes/03-einvoice-vn-integration/tasks.md`

```markdown
# Tasks — HĐĐT VN

## 1. Crate & Trait
- [ ] 1.1 Tạo `crates/einvoice/` với trait + types chung
- [ ] 1.2 `EInvoiceProvider` async trait với 6 methods
- [ ] 1.3 Lỗi phân loại: `Transient` (network, 5xx) vs `Permanent` (4xx, validation)

## 2. MISA Provider
- [ ] 2.1 Đọc API doc MISA meInvoice (sandbox), liệt kê endpoint
- [ ] 2.2 OAuth2 token cache + refresh
- [ ] 2.3 `issue()` mapping CapyInn IssueRequest → MISA payload
- [ ] 2.4 `lookup()`, `cancel()`, `replace()`, `download()`
- [ ] 2.5 Mock server cho integration test
- [ ] 2.6 Test với sandbox account thật (1 test/ngày trong CI optional)

## 3. Viettel Provider
- [ ] 3.1 Đọc API doc Viettel SInvoice
- [ ] 3.2 Auth + session
- [ ] 3.3 Tất cả methods như MISA
- [ ] 3.4 Mock + sandbox test

## 4. DB & Migration
- [ ] 4.1 Migration `0003_einvoice.sql`
- [ ] 4.2 Index trên status, folio_id, idempotency_key
- [ ] 4.3 Trigger updated_at on einvoice

## 5. Mapping & Domain
- [ ] 5.1 `folio_to_invoice(folio_id) -> IssueRequest`
- [ ] 5.2 Group lines by vat_rate
- [ ] 5.3 Tính thành tiền chưa VAT, tiền VAT, tổng (tránh sai số rounding — luôn từ unit_price × qty)
- [ ] 5.4 Validate MST người mua (chuẩn 10 hoặc 13 chữ số)

## 6. Background Worker
- [ ] 6.1 Tokio task `einvoice_worker` retry pending mỗi 30s
- [ ] 6.2 Exponential backoff (30s, 1m, 2m, 5m, max 30m)
- [ ] 6.3 Sau 10 lần fail → status=failed + notification UI

## 7. Tauri Commands
- [ ] 7.1 `einvoice_issue_for_folio(folio_id, buyer_info?)`
- [ ] 7.2 `einvoice_issue_standalone(items, buyer_info?)` (cho POS)
- [ ] 7.3 `einvoice_replace(original_id, items)`
- [ ] 7.4 `einvoice_cancel(id, reason)`
- [ ] 7.5 `einvoice_download_pdf(id) -> path`
- [ ] 7.6 `einvoice_test_connection(provider, config)`
- [ ] 7.7 `einvoice_provider_config_upsert(...)`

## 8. Security
- [ ] 8.1 `keyring-rs` integration cho credentials
- [ ] 8.2 Migrate credentials_json → keyring nếu user import config cũ
- [ ] 8.3 Audit log mọi thao tác phát hành/hủy/thay thế

## 9. Frontend — Settings
- [ ] 9.1 Page "Cài đặt > HĐĐT" với form provider config
- [ ] 9.2 Test Connection button + result chip
- [ ] 9.3 Cảnh báo Sandbox đỏ
- [ ] 9.4 Reminder cập nhật ký hiệu đầu năm (kiểm tra mỗi launch nếu series_year < current_year)

## 10. Frontend — Issue Flow
- [ ] 10.1 Trong dialog check-out: section "HĐĐT" với checkbox + form buyer
- [ ] 10.2 Trong POS pay: button "Phát hành HĐĐT"
- [ ] 10.3 Page "Danh sách HĐĐT" với filter (status, ngày, provider)
- [ ] 10.4 Detail page mỗi HĐ: thông tin + link PDF + lookup_code (QR)
- [ ] 10.5 Action menu: Tải PDF, Tra cứu CQT (mở browser), Lập HĐ thay thế, Hủy HĐ
- [ ] 10.6 Notification khi có HĐ pending lâu / failed

## 11. Tests
- [ ] 11.1 Unit mapping folio → IssueRequest cho 5 case (room only, room+service, B2C, B2B, multi-VAT)
- [ ] 11.2 Test rounding: tổng line items + VAT == total folio (không sai 1đ)
- [ ] 11.3 Mock MISA: issue → success → row.status=issued
- [ ] 11.4 Mock MISA: 500 error → row.status=pending, retry_count++
- [ ] 11.5 Mock MISA: 400 validation → row.status=failed
- [ ] 11.6 Idempotency: gọi issue 2 lần với cùng folio → chỉ tạo 1 row
- [ ] 11.7 Replace flow: original.status=replaced
- [ ] 11.8 Sandbox account real: 1 issue + 1 cancel test thủ công

## 12. Docs
- [ ] 12.1 User guide cấu hình MISA (step-by-step)
- [ ] 12.2 User guide cấu hình Viettel
- [ ] 12.3 FAQ về HĐĐT (NĐ 123, NĐ 70, ký hiệu, MST)
- [ ] 12.4 README mục "E-Invoice VN"
- [ ] 12.5 CHANGELOG
```

## 📄 `openspec/changes/03-einvoice-vn-integration/specs/einvoice/spec.md`

```markdown
# Delta for E-Invoice

## ADDED Requirements

### Requirement: Multi-Provider Architecture
The system MUST abstract e-invoice operations behind a provider trait, with built-in implementations for MISA meInvoice and Viettel SInvoice. Adding a new provider MUST NOT require changes to consuming code.

#### Scenario: Switch provider
- GIVEN khách sạn đã phát hành 100 HĐ qua MISA, đổi sang Viettel
- WHEN admin chọn Viettel + cấu hình credential mới + save
- THEN HĐ mới link Viettel; HĐ cũ vẫn link MISA + tra cứu được

### Requirement: Issue from Folio
The system MUST allow issuing an e-invoice for any closed or merging folio. The folio's lines (room + services + surcharges) MUST be mapped to invoice lines preserving VAT rates per line.

#### Scenario: Multi-VAT folio
- GIVEN folio với phòng VAT 5%, đồ uống VAT 8%, tour VAT 10%
- WHEN phát hành HĐĐT
- THEN HĐ có 3 line groups, mỗi group đúng VAT rate
- AND tổng tiền VAT = sum(vat_amount per line)

### Requirement: Issue Standalone (POS Retail)
The system MUST allow issuing an e-invoice directly from POS retail without folio linkage, for walk-in service-only customers.

#### Scenario: POS retail invoice
- GIVEN POS sale 2 chai nước 30.000đ, khách yêu cầu hóa đơn cá nhân
- WHEN cashier click "Phát hành HĐĐT" + nhập tên + địa chỉ (không MST)
- THEN provider trả về số HĐ + lookup_code, in trên hóa đơn 80mm

### Requirement: Replace Invoice (HĐ Thay Thế)
The system MUST support issuing a replacement e-invoice referencing the original. The original status becomes `replaced`. Auditing MUST track who, when, why.

#### Scenario: Wrong amount, replace
- GIVEN HĐ B-001 đã issued với total=500.000đ nhưng đúng phải là 520.000đ
- WHEN admin "Lập HĐ thay thế" → nhập lý do "Sai số tiền" → submit với items đã sửa
- THEN tạo HĐ B-002 với replaces_id=B-001, B-001.status='replaced'
- AND audit log có entry actor + reason

### Requirement: Cancel Invoice
The system MUST support cancelling an issued e-invoice with a mandatory reason text. Cancelled invoices MUST NOT count in revenue reports.

#### Scenario: Cancel for wrong customer
- GIVEN HĐ issued cho khách A, lễ tân chọn nhầm khách
- WHEN admin "Hủy HĐ" + reason "Sai khách hàng"
- THEN status=cancelled, cancelled_reason="Sai khách hàng"
- AND báo cáo doanh thu không cộng HĐ này

### Requirement: Offline Queue with Retry
The system MUST queue issue requests when provider is unreachable, and retry automatically when connectivity returns. Retry MUST use exponential backoff up to 30 minutes; after 10 failures, status becomes `failed` and a notification is shown.

#### Scenario: Issue offline → online
- GIVEN không có Internet
- WHEN user click "Phát hành" trên folio
- THEN tạo einvoice row status='pending', không gọi API
- AND khi có Internet (ví dụ 5 phút sau), worker retry → status='issued'

#### Scenario: Permanent failure
- GIVEN provider trả 400 "Tax code invalid" (lỗi cấu hình)
- WHEN worker retry
- THEN status='failed' ngay (không retry vì lỗi permanent)
- AND notification UI cho admin

### Requirement: Idempotency
The system MUST guarantee that issuing for the same folio twice produces only one e-invoice. Implementation: insert einvoice row before API call, use einvoice.id as idempotency key.

#### Scenario: Double-click
- GIVEN user double-click "Phát hành" rất nhanh
- WHEN 2 requests đi
- THEN chỉ 1 einvoice row tạo ra (DB unique constraint trên folio_id WHERE status NOT IN ('cancelled','failed'))

### Requirement: Local PDF/XML Archive
The system MUST download and store PDF and XML of every successfully issued invoice locally under `~/CapyInn/einvoice/{year}/{series}/{number}.{ext}`, accessible offline.

#### Scenario: Offline lookup
- GIVEN HĐ B-001 đã issued, có pdf_path
- WHEN không có Internet, user click "Xem HĐ"
- THEN PDF mở từ local, không gọi network

### Requirement: Annual Series Update Reminder
The system MUST detect when current calendar year exceeds `series_year` of active provider config, and display a non-dismissable banner reminding admin to update the series.

#### Scenario: Year rollover
- GIVEN active config series='C25TYY' series_year=2025
- WHEN ngày 02/01/2026, app khởi động
- THEN banner đỏ: "Đã sang năm 2026 — vui lòng cập nhật ký hiệu hóa đơn"
- AND link "Cập nhật ngay" → settings page với field highlight
```

## 📄 `openspec/changes/03-einvoice-vn-integration/specs/tax-config/spec.md`

```markdown
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
```

---

# CHANGE 04 — `shift-cash-management`

## 📄 `openspec/changes/04-shift-cash-management/proposal.md`

```markdown
# Proposal: Giao ca + Giao tiền quản lý + Chênh lệch

## Why
Khách sạn vận hành 24/7 với nhân viên ca. Mỗi đầu/cuối ca cần đối soát tiền:
- Tiền nhận từ ca trước
- Tiền thu trong ca (cash + bank)
- Tiền chi trong ca
- Tiền giao quản lý (rút khỏi quầy)
- Tiền giao ca sau = nhận trước + thu - chi - giao quản lý
- **Chênh lệch** giữa tiền thực tế trong két và tiền hệ thống

Tham chiếu SkyHotel:
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/giao-ca
- https://hotro.skyhotel.vn/docs/huong-dan-thao-tac-co-ban/giao-tien-quan-ly

## What Changes
- Khái niệm `shift` (ca làm việc) với owner = user, time_open + time_close.
- Mọi `payment`, `expense_voucher`, `cash_movement` link đến shift_id của user lúc tạo.
- Flow giao ca: tính tổng → cashier nhập số tiền thực có → ghi nhận chênh lệch → logout cashier cũ + login cashier mới (cùng PIN/password).
- Flow giao tiền quản lý: rút tiền khỏi quầy → ghi `cash_movement` kind=manager_withdraw.
- Lịch sử giao ca + chênh lệch (mỗi ca xem được).
- Option "giao ca chỉ tổng kết tiền mặt" (cấu hình chung).

## Acceptance Scenarios

### A. Giao ca cơ bản
- A1: Cashier A mở ca lúc 06:00 với 880.000đ nhận từ ca trước. Trong ca thu 3.640.000đ tiền mặt từ folio + retail. Đến 14:00, A giao ca cho B → hệ thống tính 880 + 3640 = 4.520.000đ → B confirm.

### B. Có giao tiền quản lý giữa ca
- B1: Tiếp A1, lúc 12:00 A giao quản lý 4.000.000đ → cash_movement -4M. Đến 14:00 giao ca: 880 + 3640 - 4000 = **520.000đ**.

### C. Có chênh lệch
- C1: Ca tính ra 520.000đ nhưng A đếm két thực = 510.000đ → A nhập chênh lệch -10.000đ với note "thiếu" → giao 510.000đ cho B + entry chênh lệch lưu lại.

### D. Lần đầu giao ca (chưa có ca trước)
- D1: Lần đầu setup, A nhập tiền thực có 1.000.000đ vào "Tiền chênh lệch" → từ giờ hệ thống có baseline.

### E. Giao ca chỉ tiền mặt (config)
- E1: Cấu hình chung tick "Giao ca chỉ tiền mặt" → khi tính tổng, bỏ qua các payment method ≠ cash.

## Approach
- Schema `shift`, `cash_movement`, `shift_handover_record`.
- Flow logout-then-login: dùng Tauri secure store cho session, không persistent cookie.
- Refresh totals dynamic — không cache, query trực tiếp từ payment + expense.
```

## 📄 `openspec/changes/04-shift-cash-management/design.md`

````markdown
# Design: Shift & Cash

## DB Schema (Migration `0004_shift.sql`)

```sql
CREATE TABLE shift (
  id            TEXT PRIMARY KEY,
  property_id   TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  opened_at     TEXT NOT NULL,
  closed_at     TEXT,                            -- NULL = open
  cash_in_at_open    INTEGER NOT NULL DEFAULT 0, -- nhận từ ca trước
  cash_collected     INTEGER NOT NULL DEFAULT 0, -- computed at close
  cash_handed_to_manager INTEGER NOT NULL DEFAULT 0,
  cash_at_close      INTEGER,                    -- system computed
  cash_actual_count  INTEGER,                    -- cashier nhập tay (đếm két)
  variance           INTEGER,                    -- = actual - system
  variance_note      TEXT,
  next_shift_id      TEXT REFERENCES shift(id),
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_shift_user_open ON shift(user_id, closed_at);

CREATE TABLE cash_movement (
  id          TEXT PRIMARY KEY,
  shift_id    TEXT NOT NULL REFERENCES shift(id),
  kind        TEXT NOT NULL CHECK(kind IN (
                  'opening_balance','manager_withdraw','manager_deposit',
                  'expense','adjustment')),
  amount      INTEGER NOT NULL,                  -- positive = into drawer, negative = out
  ref_type    TEXT,                              -- 'expense_voucher' etc.
  ref_id      TEXT,
  note        TEXT,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
  by_user     TEXT NOT NULL
);

-- ALTER payment + expense to link shift
ALTER TABLE payment ADD COLUMN shift_id TEXT REFERENCES shift(id);
```

## Algorithm: Compute Shift Totals

```rust
pub async fn compute_shift_totals(shift_id: ShiftId, conn: &Conn) -> ShiftTotals {
    let cash_only = config::get("handover_cash_only").await.unwrap_or(false);

    let collected: i64 = sqlx::query_scalar!(
        "SELECT COALESCE(SUM(amount),0) FROM payment
         WHERE shift_id = ?1
         AND (?2 = 0 OR method = 'cash')",
        shift_id, cash_only as i32
    ).fetch_one(conn).await?;

    let withdraws: i64 = sqlx::query_scalar!(
        "SELECT COALESCE(SUM(-amount),0) FROM cash_movement
         WHERE shift_id = ?1 AND kind='manager_withdraw'",
        shift_id
    ).fetch_one(conn).await?;

    let opening: i64 = sqlx::query_scalar!(
        "SELECT cash_in_at_open FROM shift WHERE id=?1",
        shift_id
    ).fetch_one(conn).await?;

    let expenses: i64 = sqlx::query_scalar!(
        "SELECT COALESCE(SUM(amount),0) FROM cash_movement
         WHERE shift_id = ?1 AND kind='expense'",
        shift_id
    ).fetch_one(conn).await?;

    ShiftTotals {
        opening,
        collected,
        withdraws,
        expenses,
        system_total: opening + collected - withdraws - expenses,
    }
}
```

## UI: Handover Dialog

```
┌────────────────────────────────────────────────┐
│ Giao ca — Cashier A → Cashier B                │
├────────────────────────────────────────────────┤
│ Nhận từ ca trước:           880.000           │
│ Thu trong ca:              3.640.000           │
│ Giao quản lý:             -4.000.000           │
│ Chi trong ca:                       0          │
│ ─────────────────────────────────────────      │
│ Hệ thống tính:              520.000           │
│                                                │
│ Tiền thực có (đếm két): [_______]              │
│ Chênh lệch:                                    │
│ Ghi chú:                                       │
│                                                │
│ Người nhận ca: [Cashier B ▼]                   │
│ Mật khẩu B:    [________]                      │
│                                                │
│        [Hủy]    [Giao ca]                      │
└────────────────────────────────────────────────┘
```

## Decisions

### D1: Mọi payment phải có shift_id
- Lúc tạo payment, query "active shift" của current user. Nếu không có → tự mở shift mới với cash_in=0.
- Migration: payment cũ không có shift_id → để NULL, không count vào báo cáo shift.

### D2: Variance là -, 0, hoặc +
- variance < 0: thiếu tiền (mất, nhân viên bù)
- variance > 0: dư tiền (sai sót, ghi nhận)
- Đều cần `variance_note`.

### D3: Logout + Login transaction
- Action "giao ca" wraps trong DB transaction:
  1. Compute totals
  2. Update shift cũ: closed_at, cash_at_close, cash_actual_count, variance
  3. Insert shift mới của user mới với cash_in_at_open = cash_actual_count
  4. Update shift cũ.next_shift_id
  5. Commit → logout user cũ → login user mới
````

## 📄 `openspec/changes/04-shift-cash-management/tasks.md`

```markdown
# Tasks — Shift & Cash

## 1. DB
- [ ] 1.1 Migration `0004_shift.sql`
- [ ] 1.2 ALTER payment thêm shift_id (nullable cho dữ liệu cũ)
- [ ] 1.3 Trigger: insert payment → set shift_id = active_shift của current_user

## 2. Backend
- [ ] 2.1 `shift_open(user_id, opening_balance)` 
- [ ] 2.2 `shift_get_active(user_id)`
- [ ] 2.3 `shift_compute_totals(shift_id)`
- [ ] 2.4 `shift_handover(from_shift, to_user, actual_count, variance_note)` (transaction)
- [ ] 2.5 `cash_movement_post(shift_id, kind, amount, note)`
- [ ] 2.6 `manager_withdraw(amount, by_user_id, password)` (verify password)
- [ ] 2.7 `shift_history(date_from, date_to)`

## 3. Frontend
- [ ] 3.1 Top bar đỏ "Giao ca, giao tiền" (như SkyHotel)
- [ ] 3.2 Dialog Handover với computed totals
- [ ] 3.3 Dialog "Giao tiền quản lý" với password
- [ ] 3.4 Page "Lịch sử giao ca" + filter
- [ ] 3.5 Page "Lịch sử giao tiền"
- [ ] 3.6 Settings: "Giao ca chỉ tiền mặt" flag

## 4. Tests
- [ ] 4.1 Unit compute_totals 4 case
- [ ] 4.2 Integration handover full flow
- [ ] 4.3 Test variance ±
- [ ] 4.4 Test config cash_only
- [ ] 4.5 Test concurrent open shift cùng user → error

## 5. Docs
- [ ] 5.1 User guide
- [ ] 5.2 CHANGELOG
```

## 📄 `openspec/changes/04-shift-cash-management/specs/shift/spec.md`

```markdown
# Delta for Shift

## ADDED Requirements

### Requirement: Shift Lifecycle
The system MUST track work shifts per cashier. Opening a shift records `cash_in_at_open`. Closing computes totals and records `cash_actual_count` + `variance`. Each user MUST have at most one open shift at a time.

#### Scenario: Open shift
- GIVEN user A chưa có shift mở
- WHEN A đăng nhập + xác nhận opening_balance=880.000đ
- THEN shift mở với cash_in_at_open=880000

#### Scenario: Cannot open second shift
- GIVEN user A đang có shift mở
- WHEN gọi shift_open(A, ...) lần 2
- THEN trả lỗi "User đã có ca đang mở"

### Requirement: Handover Computes System Total
On handover, the system MUST compute `system_total = opening + collected - withdraws - expenses`. Cashier inputs `cash_actual_count`. `variance = actual - system`.

#### Scenario: Standard handover
- GIVEN shift opening=880k, collected=3640k, withdraws=4000k
- WHEN compute totals
- THEN system_total = 520.000đ

#### Scenario: With variance
- GIVEN system_total=520.000đ, cashier đếm két = 510.000đ
- WHEN handover
- THEN variance = -10.000đ, lưu kèm note bắt buộc

### Requirement: Manager Withdraw
The system MUST allow a user with `cash_manager_withdraw` permission to withdraw cash from drawer, recorded as cash_movement kind=manager_withdraw with negative amount, password-verified.

#### Scenario: Manager takes 4M
- GIVEN shift đang mở, balance=4.520.000đ
- WHEN manager withdraw 4.000.000 với password
- THEN cash_movement -4.000.000 lưu, system_total còn 520.000đ
```

---

# CHANGE 05 — `rbac-audit-multiproperty`

## 📄 `openspec/changes/05-rbac-audit-multiproperty/proposal.md`

```markdown
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
```

## 📄 `openspec/changes/05-rbac-audit-multiproperty/design.md`

````markdown
# Design: RBAC + Audit + Multi-Property

## DB Schema (Migration `0005_rbac_audit.sql`)

```sql
CREATE TABLE property (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  tax_code    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ALTER tất cả các bảng nghiệp vụ thêm property_id (NOT NULL after migrate)
-- room, room_type, rate_plan, folio, einvoice, shift, ...

CREATE TABLE role (
  id           TEXT PRIMARY KEY,
  property_id  TEXT NOT NULL REFERENCES property(id),
  name         TEXT NOT NULL,
  description  TEXT,
  is_built_in  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(property_id, name)
);

CREATE TABLE permission (
  code  TEXT PRIMARY KEY,        -- 'flexible_pricing'
  label TEXT NOT NULL,            -- 'Linh động giá phòng'
  group_label TEXT
);

CREATE TABLE role_permission (
  role_id     TEXT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  permission  TEXT NOT NULL REFERENCES permission(code),
  PRIMARY KEY (role_id, permission)
);

CREATE TABLE app_user (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,    -- argon2
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE user_property_role (
  user_id      TEXT NOT NULL REFERENCES app_user(id),
  property_id  TEXT NOT NULL REFERENCES property(id),
  role_id      TEXT NOT NULL REFERENCES role(id),
  PRIMARY KEY (user_id, property_id, role_id)
);

CREATE TABLE audit_event (
  id          TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  action      TEXT NOT NULL,           -- 'stay.edit_checkin_time'
  entity_type TEXT NOT NULL,           -- 'stay','room','folio','einvoice'...
  entity_id   TEXT NOT NULL,
  before_json TEXT,
  after_json  TEXT,
  client_info TEXT,                    -- OS + version
  occurred_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audit_action ON audit_event(action);
CREATE INDEX idx_audit_entity ON audit_event(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_event(actor_user_id);
CREATE INDEX idx_audit_time ON audit_event(occurred_at);
```

## Permission Check Pattern

```rust
// macro hoặc helper cho mỗi command
#[tauri::command]
async fn rate_plan_upsert(
    auth: AuthSession,
    plan: RatePlan,
    pool: State<SqlitePool>,
) -> Result<()> {
    auth.require_permission("room_type_edit")?;
    let before = load_rate_plan(plan.id, &pool).await?;
    let after = save_rate_plan(plan, &pool).await?;
    audit::log(&auth, "rate_plan.upsert", "rate_plan", plan.id, before, after, &pool).await?;
    Ok(())
}
```

## Audit Restore

```rust
// Cho action 'room.delete' / 'stay.delete' / 'folio.merge'
pub async fn restore_from_audit(event_id: AuditEventId, pool: &SqlitePool) -> Result<()> {
    let evt = load_audit_event(event_id).await?;
    let before: serde_json::Value = serde_json::from_str(&evt.before_json.ok_or(...))?;
    match evt.entity_type.as_str() {
        "room" => restore_room(before, pool).await,
        "stay" => restore_stay(before, pool).await,
        _ => Err(anyhow!("entity not restorable"))
    }?;
    audit::log_system("audit.restore", &evt.entity_type, &evt.entity_id, /*...*/);
    Ok(())
}
```
````

## 📄 `openspec/changes/05-rbac-audit-multiproperty/tasks.md`

```markdown
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
```

## 📄 `openspec/changes/05-rbac-audit-multiproperty/specs/rbac/spec.md`

```markdown
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
```

## 📄 `openspec/changes/05-rbac-audit-multiproperty/specs/audit/spec.md`

```markdown
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
```

## 📄 `openspec/changes/05-rbac-audit-multiproperty/specs/property/spec.md`

```markdown
# Delta for Property

## ADDED Requirements

### Requirement: Multi-Property Support
The system MUST support multiple properties per user account. Every business entity (room, folio, einvoice, etc.) MUST belong to exactly one property.

#### Scenario: Cross-property isolation
- GIVEN user U có role tại property A nhưng không có ở B
- WHEN U query rooms với current_property=B
- THEN trả lỗi 403 hoặc empty (tùy ngữ cảnh)
```

---

# CHANGE 06 — `windows-printing-hardware`

## 📄 `openspec/changes/06-windows-printing-hardware/proposal.md`

```markdown
# Proposal: Windows First-Class + ESC/POS + Khóa từ + Hardware Integration

## Why
README CapyInn ghi rõ: "verified most heavily on macOS and Apple Silicon. Windows and Linux are not first-class targets yet." → 95% khách sạn VN dùng Windows. **Đây là blocker thị trường**.

Đồng thời, khách sạn cần tích hợp:
- Máy in nhiệt 80mm (ESC/POS) cho hóa đơn quầy.
- Máy in A4/A5 (Canon, HP) cho HĐĐT in copy.
- Khóa từ phòng (Adel, Hune, Dorset, Onity).
- Bộ điều khiển bật/tắt điện qua IP.
- Màn hình thứ 2 hiển thị phòng trống cho khách (privacy).

Tham chiếu SkyHotel: cấu hình chung có sẵn các flag cho tất cả phần cứng trên.

## Scope
**In scope:**
- Windows installer (MSI + code-sign), auto-update qua Tauri updater.
- ESC/POS thermal print 80mm (USB + network).
- Print A4 qua HTML→PDF.
- Khóa từ: trait + 1 impl Adel (phổ biến nhất).
- Bộ điều khiển điện: HTTP/MQTT abstraction.
- Màn hình thứ 2 (Tauri multi-window) với privacy mode.

**Out of scope:**
- Tất cả hãng khóa từ (chỉ làm Adel + framework để thêm sau).
- Barcode scanner.
- Camera CCTV.

## Acceptance
- A1: Build .msi cho Windows 10/11 x64, install không có UAC error, app launch OK.
- A2: In hóa đơn 80mm Epson TM-T82 qua USB, ESC/POS commands đúng (header, items, total, footer).
- A3: In HĐĐT A4 qua máy Canon LBP với mẫu HTML chuẩn.
- A4: Mở/đóng Adel khóa từ qua serial COM/TCP với thẻ phòng.
- A5: Bật/tắt điện phòng qua IP của bộ điều khiển khi check-in/out.
- A6: Mở second window cho màn hình ngoài, hiển thị "Phòng trống: 5" + danh sách phòng (ẩn tên khách phòng đang ở).
```

## 📄 `openspec/changes/06-windows-printing-hardware/design.md`

````markdown
# Design: Windows + Hardware

## Windows Build
- Tauri config `[bundle.windows]` với `wix` và `nsis`.
- Code signing: certificate qua DigiCert hoặc SSL.com (~150-300 USD/năm) — **CẦN ngân sách**.
- Auto-update: Tauri updater + S3/CloudFront bucket cho assets.
- Path conventions: thay `~/CapyInn` → `%APPDATA%\CapyInn` trên Windows; abstract qua `app_data_dir()` của Tauri.

## ESC/POS Print
```rust
// crates/printer/src/escpos.rs
use escpos::printer::{Printer, PrinterConnection};

pub fn print_receipt_80mm(
    template: &ReceiptTemplate,
    printer_uri: &str  // "usb://0x04b8/0x0202" or "tcp://192.168.1.50:9100"
) -> Result<()> {
    let conn = match printer_uri.scheme() {
        "usb" => PrinterConnection::Usb { vendor, product },
        "tcp" => PrinterConnection::Network(addr),
        _ => return Err(...)
    };
    let mut p = Printer::new(conn)?;
    p.init()?;
    p.align_center()?.bold(true)?.size_double()?.write(&template.hotel_name)?;
    p.bold(false)?.size_normal()?.write(&template.address)?;
    p.feed(1)?.align_left()?;
    for line in &template.lines {
        p.write(&format!("{:<20}{:>3} {:>10}", line.name, line.qty, line.price))?;
    }
    p.draw_line()?.align_right()?.bold(true)?.write(&format!("TỔNG: {}", template.total))?;
    p.feed(2)?.cut()?;
    Ok(())
}
```

## Lock Trait
```rust
#[async_trait]
pub trait DoorLockProvider: Send + Sync {
    /// Encode card with room + check-out datetime
    async fn encode_card(&self, room: RoomId, check_out: DateTime<Utc>) -> Result<()>;
    async fn cancel_card(&self, room: RoomId) -> Result<()>;
    async fn read_card(&self) -> Result<CardInfo>;
}

pub struct AdelProvider {
    pub port: String,         // "COM3" or "tcp://192.168.1.51:7000"
    pub has_room_label: bool, // SkyHotel flag
}
```

## Power Controller
```rust
pub trait PowerController {
    async fn turn_on(&self, room: RoomId) -> Result<()>;
    async fn turn_off(&self, room: RoomId) -> Result<()>;
    async fn pulse_for_housekeeping(&self, room: RoomId, max_minutes: u32) -> Result<()>;
}

pub struct HttpPowerController {
    pub base_url: String, // http://192.168.1.100
    pub auth: Option<String>,
}
```

## Second Display
- Tauri webview thứ 2 với route `/public-display`.
- Privacy: query rooms WHERE status='available' chỉ; rooms occupied → render placeholder không tên.
- Auto-refresh 30s.
````

## 📄 `openspec/changes/06-windows-printing-hardware/tasks.md`

```markdown
# Tasks — Windows + Hardware

## 1. Windows Build
- [ ] 1.1 Tauri config Windows bundles (MSI + NSIS)
- [ ] 1.2 GitHub Actions workflow build Windows artifact
- [ ] 1.3 Code signing setup (cert + sign step)
- [ ] 1.4 Auto-updater config + test
- [ ] 1.5 Replace `~/CapyInn` paths → `app_data_dir()`
- [ ] 1.6 Fix any Win-specific path/separator/case issues

## 2. Linux Build
- [ ] 2.1 AppImage + .deb config
- [ ] 2.2 Test trên Ubuntu 22.04

## 3. ESC/POS Printer
- [ ] 3.1 Crate `printer` với template engine
- [ ] 3.2 USB connection (libusb/escpos-rs)
- [ ] 3.3 TCP connection (network printer 9100)
- [ ] 3.4 Templates: receipt 80mm, kitchen ticket
- [ ] 3.5 Page setting: lựa chọn 80mm/A6/A4/A5
- [ ] 3.6 Test với Epson TM-T82, Xprinter XP-58

## 4. A4 Print
- [ ] 4.1 HTML template HĐ + folio detail
- [ ] 4.2 Tauri print API hoặc rust-pdf
- [ ] 4.3 Print preview dialog

## 5. Door Lock
- [ ] 5.1 Trait `DoorLockProvider`
- [ ] 5.2 Adel impl qua serial + TCP
- [ ] 5.3 UI cài đặt port + test connection
- [ ] 5.4 Flag `has_room_label` (SkyHotel) — quyết logic encode

## 6. Power Controller
- [ ] 6.1 Trait + HTTP impl
- [ ] 6.2 Pulse for housekeeping (timeout config)
- [ ] 6.3 UI cài đặt IP + test

## 7. Second Display
- [ ] 7.1 Tauri new window route `/public-display`
- [ ] 7.2 Privacy mode rendering
- [ ] 7.3 Auto-refresh polling
- [ ] 7.4 Cấu hình bật/tắt + chọn monitor

## 8. Tests
- [ ] 8.1 ESC/POS template snapshot
- [ ] 8.2 Smoke Windows build CI
- [ ] 8.3 Adel mock test

## 9. Docs
- [ ] 9.1 Hardware compatibility matrix
- [ ] 9.2 Windows install guide với screenshots
- [ ] 9.3 CHANGELOG
```

## 📄 `openspec/changes/06-windows-printing-hardware/specs/platform/spec.md`

```markdown
# Delta for Platform

## ADDED Requirements

### Requirement: Windows First-Class
The system MUST provide a signed MSI installer for Windows 10/11 x64 with auto-update capability via Tauri updater. All file paths MUST resolve via `app_data_dir()`, not hardcoded `~/`.

### Requirement: Cross-Platform Path Abstraction
The system MUST use Tauri's path API for app_data, app_log, and document directories. Direct `~` references in code are forbidden.
```

## 📄 `openspec/changes/06-windows-printing-hardware/specs/hardware/spec.md`

```markdown
# Delta for Hardware

## ADDED Requirements

### Requirement: ESC/POS Thermal Receipt Printing
The system MUST support printing receipts on 80mm thermal printers via ESC/POS over USB and TCP/IP. Templates MUST be configurable for hotel header/footer.

### Requirement: Door Lock Abstraction
The system MUST abstract door lock card encoding behind a trait. At least one implementation (Adel) MUST be provided. Encoding card MUST happen on check-in; cancellation on check-out.

### Requirement: Power Controller
The system SHOULD support turning room power on/off via HTTP/MQTT to a central power controller. On check-in, turn on; on check-out, turn off; on housekeeping mode, pulse with configurable timeout.

### Requirement: Public Display (Second Monitor)
The system MUST support a second window on a designated monitor showing only available rooms. Occupied rooms MUST NOT show guest names (privacy mode).
```

---

# 📋 TÓM TẮT KẾ HOẠCH

| # | Change | Thời lượng dự kiến | Điều kiện tiên quyết |
|---|---|---|---|
| 01 | pricing-engine-vn | 6-8 tuần | — |
| 02 | front-desk-pos-and-folio | 6-8 tuần | 01 |
| 03 | einvoice-vn-integration | 4-6 tuần | 02 |
| 04 | shift-cash-management | 3-4 tuần | 02 |
| 05 | rbac-audit-multiproperty | 4 tuần | có thể song song với 04 |
| 06 | windows-printing-hardware | 4-6 tuần | 02 (cần POS để in) |

**Tổng**: ~7-9 tháng cho team 4-6 người. Có thể song song 04+05 sau khi 03 xong.

---

## 🚀 Cách dùng bộ kế hoạch này

1. Tại thư mục gốc CapyInn, cài OpenSpec: `npm i -g @fission-ai/openspec`
2. Tạo cấu trúc: `mkdir -p openspec/changes openspec/specs`
3. Copy nội dung trên vào các file tương ứng (giữ đúng cấu trúc cây thư mục đã liệt kê).
4. Validate: `openspec validate 01-pricing-engine-vn` cho từng change.
5. Bắt đầu với change 01: AI assistant đọc `proposal.md` → `design.md` → `tasks.md` rồi implement từng task.
6. Khi xong: `openspec archive 01-pricing-engine-vn` — delta merge vào `openspec/specs/`.

Bạn muốn tôi:
- **(a)** Đi sâu hơn vào một change cụ thể (ví dụ thêm 100+ unit test cases cho pricing engine)?
- **(b)** Tạo bộ migration SQL chi tiết hoàn chỉnh có thể chạy ngay?
- **(c)** Viết mock API spec MISA/Viettel cụ thể từ doc thật của họ?
- **(d)** Thiết kế UI mockup chi tiết cho POS + check-in dialog?