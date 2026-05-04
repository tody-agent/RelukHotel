use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RatePlan {
    pub id: String,
    pub capacity: u32,
    pub night_rate: Option<u64>,
    pub overnight: Option<OvernightRate>,
    pub monthly: Option<MonthlyRate>,
    pub hourly: Option<HourlyRate>,
    pub early_checkin_day: Vec<SurchargeStep>,
    pub early_checkin_night: Vec<SurchargeStep>,
    pub late_checkout_day: Vec<SurchargeStep>,
    pub late_checkout_night: Vec<SurchargeStep>,
    pub extra_bed_per_person: u64,
    /// How many minutes to round up to (15, 30, 45, or 60). Default 60.
    pub rounding_minutes: u32,
    /// Intra-day calculation mode.
    pub intraday_mode: IntradayMode,

    // ── Configurable standard hours (SkyHotel parity) ──
    /// Standard check-in hour for day stays (default 14:00).
    #[serde(default = "default_checkin_hour")]
    pub standard_checkin_hour: u8,
    /// Standard check-out hour for day stays (default 12:00).
    #[serde(default = "default_checkout_hour")]
    pub standard_checkout_hour: u8,

    // ── Auto-detection config ──
    /// Auto-select Overnight mode if check-in is after this time (default 22:00).
    #[serde(default = "default_auto_overnight_checkin_hour")]
    pub auto_overnight_checkin_hour: u8,
    #[serde(default)]
    pub auto_overnight_checkin_minute: u8,
    /// Auto-select Overnight mode if check-out is before this time (default 03:00).
    #[serde(default = "default_auto_overnight_checkout_hour")]
    pub auto_overnight_checkout_hour: u8,
    #[serde(default)]
    pub auto_overnight_checkout_minute: u8,
    /// If true, auto-select the mode with higher price for the hotel
    /// (e.g., if hourly total > overnight price → use overnight).
    #[serde(default = "default_true")]
    pub auto_compare_price: bool,
    /// If true, auto-select Daily when overnight/hourly price > daily price.
    #[serde(default = "default_true")]
    pub auto_prefer_daily_over_overnight: bool,
    /// Only start counting surcharge after this many minutes past standard hour.
    /// Default 15. Set to 0 to count surcharge immediately.
    #[serde(default = "default_surcharge_threshold")]
    pub surcharge_threshold_minutes: u32,
}

fn default_checkin_hour() -> u8 { 14 }
fn default_checkout_hour() -> u8 { 12 }
fn default_auto_overnight_checkin_hour() -> u8 { 22 }
fn default_auto_overnight_checkout_hour() -> u8 { 3 }
fn default_true() -> bool { true }
fn default_surcharge_threshold() -> u32 { 15 }

/// Controls how same-day (intra-day) stays are calculated.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IntradayMode {
    /// Standard hourly/night calculation (default).
    Default,
    /// Separate surcharge line items from base rate.
    SplitSurcharge,
    /// Always charge at least 1 full night regardless of stay duration.
    AlwaysOneNight,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum SurchargeValue {
    Amount(u64),
    PercentOfNight(u8),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SurchargeStep {
    pub up_to_hours: u32,
    pub value: SurchargeValue,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HourlyRate {
    pub steps: Vec<(u32, u64)>, // (hour, total_price)
    pub max_hours: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OvernightRate {
    pub price: u64,
    pub start_hour: u8,
    /// Minute component of overnight start time (default 0).
    #[serde(default)]
    pub start_minute: u8,
    /// End hour of overnight window — check-in before this hour still counts as overnight.
    /// Default 6 (6:00 AM).
    #[serde(default = "default_overnight_end_hour")]
    pub end_hour: u8,
    /// Minute component of overnight end time (default 0).
    #[serde(default)]
    pub end_minute: u8,
    /// Check-out hour for overnight stays (default 12:00 next day).
    #[serde(default = "default_checkout_hour")]
    pub checkout_hour: u8,
}

fn default_overnight_end_hour() -> u8 { 6 }

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MonthlyRate {
    pub price: u64,
    pub residual_mode: ResidualMode,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ResidualMode {
    PerDay { day_rate: u64 },
    FullMonth,
}
