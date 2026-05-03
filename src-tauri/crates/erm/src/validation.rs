pub mod diagram;

pub use erm_macros::Validate;
use std::fmt;

#[derive(Debug, PartialEq)]
pub struct ValidationError {
    pub path: String,
    pub message: String,
    pub targets: Vec<ValidationErrorTarget>,
}

#[derive(Debug, PartialEq)]
pub struct ValidationErrorTarget {
    pub label: String,
    pub value: String,
}

impl ValidationError {
    pub fn new(path: String, message: String) -> Self {
        Self {
            path,
            message,
            targets: Vec::new(),
        }
    }

    pub fn with_target(mut self, label: impl Into<String>, value: impl fmt::Debug) -> Self {
        self.targets.push(ValidationErrorTarget {
            label: label.into(),
            value: format!("{value:#?}"),
        });
        self
    }

    pub fn prepend_path(mut self, segment: impl AsRef<str>) -> Self {
        if self.path.starts_with('[') {
            self.path = format!("{}{}", segment.as_ref(), self.path);
        } else {
            self.path = format!("{}.{}", segment.as_ref(), self.path);
        }
        self
    }
}

impl fmt::Display for ValidationError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "Validation error\n\n{}", self.message)?;

        if !self.targets.is_empty() {
            write!(formatter, "\n\nTarget:")?;

            for target in &self.targets {
                write!(
                    formatter,
                    "\n- {}: {}",
                    target.label,
                    format_target_value(&target.value)
                )?;
            }
        }

        write!(formatter, "\n\nTechnical details:\n- path: {}", self.path)?;

        Ok(())
    }
}

impl std::error::Error for ValidationError {}

fn format_target_value(value: &str) -> String {
    value
        .strip_prefix('"')
        .and_then(|value| value.strip_suffix('"'))
        .unwrap_or(value)
        .to_string()
}

pub trait Validate {
    fn validate(&self) -> Result<(), ValidationError>;
}

impl<T: Validate> Validate for Option<T> {
    fn validate(&self) -> Result<(), ValidationError> {
        if let Some(value) = self {
            value.validate()?;
        }

        Ok(())
    }
}

impl<T: Validate> Validate for Vec<T> {
    fn validate(&self) -> Result<(), ValidationError> {
        for (index, value) in self.iter().enumerate() {
            value
                .validate()
                .map_err(|error| error.prepend_path(format!("[{index}]")))?;
        }

        Ok(())
    }
}

macro_rules! impl_noop_validate {
    ($($ty:ty),+ $(,)?) => {
        $(
            impl Validate for $ty {
                fn validate(&self) -> Result<(), ValidationError> {
                    Ok(())
                }
            }
        )+
    };
}

impl_noop_validate!(
    String,
    bool,
    u8,
    u16,
    u32,
    u64,
    usize,
    i8,
    i16,
    i32,
    i64,
    isize,
    f32,
    f64,
    crate::column_type::ColumnType,
    crate::entities::diagram::diagram_walkers::tables::connections::ChildCardinality,
    crate::entities::diagram::diagram_walkers::tables::connections::ParentCardinality,
    crate::entities::diagram::diagram_walkers::tables::connections::OnAction
);

pub fn validate<T: Validate>(value: &T) -> Result<(), ValidationError> {
    value.validate()
}
