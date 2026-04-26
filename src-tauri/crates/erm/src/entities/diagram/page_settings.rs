use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct PageSettings {
    pub direction_horizontal: bool,
    pub scale: i64,
    pub paper_size: String,
    pub top_margin: i64,
    pub left_margin: i64,
    pub bottom_margin: i64,
    pub right_margin: i64,
}
