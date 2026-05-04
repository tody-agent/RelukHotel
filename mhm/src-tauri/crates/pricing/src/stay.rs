use crate::{dynamic::DynamicRule, rate_plan::RatePlan};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Mode {
    Auto,
    Hourly,
    Night,
    Overnight,
    Monthly,
}

#[derive(Clone, Debug)]
pub struct CalcInput<'a> {
    pub requested_mode: Option<Mode>,
    pub check_in: DateTime<Utc>,
    pub check_out: DateTime<Utc>,
    pub occupants: u32,
    pub rate_plan: &'a RatePlan,
    pub dynamic_rules: &'a [DynamicRule],
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LineItem {
    pub description: String,
    pub amount: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CalcOutput {
    pub line_items: Vec<LineItem>,
    pub room_subtotal: u64,
    pub currency: String,
}
