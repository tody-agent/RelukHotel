use crate::{
    dynamic::{AppliesTo, DynamicRule, Strategy},
    rate_plan::{IntradayMode, RatePlan, SurchargeStep, SurchargeValue},
    stay::{CalcInput, CalcOutput, LineItem, Mode},
};
use chrono::{DateTime, Datelike, Timelike, Utc};

pub fn calculate(input: &CalcInput) -> CalcOutput {
    let mode = decide_mode(input);
    let effective_rate =
        apply_dynamic_rules(input.rate_plan, input.dynamic_rules, &mode, input.check_in);

    let mut items: Vec<LineItem> = Vec::new();

    // IntradayMode::AlwaysOneNight — force minimum 1 night charge
    if effective_rate.intraday_mode == IntradayMode::AlwaysOneNight && mode == Mode::Hourly {
        let base = compute_nights(&effective_rate, input, &mut items);
        // Use Mode::Night for extra bed since we're billing as a night stay
        let extra = compute_extra_bed(&effective_rate, Mode::Night, input, &mut items);
        return CalcOutput {
            line_items: items,
            room_subtotal: base + extra,
            currency: "VND".to_string(),
        };
    }

    let base = match mode {
        Mode::Hourly => compute_hourly(&effective_rate, input, &mut items),
        Mode::Night => compute_nights(&effective_rate, input, &mut items),
        Mode::Overnight => compute_overnights(&effective_rate, input, &mut items),
        Mode::Monthly => compute_monthly(&effective_rate, input, &mut items),
        Mode::Auto => compute_nights(&effective_rate, input, &mut items),
    };

    let early = compute_early_surcharge(&effective_rate, mode, input, &mut items);
    let late = compute_late_surcharge(&effective_rate, mode, input, &mut items);
    let extra = compute_extra_bed(&effective_rate, mode, input, &mut items);

    CalcOutput {
        line_items: items,
        room_subtotal: base + early + late + extra,
        currency: "VND".to_string(),
    }
}

// ─── Mode Detection ──────────────────────────────────────────
pub fn decide_mode(input: &CalcInput) -> Mode {
    if let Some(requested) = input.requested_mode {
        if requested != Mode::Auto {
            return requested;
        }
    }

    let duration = input.check_out.signed_duration_since(input.check_in);
    let hours = duration.num_hours();

    if let Some(hourly) = &input.rate_plan.hourly {
        if hours < hourly.max_hours as i64 {
            return Mode::Hourly;
        }
    }

    if let Some(overnight) = &input.rate_plan.overnight {
        let check_in_hour = input.check_in.hour();
        if check_in_hour >= overnight.start_hour as u32 && hours < 24 {
            return Mode::Overnight;
        }
    }

    if input.rate_plan.monthly.is_some() && duration.num_days() >= 28 {
        return Mode::Monthly;
    }

    Mode::Night
}

// ─── Hourly: step function ───────────────────────────────────
fn compute_hourly(rate: &RatePlan, input: &CalcInput, items: &mut Vec<LineItem>) -> u64 {
    let hourly = match &rate.hourly {
        Some(h) => h,
        None => {
            // Fallback to night rate if no hourly config
            return compute_nights(rate, input, items);
        }
    };

    let duration = input.check_out.signed_duration_since(input.check_in);
    let total_minutes = duration.num_minutes().max(0) as u32;
    // Round up using configurable rounding interval (default 60 min)
    let rounding = rate.rounding_minutes.max(1); // prevent div-by-zero
    let rounded_minutes = ((total_minutes + rounding - 1) / rounding) * rounding;
    let hours = rounded_minutes / 60;

    // If exceeds max_hours, fall back to night rate
    if hours >= hourly.max_hours {
        items.push(LineItem {
            description: format!("Vượt {}h → tính theo ngày", hourly.max_hours),
            amount: 0,
        });
        return compute_nights(rate, input, items);
    }

    // Find the matching step (steps are sorted ascending by hour)
    let mut price = 0u64;
    for &(step_hour, step_price) in &hourly.steps {
        if hours <= step_hour {
            price = step_price;
            break;
        }
        price = step_price; // take last step if hours exceeds all steps
    }

    items.push(LineItem {
        description: format!("{} giờ", hours),
        amount: price,
    });

    price
}

// ─── Nightly: N nights × night_rate ──────────────────────────
fn compute_nights(rate: &RatePlan, input: &CalcInput, items: &mut Vec<LineItem>) -> u64 {
    let night_rate = rate.night_rate.unwrap_or(0);
    // Use calendar date difference for accurate night counting
    let nights = calendar_nights(input.check_in, input.check_out).max(1);

    let total = nights * night_rate;
    items.push(LineItem {
        description: format!("{} đêm × {}", nights, format_vnd(night_rate)),
        amount: total,
    });
    total
}

// ─── Overnight: price × 1 ───────────────────────────────────
fn compute_overnights(rate: &RatePlan, _input: &CalcInput, items: &mut Vec<LineItem>) -> u64 {
    let price = rate
        .overnight
        .as_ref()
        .map(|o| o.price)
        .unwrap_or_else(|| rate.night_rate.unwrap_or(0) * 75 / 100);

    items.push(LineItem {
        description: "Qua đêm".to_string(),
        amount: price,
    });
    price
}

// ─── Monthly: full months + residual ─────────────────────────
fn compute_monthly(rate: &RatePlan, input: &CalcInput, items: &mut Vec<LineItem>) -> u64 {
    let monthly = match &rate.monthly {
        Some(m) => m,
        None => return compute_nights(rate, input, items),
    };

    let total_days = calendar_days(input.check_in, input.check_out).max(0);
    let full_months = total_days / 30;
    let residual_days = total_days % 30;

    let mut total = full_months * monthly.price;
    if full_months > 0 {
        items.push(LineItem {
            description: format!("{} tháng × {}", full_months, format_vnd(monthly.price)),
            amount: full_months * monthly.price,
        });
    }

    if residual_days > 0 {
        let residual_amount = match &monthly.residual_mode {
            crate::rate_plan::ResidualMode::PerDay { day_rate } => residual_days * day_rate,
            crate::rate_plan::ResidualMode::FullMonth => monthly.price,
        };
        items.push(LineItem {
            description: format!("{} ngày lẻ", residual_days),
            amount: residual_amount,
        });
        total += residual_amount;
    }

    total
}

// ─── Early Check-in Surcharge ────────────────────────────────
fn compute_early_surcharge(
    rate: &RatePlan,
    mode: Mode,
    input: &CalcInput,
    items: &mut Vec<LineItem>,
) -> u64 {
    if mode == Mode::Hourly || mode == Mode::Monthly {
        return 0;
    }

    let steps = if mode == Mode::Overnight {
        &rate.early_checkin_night
    } else {
        &rate.early_checkin_day
    };

    if steps.is_empty() {
        return 0;
    }

    // For day mode: how many hours before 14:00 standard check-in
    // For overnight: how many hours before overnight_start_hour
    let standard_hour = if mode == Mode::Overnight {
        rate.overnight
            .as_ref()
            .map(|o| o.start_hour as u32)
            .unwrap_or(21)
    } else {
        14 // Standard day check-in at 14:00
    };

    let check_in_hour = input.check_in.hour();
    if check_in_hour >= standard_hour {
        return 0; // Not early
    }

    let early_hours = standard_hour - check_in_hour;
    let amount = resolve_surcharge(steps, early_hours, rate.night_rate.unwrap_or(0));

    if amount > 0 {
        items.push(LineItem {
            description: format!("Check-in sớm {}h", early_hours),
            amount,
        });
    }

    amount
}

// ─── Late Check-out Surcharge ────────────────────────────────
fn compute_late_surcharge(
    rate: &RatePlan,
    mode: Mode,
    input: &CalcInput,
    items: &mut Vec<LineItem>,
) -> u64 {
    if mode == Mode::Hourly || mode == Mode::Monthly {
        return 0;
    }

    let steps = if mode == Mode::Overnight {
        &rate.late_checkout_night
    } else {
        &rate.late_checkout_day
    };

    if steps.is_empty() {
        return 0;
    }

    // Standard checkout: 12:00 (day) or 11:00 (overnight/morning)
    let standard_hour = if mode == Mode::Overnight { 11 } else { 12 };

    let checkout_hour = input.check_out.hour();
    if checkout_hour <= standard_hour {
        return 0; // Not late
    }

    let late_hours = checkout_hour - standard_hour;
    let amount = resolve_surcharge(steps, late_hours, rate.night_rate.unwrap_or(0));

    if amount > 0 {
        items.push(LineItem {
            description: format!("Check-out muộn {}h", late_hours),
            amount,
        });
    }

    amount
}

// ─── Extra Bed ───────────────────────────────────────────────
fn compute_extra_bed(
    rate: &RatePlan,
    mode: Mode,
    input: &CalcInput,
    items: &mut Vec<LineItem>,
) -> u64 {
    if mode == Mode::Hourly {
        return 0; // No extra bed charge for hourly
    }
    if input.occupants <= rate.capacity {
        return 0;
    }

    let extra_people = (input.occupants - rate.capacity) as u64;
    let nights = match mode {
        Mode::Overnight => 1,
        _ => calendar_nights(input.check_in, input.check_out).max(1),
    };

    let amount = extra_people * rate.extra_bed_per_person * nights;
    if amount > 0 {
        items.push(LineItem {
            description: format!(
                "Phụ thu {} người × {} đêm",
                extra_people, nights
            ),
            amount,
        });
    }
    amount
}

// ─── Dynamic Rules Overlay ───────────────────────────────────
fn apply_dynamic_rules(
    rate_plan: &RatePlan,
    rules: &[DynamicRule],
    mode: &Mode,
    check_in: DateTime<Utc>,
) -> RatePlan {
    let mut result = rate_plan.clone();

    for rule in rules {
        if !rule_matches_mode(&rule.applies_to, mode) {
            continue;
        }
        if !rule_matches_time(rule, check_in) {
            continue;
        }

        // Apply strategy to night_rate (primary target)
        if let Some(current) = result.night_rate {
            result.night_rate = Some(apply_strategy(&rule.strategy, current));
        }

        // Also apply to overnight if rule targets it
        if matches!(rule.applies_to, AppliesTo::Overnight) {
            if let Some(ref mut ov) = result.overnight {
                ov.price = apply_strategy(&rule.strategy, ov.price);
            }
        }
    }

    result
}

fn rule_matches_mode(applies_to: &AppliesTo, mode: &Mode) -> bool {
    matches!(
        (applies_to, mode),
        (AppliesTo::Night, Mode::Night)
            | (AppliesTo::Overnight, Mode::Overnight)
            | (AppliesTo::Hourly, Mode::Hourly)
    )
}

fn rule_matches_time(rule: &DynamicRule, dt: DateTime<Utc>) -> bool {
    // Check active window
    if let Some(from) = rule.active_from {
        if dt < from {
            return false;
        }
    }
    if let Some(to) = rule.active_to {
        if dt > to {
            return false;
        }
    }

    // Check weekday mask (bit 0=Mon .. bit 6=Sun)
    let weekday_bit = match dt.weekday() {
        chrono::Weekday::Mon => 0,
        chrono::Weekday::Tue => 1,
        chrono::Weekday::Wed => 2,
        chrono::Weekday::Thu => 3,
        chrono::Weekday::Fri => 4,
        chrono::Weekday::Sat => 5,
        chrono::Weekday::Sun => 6,
    };
    if rule.weekday_mask & (1 << weekday_bit) == 0 {
        return false;
    }

    // Check specific dates if any
    if !rule.specific_dates.is_empty() {
        let date = dt.date_naive();
        if !rule.specific_dates.contains(&date) {
            return false;
        }
    }

    true
}

fn apply_strategy(strategy: &Strategy, current: u64) -> u64 {
    match strategy {
        Strategy::Replace(v) => *v,
        Strategy::Add(delta) => {
            let result = current as i64 + delta;
            result.max(0) as u64
        }
    }
}

// ─── Helpers ─────────────────────────────────────────────────
fn resolve_surcharge(steps: &[SurchargeStep], hours: u32, base_night_rate: u64) -> u64 {
    for step in steps {
        if hours <= step.up_to_hours {
            return match &step.value {
                SurchargeValue::Amount(a) => *a,
                SurchargeValue::PercentOfNight(pct) => base_night_rate * (*pct as u64) / 100,
            };
        }
    }
    // If exceeds all steps, use last step value
    steps
        .last()
        .map(|s| match &s.value {
            SurchargeValue::Amount(a) => *a,
            SurchargeValue::PercentOfNight(pct) => base_night_rate * (*pct as u64) / 100,
        })
        .unwrap_or(0)
}

/// Calendar nights = checkout_date - checkin_date (ignoring time).
fn calendar_nights(check_in: DateTime<Utc>, check_out: DateTime<Utc>) -> u64 {
    let d1 = check_in.date_naive();
    let d2 = check_out.date_naive();
    let diff = (d2 - d1).num_days();
    diff.max(0) as u64
}

/// Calendar days = same as calendar_nights for monthly calculation.
fn calendar_days(check_in: DateTime<Utc>, check_out: DateTime<Utc>) -> u64 {
    calendar_nights(check_in, check_out)
}

fn format_vnd(amount: u64) -> String {
    // Simple VND formatting with dot separator
    let s = amount.to_string();
    let mut result = String::new();
    for (i, c) in s.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            result.push('.');
        }
        result.push(c);
    }
    result.chars().rev().collect::<String>() + "đ"
}

// ─── Tests ───────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;
    use crate::rate_plan::*;
    use chrono::TimeZone;

    fn make_rate_plan() -> RatePlan {
        RatePlan {
            id: "rp-test".to_string(),
            capacity: 2,
            night_rate: Some(350_000),
            overnight: Some(OvernightRate {
                price: 250_000,
                start_hour: 21,
                start_minute: 0,
                end_hour: 6,
                end_minute: 0,
                checkout_hour: 12,
            }),
            monthly: Some(MonthlyRate {
                price: 6_000_000,
                residual_mode: ResidualMode::PerDay {
                    day_rate: 250_000,
                },
            }),
            hourly: Some(HourlyRate {
                steps: vec![(1, 80_000), (2, 100_000), (3, 120_000), (5, 150_000)],
                max_hours: 6,
            }),
            early_checkin_day: vec![
                SurchargeStep { up_to_hours: 1, value: SurchargeValue::PercentOfNight(30) },
                SurchargeStep { up_to_hours: 3, value: SurchargeValue::PercentOfNight(50) },
            ],
            early_checkin_night: vec![],
            late_checkout_day: vec![
                SurchargeStep { up_to_hours: 2, value: SurchargeValue::PercentOfNight(30) },
                SurchargeStep { up_to_hours: 4, value: SurchargeValue::PercentOfNight(50) },
            ],
            late_checkout_night: vec![],
            extra_bed_per_person: 100_000,
            rounding_minutes: 60,
            intraday_mode: IntradayMode::Default,
            standard_checkin_hour: 14,
            standard_checkout_hour: 12,
            auto_overnight_checkin_hour: 22,
            auto_overnight_checkin_minute: 0,
            auto_overnight_checkout_hour: 3,
            auto_overnight_checkout_minute: 0,
            auto_compare_price: true,
            auto_prefer_daily_over_overnight: true,
            surcharge_threshold_minutes: 15,
        }
    }

    fn dt(y: i32, m: u32, d: u32, h: u32, min: u32) -> DateTime<Utc> {
        Utc.with_ymd_and_hms(y, m, d, h, min, 0).unwrap()
    }

    // ── Case A: Motel hourly ─────────────────────────
    #[test]
    fn a1_hourly_1h() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 9, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 80_000);
    }

    #[test]
    fn a2_hourly_2h() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 100_000);
    }

    #[test]
    fn a3_hourly_3h() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 11, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 120_000);
    }

    #[test]
    fn a4_hourly_exceeds_max_fallback_to_night() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 6, 0),
            check_out: dt(2025, 6, 10, 14, 0), // 8h > max_hours=6
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // Falls back to 1 night × 350k
        assert_eq!(out.room_subtotal, 350_000);
    }

    // ── Case B: Tourist nightly ──────────────────────
    #[test]
    fn b1_one_night() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 11, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 350_000);
    }

    #[test]
    fn b2_three_nights() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 13, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 3 * 350_000);
    }

    // ── Case E: Extra bed ────────────────────────────
    #[test]
    fn e1_extra_bed_one_night() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 11, 12, 0),
            occupants: 4, // capacity=2, extra=2
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 1 night(350k) + 2 extra × 100k × 1 night = 550k
        assert_eq!(out.room_subtotal, 350_000 + 200_000);
    }

    // ── Case G: Monthly ──────────────────────────────
    #[test]
    fn g1_exact_one_month() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Monthly),
            check_in: dt(2025, 6, 1, 14, 0),
            check_out: dt(2025, 7, 1, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 6_000_000);
    }

    #[test]
    fn g2_month_plus_residual() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Monthly),
            check_in: dt(2025, 6, 1, 14, 0),
            check_out: dt(2025, 7, 6, 12, 0), // 35 days = 1 month + 5 days
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 1 month (6M) + 5 days × 250k = 7.25M
        assert_eq!(out.room_subtotal, 6_000_000 + 5 * 250_000);
    }

    // ── Overnight ────────────────────────────────────
    #[test]
    fn overnight_basic() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Overnight),
            check_in: dt(2025, 6, 10, 22, 0),
            check_out: dt(2025, 6, 11, 8, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 250_000);
    }

    // ── Property: idempotent ─────────────────────────
    #[test]
    fn pricing_is_idempotent() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 12, 12, 0),
            occupants: 3,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out1 = calculate(&input);
        let out2 = calculate(&input);
        assert_eq!(out1.room_subtotal, out2.room_subtotal);
    }

    // ── Property: line_items sum = total ─────────────
    #[test]
    fn line_items_sum_equals_total() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 12, 12, 0),
            occupants: 4,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        let sum: u64 = out.line_items.iter().map(|i| i.amount).sum();
        assert_eq!(sum, out.room_subtotal);
    }

    // ── Auto-detect mode ─────────────────────────────
    #[test]
    fn auto_detect_hourly() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Auto),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0), // 2h < max_hours=6
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let mode = decide_mode(&input);
        assert_eq!(mode, Mode::Hourly);
    }

    #[test]
    fn auto_detect_overnight() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Auto),
            check_in: dt(2025, 6, 10, 22, 0),  // >= start_hour=21
            check_out: dt(2025, 6, 11, 8, 0),   // <24h
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let mode = decide_mode(&input);
        assert_eq!(mode, Mode::Overnight);
    }

    #[test]
    fn auto_detect_monthly() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Auto),
            check_in: dt(2025, 6, 1, 14, 0),
            check_out: dt(2025, 7, 5, 12, 0), // 34 days >= 28
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let mode = decide_mode(&input);
        assert_eq!(mode, Mode::Monthly);
    }

    // ── Case C: Dynamic Price ────────────────────────
    #[test]
    fn c1_dynamic_weekend_replace() {
        use crate::dynamic::*;
        let rp = make_rate_plan();
        // Saturday mask: bit 5 = 0b0010_0000 = 32
        let rules = vec![DynamicRule {
            id: "wknd".to_string(),
            applies_to: AppliesTo::Night,
            strategy: Strategy::Replace(500_000), // Weekend price
            weekday_mask: 0b0110_0000,            // Sat+Sun only
            specific_dates: vec![],
            hour_start: None,
            hour_end: None,
            active_from: None,
            active_to: None,
        }];
        // 2025-06-14 is a Saturday
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 14, 14, 0),
            check_out: dt(2025, 6, 15, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &rules,
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 500_000); // Replaced to 500k
    }

    #[test]
    fn c2_dynamic_specific_date_add() {
        use crate::dynamic::*;
        use chrono::NaiveDate;
        let rp = make_rate_plan();
        // Tet holiday: add 100k on top of night rate
        let rules = vec![DynamicRule {
            id: "tet".to_string(),
            applies_to: AppliesTo::Night,
            strategy: Strategy::Add(100_000),
            weekday_mask: 127, // all days
            specific_dates: vec![NaiveDate::from_ymd_opt(2025, 1, 29).unwrap()],
            hour_start: None,
            hour_end: None,
            active_from: None,
            active_to: None,
        }];
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 1, 29, 14, 0),
            check_out: dt(2025, 1, 30, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &rules,
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 450_000); // 350k + 100k
    }

    // ── Case D: Hourly + Dynamic ─────────────────────
    #[test]
    fn d1_hourly_no_dynamic_match() {
        use crate::dynamic::*;
        let rp = make_rate_plan();
        // Rule only applies to Night mode, not Hourly
        let rules = vec![DynamicRule {
            id: "night-only".to_string(),
            applies_to: AppliesTo::Night,
            strategy: Strategy::Replace(999_000),
            weekday_mask: 127,
            specific_dates: vec![],
            hour_start: None,
            hour_end: None,
            active_from: None,
            active_to: None,
        }];
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &rules,
        };
        let out = calculate(&input);
        // Dynamic rule should NOT affect hourly - price stays at 100k
        assert_eq!(out.room_subtotal, 100_000);
    }

    #[test]
    fn d2_dynamic_outside_active_window() {
        use crate::dynamic::*;
        let rp = make_rate_plan();
        // Rule is only active in July, but we check in June
        let rules = vec![DynamicRule {
            id: "july-promo".to_string(),
            applies_to: AppliesTo::Night,
            strategy: Strategy::Replace(200_000),
            weekday_mask: 127,
            specific_dates: vec![],
            hour_start: None,
            hour_end: None,
            active_from: Some(dt(2025, 7, 1, 0, 0)),
            active_to: Some(dt(2025, 7, 31, 23, 59)),
        }];
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 15, 14, 0),
            check_out: dt(2025, 6, 16, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &rules,
        };
        let out = calculate(&input);
        // Rule inactive → original price
        assert_eq!(out.room_subtotal, 350_000);
    }

    // ── Case F: Override linh động giá ───────────────
    #[test]
    fn f1_override_night_rate() {
        // Simulate "linh động giá": clone rate_plan, override night_rate
        let mut rp = make_rate_plan();
        rp.night_rate = Some(300_000); // Receptionist discounts to 300k

        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 11, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        assert_eq!(out.room_subtotal, 300_000);
    }

    #[test]
    fn f2_override_full_rate_plan() {
        // Full override: change night_rate + extra_bed + capacity
        let mut rp = make_rate_plan();
        rp.night_rate = Some(400_000);
        rp.extra_bed_per_person = 80_000;
        rp.capacity = 3;

        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 12, 12, 0), // 2 nights
            occupants: 5,                       // 5 - 3 = 2 extra
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 2 nights × 400k + 2 extra × 80k × 2 nights = 800k + 320k = 1.12M
        assert_eq!(out.room_subtotal, 800_000 + 320_000);
    }

    // ── Case G3: Monthly with FullMonth residual ─────
    #[test]
    fn g3_monthly_full_month_residual() {
        let mut rp = make_rate_plan();
        rp.monthly = Some(MonthlyRate {
            price: 5_000_000,
            residual_mode: ResidualMode::FullMonth,
        });
        let input = CalcInput {
            requested_mode: Some(Mode::Monthly),
            check_in: dt(2025, 6, 1, 14, 0),
            check_out: dt(2025, 7, 10, 12, 0), // 39 days = 1 month + 9 days
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // FullMonth residual: 1 month(5M) + 1 full month for residual(5M) = 10M
        assert_eq!(out.room_subtotal, 10_000_000);
    }

    // ── Surcharge tests ──────────────────────────────
    #[test]
    fn early_checkin_surcharge() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 12, 0),  // 2h early (14:00 - 12:00)
            check_out: dt(2025, 6, 11, 12, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 1 night(350k) + early 2h → up_to_hours=3 bracket → 50% of 350k = 175k
        assert_eq!(out.room_subtotal, 350_000 + 175_000);
    }

    #[test]
    fn late_checkout_surcharge() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Night),
            check_in: dt(2025, 6, 10, 14, 0),
            check_out: dt(2025, 6, 11, 14, 0),  // 2h late (12:00 + 2h)
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 1 night(350k) + late 2h → up_to_hours=2 bracket → 30% of 350k = 105k
        assert_eq!(out.room_subtotal, 350_000 + 105_000);
    }

    // ── No extra bed for hourly ──────────────────────
    #[test]
    fn no_extra_bed_for_hourly() {
        let rp = make_rate_plan();
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0),
            occupants: 5, // extra people but hourly
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // Hourly mode: no extra bed charge
        assert_eq!(out.room_subtotal, 100_000);
    }

    // ══════════════════════════════════════════════════
    // Rounding tests
    // ══════════════════════════════════════════════════

    #[test]
    fn rounding_30min_1h20m_becomes_2h() {
        let mut rp = make_rate_plan();
        rp.rounding_minutes = 30;
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 9, 20), // 1h20m → round to 90min → 1.5h → 1 hour (int div)
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 80 min → rounded to 90 min (30-min blocks) → 90/60 = 1 hour
        // Step: hours<=1 → 80,000
        assert_eq!(out.room_subtotal, 80_000);
    }

    #[test]
    fn rounding_30min_1h40m_becomes_2h() {
        let mut rp = make_rate_plan();
        rp.rounding_minutes = 30;
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 9, 40), // 1h40m = 100min → round to 120min → 2h
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 100 min → rounded to 120 min (4×30) → 120/60 = 2h
        // Step: hours<=2 → 100,000
        assert_eq!(out.room_subtotal, 100_000);
    }

    #[test]
    fn rounding_15min_1h05m_stays_1h() {
        let mut rp = make_rate_plan();
        rp.rounding_minutes = 15;
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 9, 5), // 1h05m = 65min
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 65 min → rounded to 75 min (5×15) → 75/60 = 1h (integer division)
        // Step: hours<=1 → 80,000
        assert_eq!(out.room_subtotal, 80_000);
    }

    #[test]
    fn rounding_60min_default_unchanged() {
        // Default 60-min rounding should behave same as original
        let rp = make_rate_plan(); // rounding_minutes = 60
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 9, 30), // 1h30m → round to 2h
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 90 min → rounded to 120 min (2×60) → 2h
        // Step: hours<=2 → 100,000
        assert_eq!(out.room_subtotal, 100_000);
    }

    // ══════════════════════════════════════════════════
    // IntradayMode tests
    // ══════════════════════════════════════════════════

    #[test]
    fn intraday_always_one_night_forces_night_rate() {
        let mut rp = make_rate_plan();
        rp.intraday_mode = IntradayMode::AlwaysOneNight;
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0), // Only 2 hours
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // AlwaysOneNight: forces night rate even for 2h stay
        // calendar_nights(8AM..10AM same day) = max(1) = 1 night × 350,000
        assert_eq!(out.room_subtotal, 350_000);
    }

    #[test]
    fn intraday_always_one_night_with_extra_bed() {
        let mut rp = make_rate_plan();
        rp.intraday_mode = IntradayMode::AlwaysOneNight;
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0),
            occupants: 4, // 2 extra people (capacity=2)
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // 1 night × 350k + 2 extra × 100k = 550k
        assert_eq!(out.room_subtotal, 350_000 + 200_000);
    }

    #[test]
    fn intraday_default_uses_hourly_normally() {
        let mut rp = make_rate_plan();
        rp.intraday_mode = IntradayMode::Default;
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // Default mode: normal hourly → 2h → 100,000
        assert_eq!(out.room_subtotal, 100_000);
    }

    #[test]
    fn intraday_split_surcharge_same_as_default_for_now() {
        let mut rp = make_rate_plan();
        rp.intraday_mode = IntradayMode::SplitSurcharge;
        let input = CalcInput {
            requested_mode: Some(Mode::Hourly),
            check_in: dt(2025, 6, 10, 8, 0),
            check_out: dt(2025, 6, 10, 10, 0),
            occupants: 2,
            rate_plan: &rp,
            dynamic_rules: &[],
        };
        let out = calculate(&input);
        // SplitSurcharge currently behaves same as Default
        assert_eq!(out.room_subtotal, 100_000);
    }
}
