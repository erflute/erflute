use serde::{Deserialize, Deserializer, Serialize, Serializer};

#[derive(Debug, PartialEq)]
pub enum OnAction {
    Restrict,
    Cascade,
    SetNull,
    SetDefault,
    NoAction,
}

impl OnAction {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Restrict => "RESTRICT",
            Self::Cascade => "CASCADE",
            Self::SetNull => "SET NULL",
            Self::SetDefault => "SET DEFAULT",
            Self::NoAction => "",
        }
    }
}

impl Serialize for OnAction {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.as_str())
    }
}

impl<'de> Deserialize<'de> for OnAction {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let value = String::deserialize(deserializer)?;

        match value.as_str() {
            "RESTRICT" => Ok(Self::Restrict),
            "CASCADE" => Ok(Self::Cascade),
            "SET NULL" => Ok(Self::SetNull),
            "SET DEFAULT" => Ok(Self::SetDefault),
            "" => Ok(Self::NoAction),
            _ => Err(serde::de::Error::unknown_variant(
                &value,
                &["RESTRICT", "CASCADE", "SET NULL", "SET DEFAULT", ""],
            )),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub enum ParentCardinality {
    #[serde(rename = "1")]
    One,
    #[serde(rename = "0..1")]
    ZeroOrOne,
}

impl ParentCardinality {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::One => "1",
            Self::ZeroOrOne => "0..1",
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub enum ChildCardinality {
    #[serde(rename = "1..n")]
    OneOrMore,
    #[serde(rename = "0..n")]
    ZeroOrMore,
    #[serde(rename = "1")]
    One,
    #[serde(rename = "0..1")]
    ZeroOrOne,
}

impl ChildCardinality {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::OneOrMore => "1..n",
            Self::ZeroOrMore => "0..n",
            Self::One => "1",
            Self::ZeroOrOne => "0..1",
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Bendpoint {
    pub relative: bool,
    pub x: u16,
    pub y: u16,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct FkColumn {
    pub fk_column_name: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct FkColumns {
    #[serde(default)]
    pub fk_column: Vec<FkColumn>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Relationship {
    pub name: String,

    pub source: String,

    pub target: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "bendpoint")]
    pub bendpoints: Option<Vec<Bendpoint>>,

    pub fk_columns: FkColumns,

    pub parent_cardinality: ParentCardinality,

    pub child_cardinality: ChildCardinality,

    pub reference_for_pk: bool,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub on_delete_action: Option<OnAction>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub on_update_action: Option<OnAction>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_simple_unique_column: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_compound_unique_key: Option<String>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Connections {
    #[serde(default)]
    #[serde(rename = "relationship")]
    pub relationships: Option<Vec<Relationship>>,
}
