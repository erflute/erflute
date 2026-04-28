pub mod dtos;
pub mod entities;
pub mod errors;
mod reader;
mod validation;

use dtos::diagram::Diagram;
use errors::Error;
use reader::read_file;

pub fn open(filename: &str) -> Result<Diagram, Error> {
    let diagram = Diagram::from(read_file(&filename)?);
    validation::validate(&diagram)?;
    Ok(diagram)
}
