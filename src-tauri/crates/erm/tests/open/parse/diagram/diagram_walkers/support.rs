use erm::dtos::diagram::diagram_walkers::tables;
use erm::open;

use crate::open::support as diagram_support;

pub(super) const DIAGRAM_WALKERS_DETAILS_FIXTURE: &str =
    "./tests/open/fixtures/diagram/diagram_walkers_details.erm";
const TEMP_PREFIX: &str = "erm_diagram_walkers_details";

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
    diagram_support::assert_replaced_fixture_parse_error(
        DIAGRAM_WALKERS_DETAILS_FIXTURE,
        TEMP_PREFIX,
        target,
        replacement,
        test_name,
    );
}

pub(super) fn assert_replaced_fixture_parse_success(
    target: &str,
    replacement: &str,
    test_name: &str,
) {
    diagram_support::assert_replaced_fixture_parse_success(
        DIAGRAM_WALKERS_DETAILS_FIXTURE,
        TEMP_PREFIX,
        target,
        replacement,
        test_name,
    );
}
