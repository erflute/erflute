use pretty_assertions::assert_eq;

use erm::open;

use super::support;

#[test]
fn table_properties_detail_tags_are_accepted() {
    let diagram = open(support::DIAGRAM_WALKERS_DETAILS_FIXTURE).expect("failed to parse");
    let table = diagram
        .diagram_walkers
        .expect("missing diagram walkers")
        .tables
        .expect("missing tables")
        .remove(0);

    assert_eq!(table.physical_name, "MEMBERS");
}
