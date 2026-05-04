use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AppliesTo {
    Night,
    Overnight,
    Hourly,
    LateDay,
    LateNight,
    EarlyDay,
    EarlyNight,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Strategy {
    Replace(u64),
    Add(i64),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DynamicRule {
    pub id: String,
    pub applies_to: AppliesTo,
    pub strategy: Strategy,
    pub weekday_mask: u8, // bit 0=Mon .. bit 6=Sun
    pub specific_dates: Vec<NaiveDate>,
    pub hour_start: Option<u8>,
    pub hour_end: Option<u8>,
    pub active_from: Option<DateTime<Utc>>,
    pub active_to: Option<DateTime<Utc>>,
}
