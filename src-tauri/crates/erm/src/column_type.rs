use std::fmt;

use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Eq, Clone, Copy, Serialize, Deserialize)]
pub enum ColumnType {
    #[serde(rename = "char")]
    Char,
    #[serde(rename = "character(n)")]
    CharN,
    #[serde(rename = "varchar(n)")]
    VarCharN,
    #[serde(rename = "text")]
    Text,
    #[serde(rename = "tinytext")]
    TinyText,
    #[serde(rename = "mediumtext")]
    MediumText,
    #[serde(rename = "longtext")]
    LongText,
    #[serde(rename = "integer")]
    Int,
    #[serde(rename = "int(n)")]
    IntN,
    #[serde(rename = "tinyint")]
    TinyInt,
    #[serde(rename = "tinyint(n)")]
    TinyIntN,
    #[serde(rename = "smallint")]
    SmallInt,
    #[serde(rename = "smallint(n)")]
    SmallIntN,
    #[serde(rename = "mediumint")]
    MediumInt,
    #[serde(rename = "mediumint(n)")]
    MediumIntN,
    #[serde(rename = "bigint")]
    BigInt,
    #[serde(rename = "bigint(n)")]
    BigIntN,
    #[serde(rename = "date")]
    Date,
    #[serde(rename = "datetime")]
    Datetime,
    #[serde(rename = "boolean")]
    Boolean,
    #[serde(rename = "binary1")]
    Binary,
    #[serde(rename = "binary(n)")]
    BinaryN,
    #[serde(rename = "varbinary(n)")]
    VarBinaryN,
    #[serde(rename = "bit(n)")]
    BitN,
    #[serde(rename = "blob")]
    Blob,
    #[serde(rename = "tinyblob")]
    TinyBlob,
    #[serde(rename = "mediumblob")]
    MediumBlob,
    #[serde(rename = "longblob")]
    LongBlob,
    #[serde(rename = "decimal")]
    Decimal,
    #[serde(rename = "decimal(p)")]
    DecimalP,
    #[serde(rename = "decimal(p,s)")]
    DecimalPS,
    #[serde(rename = "double")]
    Double,
    #[serde(rename = "double precision(m,d)")]
    DoubleMD,
    #[serde(rename = "enum")]
    Enum,
    #[serde(rename = "float")]
    Float,
    #[serde(rename = "float(m,d)")]
    FloatMD,
    #[serde(rename = "float(p)")]
    FloatP,
    #[serde(rename = "geometry")]
    Geometry,
    #[serde(rename = "json")]
    Json,
    #[serde(rename = "numeric")]
    Numeric,
    #[serde(rename = "numeric(p)")]
    NumericP,
    #[serde(rename = "numeric(p,s)")]
    NumericPS,
    #[serde(rename = "real")]
    Real,
    #[serde(rename = "real(m,d)")]
    RealMD,
    #[serde(rename = "set")]
    Set,
    #[serde(rename = "time")]
    Time,
    #[serde(rename = "timestamp")]
    Timestamp,
    #[serde(rename = "year(2)")]
    Year2,
    #[serde(rename = "year(4)")]
    Year4,
}

impl ColumnType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Char => "char",
            Self::CharN => "character(n)",
            Self::VarCharN => "varchar(n)",
            Self::Text => "text",
            Self::TinyText => "tinytext",
            Self::MediumText => "mediumtext",
            Self::LongText => "longtext",
            Self::Int => "integer",
            Self::IntN => "int(n)",
            Self::TinyInt => "tinyint",
            Self::TinyIntN => "tinyint(n)",
            Self::SmallInt => "smallint",
            Self::SmallIntN => "smallint(n)",
            Self::MediumInt => "mediumint",
            Self::MediumIntN => "mediumint(n)",
            Self::BigInt => "bigint",
            Self::BigIntN => "bigint(n)",
            Self::Date => "date",
            Self::Datetime => "datetime",
            Self::Boolean => "boolean",
            Self::Binary => "binary1",
            Self::BinaryN => "binary(n)",
            Self::VarBinaryN => "varbinary(n)",
            Self::BitN => "bit(n)",
            Self::Blob => "blob",
            Self::TinyBlob => "tinyblob",
            Self::MediumBlob => "mediumblob",
            Self::LongBlob => "longblob",
            Self::Decimal => "decimal",
            Self::DecimalP => "decimal(p)",
            Self::DecimalPS => "decimal(p,s)",
            Self::Double => "double",
            Self::DoubleMD => "double precision(m,d)",
            Self::Enum => "enum",
            Self::Float => "float",
            Self::FloatMD => "float(m,d)",
            Self::FloatP => "float(p)",
            Self::Geometry => "geometry",
            Self::Json => "json",
            Self::Numeric => "numeric",
            Self::NumericP => "numeric(p)",
            Self::NumericPS => "numeric(p,s)",
            Self::Real => "real",
            Self::RealMD => "real(m,d)",
            Self::Set => "set",
            Self::Time => "time",
            Self::Timestamp => "timestamp",
            Self::Year2 => "year(2)",
            Self::Year4 => "year(4)",
        }
    }

    pub fn supports_length(self) -> bool {
        matches!(
            self,
            Self::CharN
                | Self::VarCharN
                | Self::IntN
                | Self::TinyIntN
                | Self::SmallIntN
                | Self::MediumIntN
                | Self::BigIntN
                | Self::BinaryN
                | Self::VarBinaryN
                | Self::BitN
                | Self::DecimalP
                | Self::DecimalPS
                | Self::DoubleMD
                | Self::FloatMD
                | Self::FloatP
                | Self::NumericP
                | Self::NumericPS
                | Self::RealMD
        )
    }

    pub fn supports_decimal(self) -> bool {
        matches!(
            self,
            Self::DecimalPS | Self::DoubleMD | Self::FloatMD | Self::NumericPS | Self::RealMD
        )
    }
}

impl fmt::Display for ColumnType {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}

impl Default for ColumnType {
    fn default() -> Self {
        Self::Char
    }
}
