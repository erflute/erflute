pub mod column_type;
pub mod dtos;
pub mod entities;
pub mod errors;
mod reader;
pub mod validation;

use dtos::diagram::Diagram;
use errors::Error;
use reader::read_file;
use validation::problems::ValidationProblem;

pub fn open_unvalidated(filename: &str) -> Result<Diagram, Error> {
    Ok(Diagram::from(read_file(filename)?))
}

pub fn validate_diagram(filename: &str) -> Result<Vec<ValidationProblem>, Error> {
    let diagram = open_unvalidated(filename)?;
    Ok(validation::collect_validation_errors(&diagram)
        .into_iter()
        .map(Into::into)
        .collect())
}
