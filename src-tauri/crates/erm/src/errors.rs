use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Parse error: {0}")]
    Parse(#[from] quick_xml::errors::serialize::DeError),
}
