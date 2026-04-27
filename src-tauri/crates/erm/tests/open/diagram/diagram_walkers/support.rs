use std::fs;
use std::sync::atomic::{AtomicUsize, Ordering};

use erm::dtos::diagram::diagram_walkers::tables;
use erm::open;

pub(super) const DIAGRAM_WALKERS_DETAILS_FIXTURE: &str =
    "./tests/open/fixtures/diagram/diagram_walkers_details.erm";
static TEMP_FILE_COUNTER: AtomicUsize = AtomicUsize::new(0);

pub(super) fn first_table() -> tables::Table {
    let diagram = open(DIAGRAM_WALKERS_DETAILS_FIXTURE).expect("failed to parse");
    diagram
        .diagram_walkers
        .expect("missing diagram walkers")
        .tables
        .expect("missing tables")
        .into_iter()
        .next()
        .expect("missing table")
}

pub(super) fn assert_replaced_fixture_parse_error(
    target: &str,
    replacement: &str,
    test_name: &str,
) {
    let fixture =
        fs::read_to_string(DIAGRAM_WALKERS_DETAILS_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

pub(super) fn assert_replaced_fixture_parse_success(target: &str, replacement: &str) {
    let fixture =
        fs::read_to_string(DIAGRAM_WALKERS_DETAILS_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_success(content);
}

fn assert_parse_success(content: String) {
    let counter = TEMP_FILE_COUNTER.fetch_add(1, Ordering::Relaxed);
    let path = std::env::temp_dir().join(format!(
        "erm_diagram_walkers_details_{}_{}_success.erm",
        std::process::id(),
        counter
    ));

    fs::write(&path, content).expect("failed to write fixture");

    let result = open(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    result.expect("failed to parse");
}

pub(super) fn assert_parse_error(content: String, test_name: &str) {
    let path = std::env::temp_dir().join(format!(
        "erm_diagram_walkers_details_{}_{}.erm",
        std::process::id(),
        test_name
    ));

    fs::write(&path, content).expect("failed to write fixture");

    let result = open(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    assert!(result.is_err());
}
