pub mod column_groups;
pub mod diagram_walkers;
mod support;

use std::fs;

const DIAGRAM_WALKERS_DETAILS_FIXTURE: &str =
    "./tests/open/fixtures/diagram/diagram_walkers_details.erm";
const TEMP_PREFIX: &str = "erm_validation_problem_collection";

#[test]
fn validation_problems_are_collected_without_rejecting_the_diagram() {
    let fixture =
        fs::read_to_string(DIAGRAM_WALKERS_DETAILS_FIXTURE).expect("failed to read fixture");
    let content = fixture
        .replace(
            "<physical_name>MEMBER_NAME</physical_name>",
            "<physical_name>MEMBER_ID</physical_name>",
        )
        .replace("<decimal>0</decimal>", "<decimal>19</decimal>");
    assert_ne!(fixture, content);

    let path = std::env::temp_dir().join(format!("{TEMP_PREFIX}_{}.erm", std::process::id()));
    fs::write(&path, content).expect("failed to write fixture");

    let diagram = erm::open_unvalidated(path.to_str().expect("invalid fixture path"));
    let problems = erm::validate_diagram(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");

    assert!(diagram.is_ok());
    let problems = problems.expect("failed to validate diagram");
    let paths = problems
        .iter()
        .map(|problem| problem.path.as_str())
        .collect::<Vec<_>>();
    assert!(paths.contains(&"diagram_walkers.table[0].columns.normal_column[1].physical_name"));
    assert!(paths.contains(&"diagram_walkers.table[0].columns.normal_column[0].decimal"));
}
