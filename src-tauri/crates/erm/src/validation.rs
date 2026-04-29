pub mod diagram;

pub use erm_macros::Validate;
use thiserror::Error;

#[derive(Debug, Error, PartialEq)]
#[error("Validation error at {path}: {message}")]
pub struct ValidationError {
    pub path: String,
    pub message: String,
}

impl ValidationError {
    pub fn new(path: String, message: String) -> Self {
        Self { path, message }
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
