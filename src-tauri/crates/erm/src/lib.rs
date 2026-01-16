pub mod dtos;
pub mod entities;
pub mod errors;
mod reader;

use dtos::diagram::Diagram;
use errors::Error;
use reader::read_file;

pub fn open(filename: &str) -> Result<Diagram, Error> {
    let diagram = read_file(&filename)?;
    Ok(diagram.into())
}
