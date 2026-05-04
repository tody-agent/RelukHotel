use super::{emit_db_update, get_f64, get_money_vnd, require_admin, AppState};
use crate::money::{validate_non_negative_money_vnd, MoneyVnd};
use sqlx::{Pool, Row, Sqlite};
use tauri::State;

// ═══════════════════════════════════════════════
// Phase 2: Pricing Engine Commands
// ═══════════════════════════════════════════════

pub async fn do_get_pricing_rules(pool: &Pool<Sqlite>) -> Result<Vec<serde_json::Value>, String> {
    let rows = sqlx::query(
        "SELECT id, room_type, hourly_rate, overnight_rate, daily_rate,
                overnight_start, overnight_end, daily_checkin, daily_checkout,
                early_checkin_surcharge_pct, late_checkout_surcharge_pct,
                weekend_uplift_pct
         FROM pricing_rules ORDER BY room_type",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .iter()
        .map(|r| {
            serde_json::json!({
                "id": r.get::<String, _>("id"),
                "room_type": r.get::<String, _>("room_type"),
                "hourly_rate": get_money_vnd(r, "hourly_rate"),
                "overnight_rate": get_money_vnd(r, "overnight_rate"),
                "daily_rate": get_money_vnd(r, "daily_rate"),
                "overnight_start": r.get::<String, _>("overnight_start"),
                "overnight_end": r.get::<String, _>("overnight_end"),
                "daily_checkin": r.get::<String, _>("daily_checkin"),
                "daily_checkout": r.get::<String, _>("daily_checkout"),
                "early_checkin_surcharge_pct": get_f64(r, "early_checkin_surcharge_pct"),
                "late_checkout_surcharge_pct": get_f64(r, "late_checkout_surcharge_pct"),
                "weekend_uplift_pct": get_f64(r, "weekend_uplift_pct"),
            })
        })
        .collect())
}

#[tauri::command]
pub async fn get_pricing_rules(
    state: State<'_, AppState>,
) -> Result<Vec<serde_json::Value>, String> {
    do_get_pricing_rules(&state.db).await
}

fn validate_pricing_rule_money(
    hourly_rate: MoneyVnd,
    overnight_rate: MoneyVnd,
    daily_rate: MoneyVnd,
) -> crate::app_error::CommandResult<(MoneyVnd, MoneyVnd, MoneyVnd)> {
    Ok((
        validate_non_negative_money_vnd(hourly_rate, "hourly_rate")?,
        validate_non_negative_money_vnd(overnight_rate, "overnight_rate")?,
        validate_non_negative_money_vnd(daily_rate, "daily_rate")?,
    ))
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn save_pricing_rule(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    room_type: String,
    hourly_rate: MoneyVnd,
    overnight_rate: MoneyVnd,
    daily_rate: MoneyVnd,
    overnight_start: Option<String>,
    overnight_end: Option<String>,
    daily_checkin: Option<String>,
    daily_checkout: Option<String>,
    early_pct: Option<f64>,
    late_pct: Option<f64>,
    weekend_pct: Option<f64>,
) -> Result<(), String> {
    require_admin(&state)?;
    let (hourly_rate, overnight_rate, daily_rate) =
        validate_pricing_rule_money(hourly_rate, overnight_rate, daily_rate)?;

    let now = chrono::Local::now().to_rfc3339();
    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO pricing_rules
         (id, room_type, hourly_rate, overnight_rate, daily_rate,
          overnight_start, overnight_end, daily_checkin, daily_checkout,
          early_checkin_surcharge_pct, late_checkout_surcharge_pct,
          weekend_uplift_pct, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(room_type) DO UPDATE SET
            hourly_rate = excluded.hourly_rate,
            overnight_rate = excluded.overnight_rate,
            daily_rate = excluded.daily_rate,
            overnight_start = excluded.overnight_start,
            overnight_end = excluded.overnight_end,
            daily_checkin = excluded.daily_checkin,
            daily_checkout = excluded.daily_checkout,
            early_checkin_surcharge_pct = excluded.early_checkin_surcharge_pct,
            late_checkout_surcharge_pct = excluded.late_checkout_surcharge_pct,
            weekend_uplift_pct = excluded.weekend_uplift_pct,
            updated_at = excluded.updated_at",
    )
    .bind(&id)
    .bind(&room_type)
    .bind(hourly_rate)
    .bind(overnight_rate)
    .bind(daily_rate)
    .bind(overnight_start.as_deref().unwrap_or("22:00"))
    .bind(overnight_end.as_deref().unwrap_or("11:00"))
    .bind(daily_checkin.as_deref().unwrap_or("14:00"))
    .bind(daily_checkout.as_deref().unwrap_or("12:00"))
    .bind(early_pct.unwrap_or(30.0))
    .bind(late_pct.unwrap_or(30.0))
    .bind(weekend_pct.unwrap_or(0.0))
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    emit_db_update(&app, "pricing");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::validate_pricing_rule_money;
    use crate::app_error::codes;

    #[test]
    fn save_pricing_rule_rejects_negative_money_rates() {
        for (hourly_rate, overnight_rate, daily_rate, field) in [
            (-1, 300_000, 400_000, "hourly_rate"),
            (80_000, -1, 400_000, "overnight_rate"),
            (80_000, 300_000, -1, "daily_rate"),
        ] {
            let error = validate_pricing_rule_money(hourly_rate, overnight_rate, daily_rate)
                .expect_err("negative pricing money must fail");

            assert_eq!(error.code, codes::VALIDATION_INVALID_INPUT);
            assert!(error.message.contains(field));
        }
    }
}

pub async fn do_calculate_price_preview(
    pool: &Pool<Sqlite>,
    room_type: &str,
    check_in: &str,
    check_out: &str,
    pricing_type: &str,
) -> Result<crate::pricing::PricingResult, String> {
    let room_type_lower = room_type.to_lowercase();
    let row = sqlx::query(
        "SELECT room_type, hourly_rate, overnight_rate, daily_rate,
                overnight_start, overnight_end, daily_checkin, daily_checkout,
                early_checkin_surcharge_pct, late_checkout_surcharge_pct,
                weekend_uplift_pct
         FROM pricing_rules WHERE LOWER(room_type) = ?",
    )
    .bind(&room_type_lower)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    let rule = match row {
        Some(r) => crate::pricing::PricingRule {
            room_type: r.get("room_type"),
            hourly_rate: get_money_vnd(&r, "hourly_rate"),
            overnight_rate: get_money_vnd(&r, "overnight_rate"),
            daily_rate: get_money_vnd(&r, "daily_rate"),
            overnight_start: r.get("overnight_start"),
            overnight_end: r.get("overnight_end"),
            daily_checkin: r.get("daily_checkin"),
            daily_checkout: r.get("daily_checkout"),
            early_checkin_surcharge_pct: get_f64(&r, "early_checkin_surcharge_pct"),
            late_checkout_surcharge_pct: get_f64(&r, "late_checkout_surcharge_pct"),
            weekend_uplift_pct: get_f64(&r, "weekend_uplift_pct"),
        },
        None => {
            let fallback_row =
                sqlx::query("SELECT base_price FROM rooms WHERE LOWER(type) = ? LIMIT 1")
                    .bind(&room_type_lower)
                    .fetch_optional(pool)
                    .await
                    .map_err(|e| e.to_string())?;
            let fallback_price = fallback_row
                .as_ref()
                .map(|r| get_money_vnd(r, "base_price"))
                .unwrap_or(350_000);

            crate::pricing::PricingRule {
                room_type: room_type.to_string(),
                hourly_rate: fallback_price / 5,
                overnight_rate: fallback_price * 75 / 100,
                daily_rate: fallback_price,
                ..Default::default()
            }
        }
    };

    let special_uplift = do_get_special_uplift(pool, check_in).await;

    crate::pricing::calculate_price(&rule, check_in, check_out, pricing_type, special_uplift)
}

#[tauri::command]
pub async fn calculate_price_preview(
    state: State<'_, AppState>,
    room_type: String,
    check_in: String,
    check_out: String,
    pricing_type: String,
) -> Result<crate::pricing::PricingResult, String> {
    do_calculate_price_preview(&state.db, &room_type, &check_in, &check_out, &pricing_type).await
}

pub async fn do_get_special_uplift(pool: &Pool<Sqlite>, date_str: &str) -> f64 {
    let date = if date_str.len() >= 10 {
        &date_str[..10]
    } else {
        date_str
    };
    let row: Option<(f64,)> =
        sqlx::query_as("SELECT CAST(uplift_pct AS REAL) FROM special_dates WHERE date = ?")
            .bind(date)
            .fetch_optional(pool)
            .await
            .ok()
            .flatten();
    row.map(|r| r.0).unwrap_or(0.0)
}

#[tauri::command]
pub async fn get_special_dates(
    state: State<'_, AppState>,
) -> Result<Vec<serde_json::Value>, String> {
    let rows = sqlx::query("SELECT id, date, label, uplift_pct FROM special_dates ORDER BY date")
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(rows
        .iter()
        .map(|r| {
            serde_json::json!({
                "id": r.get::<String, _>("id"),
                "date": r.get::<String, _>("date"),
                "label": r.get::<String, _>("label"),
                "uplift_pct": get_f64(r, "uplift_pct"),
            })
        })
        .collect())
}

#[tauri::command]
pub async fn save_special_date(
    state: State<'_, AppState>,
    date: String,
    label: String,
    uplift_pct: f64,
) -> Result<(), String> {
    require_admin(&state)?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Local::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO special_dates (id, date, label, uplift_pct, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET
            label = excluded.label,
            uplift_pct = excluded.uplift_pct",
    )
    .bind(&id)
    .bind(&date)
    .bind(&label)
    .bind(uplift_pct)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

// ═══════════════════════════════════════════════
// Shared: Deserialize rate_plan row → RatePlan struct
// ═══════════════════════════════════════════════

fn deserialize_surcharge_steps(json: Option<String>) -> Vec<pricing::rate_plan::SurchargeStep> {
    // Frontend StepEditor sends: [{ from: 0, to: 2, amount: 30 }, ...]
    // where amount = percentage. Convert to Rust SurchargeStep { up_to_hours, value }.
    #[derive(serde::Deserialize)]
    struct FrontendStep {
        #[allow(dead_code)]
        from: Option<u32>,
        to: Option<u32>,
        amount: u64,
    }

    json.and_then(|s| serde_json::from_str::<Vec<FrontendStep>>(&s).ok())
        .map(|steps| {
            steps
                .into_iter()
                .map(|s| pricing::rate_plan::SurchargeStep {
                    up_to_hours: s.to.unwrap_or(u32::MAX),
                    value: pricing::rate_plan::SurchargeValue::PercentOfNight(
                        s.amount.min(255) as u8,
                    ),
                })
                .collect()
        })
        .unwrap_or_default()
}

fn deserialize_rate_plan_row(row: &sqlx::sqlite::SqliteRow) -> pricing::rate_plan::RatePlan {
    let night_rate = row.get::<Option<i64>, _>("night_rate").map(|v| v as u64);

    let overnight = row
        .get::<Option<i64>, _>("overnight_rate")
        .map(|price| pricing::rate_plan::OvernightRate {
            price: price as u64,
            start_hour: row.get::<i32, _>("overnight_start_hour") as u8,
            start_minute: row.get::<i32, _>("overnight_start_minute") as u8,
            end_hour: row.get::<i32, _>("overnight_end_hour") as u8,
            end_minute: row.get::<i32, _>("overnight_end_minute") as u8,
            checkout_hour: row.get::<i32, _>("overnight_checkout_hour") as u8,
        });

    let monthly = row.get::<Option<i64>, _>("monthly_rate").map(|price| {
        let residual_mode = row
            .get::<Option<String>, _>("monthly_residual_mode")
            .and_then(|m| match m.as_str() {
                "per_day" => Some(pricing::rate_plan::ResidualMode::PerDay {
                    day_rate: night_rate.unwrap_or(0),
                }),
                "full_month" => Some(pricing::rate_plan::ResidualMode::FullMonth),
                _ => None,
            })
            .unwrap_or(pricing::rate_plan::ResidualMode::PerDay {
                day_rate: night_rate.unwrap_or(0),
            });
        pricing::rate_plan::MonthlyRate {
            price: price as u64,
            residual_mode,
        }
    });

    let hourly = row
        .get::<Option<String>, _>("hourly_steps_json")
        .and_then(|s| serde_json::from_str::<Vec<(u32, u64)>>(&s).ok())
        .map(|steps| pricing::rate_plan::HourlyRate {
            steps,
            max_hours: row
                .get::<Option<i32>, _>("hourly_max_hours")
                .unwrap_or(8) as u32,
        });

    pricing::rate_plan::RatePlan {
        id: row.get("id"),
        capacity: row.get::<i32, _>("capacity") as u32,
        night_rate,
        overnight,
        monthly,
        hourly,
        early_checkin_day: deserialize_surcharge_steps(
            row.get::<Option<String>, _>("early_checkin_day_json"),
        ),
        early_checkin_night: deserialize_surcharge_steps(
            row.get::<Option<String>, _>("early_checkin_night_json"),
        ),
        late_checkout_day: deserialize_surcharge_steps(
            row.get::<Option<String>, _>("late_checkout_day_json"),
        ),
        late_checkout_night: deserialize_surcharge_steps(
            row.get::<Option<String>, _>("late_checkout_night_json"),
        ),
        extra_bed_per_person: row.get::<i64, _>("extra_bed_per_person") as u64,
        rounding_minutes: row.get::<i32, _>("rounding_minutes") as u32,
        intraday_mode: match row.get::<String, _>("intraday_mode").as_str() {
            "split_surcharge" => pricing::rate_plan::IntradayMode::SplitSurcharge,
            "always_one_night" => pricing::rate_plan::IntradayMode::AlwaysOneNight,
            _ => pricing::rate_plan::IntradayMode::Default,
        },
        standard_checkin_hour: row.get::<i32, _>("standard_checkin_hour") as u8,
        standard_checkout_hour: row.get::<i32, _>("standard_checkout_hour") as u8,
        auto_overnight_checkin_hour: row.get::<i32, _>("auto_overnight_checkin_hour") as u8,
        auto_overnight_checkin_minute: row.get::<i32, _>("auto_overnight_checkin_minute") as u8,
        auto_overnight_checkout_hour: row.get::<i32, _>("auto_overnight_checkout_hour") as u8,
        auto_overnight_checkout_minute: row.get::<i32, _>("auto_overnight_checkout_minute") as u8,
        auto_compare_price: row.get::<i32, _>("auto_compare_price") != 0,
        auto_prefer_daily_over_overnight: row.get::<i32, _>("auto_prefer_daily_over_overnight") != 0,
        surcharge_threshold_minutes: row.get::<i32, _>("surcharge_threshold_minutes") as u32,
    }
}

// ═══════════════════════════════════════════════
// Phase 3a: Rate Plan CRUD
// ═══════════════════════════════════════════════

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn rate_plan_upsert(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    room_type_id: String,
    name: String,
    capacity: i32,
    night_rate: i64,
    overnight_rate: Option<i64>,
    overnight_start_hour: Option<i32>,
    monthly_rate: Option<i64>,
    monthly_residual_mode: Option<String>,
    extra_bed_per_person: i64,
    hourly_steps_json: Option<String>,
    hourly_max_hours: Option<i32>,
    early_checkin_day_json: Option<String>,
    early_checkin_night_json: Option<String>,
    late_checkout_day_json: Option<String>,
    late_checkout_night_json: Option<String>,
    rounding_minutes: Option<i32>,
    intraday_mode: Option<String>,
    notes: Option<String>,
    overnight_start_minute: Option<i32>,
    overnight_end_hour: Option<i32>,
    overnight_end_minute: Option<i32>,
    overnight_checkout_hour: Option<i32>,
    standard_checkin_hour: Option<i32>,
    standard_checkout_hour: Option<i32>,
    auto_overnight_checkin_hour: Option<i32>,
    auto_overnight_checkin_minute: Option<i32>,
    auto_overnight_checkout_hour: Option<i32>,
    auto_overnight_checkout_minute: Option<i32>,
    auto_compare_price: Option<bool>,
    auto_prefer_daily_over_overnight: Option<bool>,
    surcharge_threshold_minutes: Option<i32>,
) -> Result<serde_json::Value, String> {
    require_admin(&state)?;

    let now = chrono::Local::now().to_rfc3339();
    let property_id = "default";

    // Check if a default rate plan already exists for this room type
    let existing: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM rate_plan WHERE room_type_id = ? AND property_id = ? AND is_default = 1",
    )
    .bind(&room_type_id)
    .bind(property_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let plan_id = match existing {
        Some((id,)) => id,
        None => uuid::Uuid::new_v4().to_string(),
    };

    sqlx::query(
        "INSERT INTO rate_plan
         (id, property_id, room_type_id, name, is_default, currency, capacity,
          night_rate, overnight_rate, overnight_start_hour, overnight_start_minute, overnight_end_hour, overnight_end_minute, overnight_checkout_hour,
          monthly_rate, monthly_residual_mode,
          hourly_steps_json, hourly_max_hours,
          early_checkin_day_json, early_checkin_night_json,
          late_checkout_day_json, late_checkout_night_json,
          extra_bed_per_person, rounding_minutes, intraday_mode, notes,
          standard_checkin_hour, standard_checkout_hour,
          auto_overnight_checkin_hour, auto_overnight_checkin_minute,
          auto_overnight_checkout_hour, auto_overnight_checkout_minute,
          auto_compare_price, auto_prefer_daily_over_overnight, surcharge_threshold_minutes,
          created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, 'VND', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            capacity = excluded.capacity,
            night_rate = excluded.night_rate,
            overnight_rate = excluded.overnight_rate,
            overnight_start_hour = excluded.overnight_start_hour,
            monthly_rate = excluded.monthly_rate,
            monthly_residual_mode = excluded.monthly_residual_mode,
            hourly_steps_json = excluded.hourly_steps_json,
            hourly_max_hours = excluded.hourly_max_hours,
            early_checkin_day_json = excluded.early_checkin_day_json,
            early_checkin_night_json = excluded.early_checkin_night_json,
            late_checkout_day_json = excluded.late_checkout_day_json,
            late_checkout_night_json = excluded.late_checkout_night_json,
            extra_bed_per_person = excluded.extra_bed_per_person,
            rounding_minutes = excluded.rounding_minutes,
            intraday_mode = excluded.intraday_mode,
            notes = excluded.notes,
            overnight_start_minute = excluded.overnight_start_minute,
            overnight_end_hour = excluded.overnight_end_hour,
            overnight_end_minute = excluded.overnight_end_minute,
            overnight_checkout_hour = excluded.overnight_checkout_hour,
            standard_checkin_hour = excluded.standard_checkin_hour,
            standard_checkout_hour = excluded.standard_checkout_hour,
            auto_overnight_checkin_hour = excluded.auto_overnight_checkin_hour,
            auto_overnight_checkin_minute = excluded.auto_overnight_checkin_minute,
            auto_overnight_checkout_hour = excluded.auto_overnight_checkout_hour,
            auto_overnight_checkout_minute = excluded.auto_overnight_checkout_minute,
            auto_compare_price = excluded.auto_compare_price,
            auto_prefer_daily_over_overnight = excluded.auto_prefer_daily_over_overnight,
            surcharge_threshold_minutes = excluded.surcharge_threshold_minutes,
            updated_at = excluded.updated_at",
    )
    .bind(plan_id.clone())
    .bind(property_id)
    .bind(&room_type_id)
    .bind(&name)
    .bind(capacity)
    .bind(night_rate)
    .bind(overnight_rate)
    .bind(overnight_start_hour.unwrap_or(21))
    .bind(overnight_start_minute.unwrap_or(0))
    .bind(overnight_end_hour.unwrap_or(6))
    .bind(overnight_end_minute.unwrap_or(0))
    .bind(overnight_checkout_hour.unwrap_or(12))
    .bind(monthly_rate)
    .bind(monthly_residual_mode.as_deref())
    .bind(hourly_steps_json.as_deref())
    .bind(hourly_max_hours.unwrap_or(8))
    .bind(early_checkin_day_json.as_deref())
    .bind(early_checkin_night_json.as_deref())
    .bind(late_checkout_day_json.as_deref())
    .bind(late_checkout_night_json.as_deref())
    .bind(extra_bed_per_person)
    .bind(rounding_minutes.unwrap_or(60))
    .bind(intraday_mode.as_deref().unwrap_or("default"))
    .bind(notes.as_deref())
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    emit_db_update(&app, "pricing");

    Ok(serde_json::json!({
        "id": plan_id,
        "room_type_id": room_type_id,
        "name": name,
    }))
}

#[tauri::command]
pub async fn rate_plan_delete(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    rate_plan_id: String,
) -> Result<(), String> {
    require_admin(&state)?;

    sqlx::query("DELETE FROM rate_plan WHERE id = ?")
        .bind(&rate_plan_id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    emit_db_update(&app, "pricing");
    Ok(())
}

// ═══════════════════════════════════════════════
// Phase 3b: Copy Rate Plan
// ═══════════════════════════════════════════════

#[tauri::command]
pub async fn rate_plan_copy(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    source_room_type_id: String,
    target_room_type_id: String,
) -> Result<serde_json::Value, String> {
    require_admin(&state)?;

    let source = sqlx::query(
        "SELECT * FROM rate_plan WHERE room_type_id = ? AND is_default = 1 LIMIT 1",
    )
    .bind(&source_room_type_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let source = match source {
        Some(row) => row,
        None => return Err("Không tìm thấy Rate Plan nguồn".to_string()),
    };

    let new_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Local::now().to_rfc3339();

    sqlx::query(
        "INSERT OR REPLACE INTO rate_plan
         (id, property_id, room_type_id, name, is_default, currency, capacity,
          night_rate, overnight_rate, overnight_start_hour, overnight_start_minute, overnight_end_hour, overnight_end_minute, overnight_checkout_hour,
          monthly_rate, monthly_residual_mode,
          hourly_steps_json, hourly_max_hours,
          early_checkin_day_json, early_checkin_night_json,
          late_checkout_day_json, late_checkout_night_json,
          extra_bed_per_person, rounding_minutes, intraday_mode, notes,
          standard_checkin_hour, standard_checkout_hour,
          auto_overnight_checkin_hour, auto_overnight_checkin_minute,
          auto_overnight_checkout_hour, auto_overnight_checkout_minute,
          auto_compare_price, auto_prefer_daily_over_overnight, surcharge_threshold_minutes,
          created_at, updated_at)
         SELECT ?, property_id, ?, name || ' (Copy)', 1, currency, capacity,
                night_rate, overnight_rate, overnight_start_hour, overnight_start_minute, overnight_end_hour, overnight_end_minute, overnight_checkout_hour,
                monthly_rate, monthly_residual_mode,
                hourly_steps_json, hourly_max_hours,
                early_checkin_day_json, early_checkin_night_json,
                late_checkout_day_json, late_checkout_night_json,
                extra_bed_per_person, rounding_minutes, intraday_mode, notes,
                standard_checkin_hour, standard_checkout_hour,
                auto_overnight_checkin_hour, auto_overnight_checkin_minute,
                auto_overnight_checkout_hour, auto_overnight_checkout_minute,
                auto_compare_price, auto_prefer_daily_over_overnight, surcharge_threshold_minutes,
                ?, ?
         FROM rate_plan WHERE id = ?",
    )
    .bind(&new_id)
    .bind(&target_room_type_id)
    .bind(&now)
    .bind(&now)
    .bind(source.get::<String, _>("id"))
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    emit_db_update(&app, "pricing");

    Ok(serde_json::json!({
        "id": new_id,
        "source_room_type_id": source_room_type_id,
        "target_room_type_id": target_room_type_id,
    }))
}

// ═══════════════════════════════════════════════
// Phase 3c: Dynamic Price Rule CRUD
// ═══════════════════════════════════════════════

#[tauri::command]
pub async fn dynamic_rule_list(
    state: State<'_, AppState>,
    property_id: String,
) -> Result<Vec<serde_json::Value>, String> {
    let rows = sqlx::query(
        "SELECT id, property_id, name, applies_to, strategy, weekday_mask,
                specific_dates_json, hour_start, hour_end, active_from, active_to, enabled
         FROM dynamic_price_rule
         WHERE property_id = ?
         ORDER BY name",
    )
    .bind(&property_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .iter()
        .map(|r| {
            serde_json::json!({
                "id": r.get::<String, _>("id"),
                "property_id": r.get::<String, _>("property_id"),
                "name": r.get::<String, _>("name"),
                "applies_to": r.get::<String, _>("applies_to"),
                "strategy": r.get::<String, _>("strategy"),
                "weekday_mask": r.get::<i32, _>("weekday_mask"),
                "specific_dates_json": r.get::<Option<String>, _>("specific_dates_json"),
                "hour_start": r.get::<Option<i32>, _>("hour_start"),
                "hour_end": r.get::<Option<i32>, _>("hour_end"),
                "active_from": r.get::<Option<String>, _>("active_from"),
                "active_to": r.get::<Option<String>, _>("active_to"),
                "enabled": r.get::<i32, _>("enabled"),
            })
        })
        .collect())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn dynamic_rule_upsert(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    id: Option<String>,
    property_id: String,
    name: String,
    applies_to: String,
    strategy: String,
    weekday_mask: i32,
    specific_dates_json: Option<String>,
    hour_start: Option<i32>,
    hour_end: Option<i32>,
    active_from: Option<String>,
    active_to: Option<String>,
    enabled: bool,
) -> Result<serde_json::Value, String> {
    require_admin(&state)?;

    let now = chrono::Local::now().to_rfc3339();
    let rule_id = id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let enabled_int: i32 = if enabled { 1 } else { 0 };

    sqlx::query(
        "INSERT INTO dynamic_price_rule
         (id, property_id, name, applies_to, strategy, weekday_mask,
          specific_dates_json, hour_start, hour_end, active_from, active_to,
          enabled, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            applies_to = excluded.applies_to,
            strategy = excluded.strategy,
            weekday_mask = excluded.weekday_mask,
            specific_dates_json = excluded.specific_dates_json,
            hour_start = excluded.hour_start,
            hour_end = excluded.hour_end,
            active_from = excluded.active_from,
            active_to = excluded.active_to,
            enabled = excluded.enabled",
    )
    .bind(&rule_id)
    .bind(&property_id)
    .bind(&name)
    .bind(&applies_to)
    .bind(&strategy)
    .bind(weekday_mask)
    .bind(specific_dates_json.as_deref())
    .bind(hour_start)
    .bind(hour_end)
    .bind(active_from.as_deref())
    .bind(active_to.as_deref())
    .bind(enabled_int)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    emit_db_update(&app, "pricing");

    Ok(serde_json::json!({
        "id": rule_id,
        "name": name,
    }))
}

#[tauri::command]
pub async fn dynamic_rule_delete(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    rule_id: String,
) -> Result<(), String> {
    require_admin(&state)?;

    // Delete values first (FK), then the rule itself
    sqlx::query("DELETE FROM dynamic_price_rule_value WHERE rule_id = ?")
        .bind(&rule_id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM dynamic_price_rule WHERE id = ?")
        .bind(&rule_id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    emit_db_update(&app, "pricing");
    Ok(())
}

// ═══════════════════════════════════════════════
// Phase 3: Pricing Engine V2 (Rate Plan)
// ═══════════════════════════════════════════════

#[tauri::command]
pub async fn get_rate_plans(state: State<'_, AppState>) -> Result<Vec<serde_json::Value>, String> {
    let rows = sqlx::query(
        "SELECT id, property_id, room_type_id, name, is_default, currency, capacity,
                night_rate, overnight_rate, overnight_start_hour, monthly_rate,
                monthly_residual_mode, hourly_steps_json, hourly_max_hours,
                early_checkin_day_json, early_checkin_night_json,
                late_checkout_day_json, late_checkout_night_json,
                extra_bed_per_person, rounding_minutes, intraday_mode, notes
         FROM rate_plan ORDER BY name"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .iter()
        .map(|r| {
            serde_json::json!({
                "id": r.get::<String, _>("id"),
                "property_id": r.get::<String, _>("property_id"),
                "room_type_id": r.get::<String, _>("room_type_id"),
                "name": r.get::<String, _>("name"),
                "is_default": r.get::<i32, _>("is_default") == 1,
                "currency": r.get::<String, _>("currency"),
                "capacity": r.get::<i32, _>("capacity"),
                "night_rate": r.get::<Option<i64>, _>("night_rate"),
                "overnight_rate": r.get::<Option<i64>, _>("overnight_rate"),
                "overnight_start_hour": r.get::<i32, _>("overnight_start_hour"),
                "monthly_rate": r.get::<Option<i64>, _>("monthly_rate"),
                "hourly_steps_json": r.get::<Option<String>, _>("hourly_steps_json"),
                "hourly_max_hours": r.get::<Option<i32>, _>("hourly_max_hours"),
                "early_checkin_day_json": r.get::<Option<String>, _>("early_checkin_day_json"),
                "early_checkin_night_json": r.get::<Option<String>, _>("early_checkin_night_json"),
                "late_checkout_day_json": r.get::<Option<String>, _>("late_checkout_day_json"),
                "late_checkout_night_json": r.get::<Option<String>, _>("late_checkout_night_json"),
                "extra_bed_per_person": r.get::<i64, _>("extra_bed_per_person"),
                "rounding_minutes": r.get::<i32, _>("rounding_minutes"),
                "intraday_mode": r.get::<String, _>("intraday_mode"),
                "notes": r.get::<Option<String>, _>("notes"),
            })
        })
        .collect())
}

#[tauri::command]
pub async fn calculate_price_v2(
    state: State<'_, AppState>,
    room_type_id: String,
    check_in: String,
    check_out: String,
    occupants: u32,
    mode: Option<String>,
) -> Result<serde_json::Value, String> {
    let rate_plan_row = sqlx::query("SELECT * FROM rate_plan WHERE room_type_id = ? AND is_default = 1 LIMIT 1")
        .bind(&room_type_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let rate_plan_row = match rate_plan_row {
        Some(row) => row,
        None => return Err("No rate plan found for this room type".to_string()),
    };

    let rate_plan = deserialize_rate_plan_row(&rate_plan_row);

    let check_in_dt = chrono::DateTime::parse_from_rfc3339(&check_in)
        .map(|dt| dt.with_timezone(&chrono::Utc))
        .map_err(|e| e.to_string())?;
    
    let check_out_dt = chrono::DateTime::parse_from_rfc3339(&check_out)
        .map(|dt| dt.with_timezone(&chrono::Utc))
        .map_err(|e| e.to_string())?;

    let calc_mode = match mode.as_deref() {
        Some("hourly") => Some(pricing::stay::Mode::Hourly),
        Some("night") => Some(pricing::stay::Mode::Night),
        Some("overnight") => Some(pricing::stay::Mode::Overnight),
        Some("monthly") => Some(pricing::stay::Mode::Monthly),
        _ => Some(pricing::stay::Mode::Auto),
    };

    let calc_input = pricing::stay::CalcInput {
        requested_mode: calc_mode,
        check_in: check_in_dt,
        check_out: check_out_dt,
        occupants,
        rate_plan: &rate_plan,
        dynamic_rules: &[],
    };

    let result = pricing::calc::calculate(&calc_input);

    Ok(serde_json::json!({
        "line_items": result.line_items.iter().map(|item| serde_json::json!({
            "description": item.description,
            "amount": item.amount
        })).collect::<Vec<_>>(),
        "room_subtotal": result.room_subtotal,
        "currency": result.currency
    }))
}

/// Task 2.12 + 3.4: Lock pricing for a booking — snapshot the current CalcOutput
/// into the booking row so it can't change after this point.
#[tauri::command]
pub async fn pricing_lock(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    booking_id: String,
) -> Result<serde_json::Value, String> {
    require_admin(&state)?;

    // 1. Load booking to get room_id, check_in_at, expected_checkout, occupants
    let booking = sqlx::query(
        "SELECT room_id, check_in_at, actual_checkout, expected_checkout, occupants, pricing_type
         FROM bookings WHERE id = ?"
    )
    .bind(&booking_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?
    .ok_or_else(|| format!("Booking {} not found", booking_id))?;

    let room_id: String = booking.get("room_id");
    let check_in_str: String = booking.get("check_in_at");
    let checkout_str: String = booking.get::<Option<String>, _>("actual_checkout")
        .unwrap_or_else(|| booking.get("expected_checkout"));
    let occupants: i32 = booking.try_get("occupants").unwrap_or(1);
    let pricing_type: Option<String> = booking.try_get("pricing_type").ok();

    // 2. Get room type
    let room_type: String = sqlx::query_scalar("SELECT type FROM rooms WHERE id = ?")
        .bind(&room_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?
        .unwrap_or_else(|| "standard".to_string());

    // 3. Calculate pricing via the existing calculate_price_preview
    let result = do_calculate_price_preview(
        &state.db,
        &room_type,
        &check_in_str,
        &checkout_str,
        pricing_type.as_deref().unwrap_or("nightly"),
    )
    .await?;

    let total = result.total;
    let snapshot = serde_json::to_string(&serde_json::json!({
        "room_type": room_type,
        "check_in": check_in_str,
        "check_out": checkout_str,
        "occupants": occupants,
        "total": total,
        "locked_at": chrono::Local::now().to_rfc3339(),
    }))
    .map_err(|e| e.to_string())?;

    // 4. Write locked values to the booking
    let now = chrono::Local::now().to_rfc3339();
    sqlx::query(
        "UPDATE bookings SET locked_total = ?, locked_pricing_at = ?, pricing_snapshot = ?
         WHERE id = ?"
    )
    .bind(total)
    .bind(&now)
    .bind(&snapshot)
    .bind(&booking_id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    emit_db_update(&app, "booking");

    Ok(serde_json::json!({
        "booking_id": booking_id,
        "locked_total": total,
        "locked_at": now,
        "snapshot": snapshot,
    }))
}
