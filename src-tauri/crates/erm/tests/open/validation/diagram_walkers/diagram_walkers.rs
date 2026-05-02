use crate::open::support;
use crate::open::validation::support::assert_validation_error_with_targets;

const DIAGRAM_WALKERS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_walkers.erm";
const DIAGRAM_WALKERS_DETAILS_FIXTURE: &str =
    "./tests/open/fixtures/diagram/diagram_walkers_details.erm";
const TEMP_PREFIX: &str = "erm_diagram_walkers_validation";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_FIXTURE, TEMP_PREFIX, "      ");
const DETAILS_ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_DETAILS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn duplicate_table_physical_name_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<physical_name>MEMBER_STATUS</physical_name>",
        "<physical_name>MEMBERS</physical_name>",
        "duplicate_table_physical_name",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[1].physical_name",
        "duplicate table physical_name: MEMBERS",
        &[("table name", "MEMBERS")],
    );
}

#[test]
fn duplicate_relationship_name_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "        </relationship>",
        "        </relationship>\n        <relationship>\n          <name>FK_MEMBERS_PARENT</name>\n          <source>table.PARENT_MEMBERS</source>\n          <target>table.MEMBERS</target>\n          <fk_columns>\n            <fk_column>\n              <fk_column_name>MEMBER_ID</fk_column_name>\n            </fk_column>\n          </fk_columns>\n          <parent_cardinality>0..1</parent_cardinality>\n          <child_cardinality>0..n</child_cardinality>\n          <reference_for_pk>false</reference_for_pk>\n          <referred_simple_unique_column>table.PARENT_MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>\n        </relationship>",
        "duplicate_relationship_name",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[1].name",
        "duplicate relationship name: FK_MEMBERS_PARENT",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn unknown_relationship_source_table_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<source>table.PARENT_MEMBERS</source>",
        "<source>table.UNKNOWN_MEMBERS</source>",
        "unknown_relationship_source_table",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].source",
        "unknown relationship source table: table.UNKNOWN_MEMBERS",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn unknown_relationship_target_table_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<target>table.MEMBERS</target>",
        "<target>table.UNKNOWN_MEMBERS</target>",
        "unknown_relationship_target_table",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].target",
        "unknown relationship target table: table.UNKNOWN_MEMBERS",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn relationship_target_different_from_containing_table_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<target>table.MEMBERS</target>",
        "<target>table.PARENT_MEMBERS</target>",
        "relationship_target_different_from_containing_table",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].target",
        "relationship target must match containing table: table.PARENT_MEMBERS",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn unknown_relationship_fk_column_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<fk_column_name>MEMBER_ID</fk_column_name>",
        "<fk_column_name>UNKNOWN_MEMBER_ID</fk_column_name>",
        "unknown_relationship_fk_column",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].fk_columns.fk_column[0].fk_column_name",
        "unknown relationship fk_column_name: UNKNOWN_MEMBER_ID",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn relationship_missing_column_fk_mapping_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<fk_column_name>MEMBER_ID</fk_column_name>",
        "<fk_column_name>MEMBER_NAME</fk_column_name>",
        "relationship_missing_column_fk_mapping",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].fk_columns.fk_column[0].fk_column_name",
        "fk column must reference relationship: MEMBER_NAME -> FK_MEMBERS_PARENT",
        &[
            ("table name", "MEMBERS"),
            ("column name", "MEMBER_NAME"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn relationship_fk_column_without_column_relationship_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "          <relationship>FK_MEMBERS_PARENT</relationship>\n",
        "",
        "relationship_fk_column_without_column_relationship",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].fk_columns.fk_column[0].fk_column_name",
        "fk column must reference relationship: MEMBER_ID -> FK_MEMBERS_PARENT",
        &[
            ("table name", "MEMBERS"),
            ("column name", "MEMBER_ID"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn relationship_column_referred_table_mismatch_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<referred_column>table.PARENT_MEMBERS.PARENT_MEMBER_ID</referred_column>",
        "<referred_column>table.MEMBERS.MEMBER_ID</referred_column>",
        "relationship_column_referred_table_mismatch",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].referred_column",
        "referred_column table must match relationship source: table.MEMBERS.MEMBER_ID",
        &[("table name", "MEMBERS"), ("column name", "MEMBER_ID")],
    );
}

#[test]
fn unknown_referred_column_table_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<referred_column>table.PARENT_MEMBERS.PARENT_MEMBER_ID</referred_column>",
        "<referred_column>table.UNKNOWN_MEMBERS.PARENT_MEMBER_ID</referred_column>",
        "unknown_referred_column_table",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].referred_column",
        "unknown referred column table: table.UNKNOWN_MEMBERS.PARENT_MEMBER_ID",
        &[("table name", "MEMBERS"), ("column name", "MEMBER_ID")],
    );
}

#[test]
fn unknown_referred_column_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<referred_column>table.PARENT_MEMBERS.PARENT_MEMBER_ID</referred_column>",
        "<referred_column>table.PARENT_MEMBERS.UNKNOWN_MEMBER_ID</referred_column>",
        "unknown_referred_column",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].referred_column",
        "unknown referred column: table.PARENT_MEMBERS.UNKNOWN_MEMBER_ID",
        &[("table name", "MEMBERS"), ("column name", "MEMBER_ID")],
    );
}

#[test]
fn unknown_referred_simple_unique_column_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<referred_simple_unique_column>table.PARENT_MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "<referred_simple_unique_column>table.PARENT_MEMBERS.UNKNOWN_MEMBER_CODE</referred_simple_unique_column>",
        "unknown_referred_simple_unique_column",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].referred_simple_unique_column",
        "unknown referred simple unique column: table.PARENT_MEMBERS.UNKNOWN_MEMBER_CODE",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
            ("source table name", "PARENT_MEMBERS"),
        ],
    );
}

#[test]
fn invalid_referred_simple_unique_column_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<referred_simple_unique_column>table.PARENT_MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "<referred_simple_unique_column>PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "invalid_referred_simple_unique_column",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].referred_simple_unique_column",
        "invalid referred simple unique column: PARENT_MEMBER_CODE",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn referred_simple_unique_column_with_target_table_name_is_accepted() {
    DETAILS_ASSERTIONS.assert_replaced_fixture_parse_success(
        "<referred_simple_unique_column>table.PARENT_MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "<referred_simple_unique_column>table.MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "referred_simple_unique_column_with_target_table_name",
    );
}

#[test]
fn unknown_referred_compound_unique_key_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<referred_simple_unique_column>table.PARENT_MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "<referred_compound_unique_key>UK_UNKNOWN_MEMBERS_CODE</referred_compound_unique_key>",
        "unknown_referred_compound_unique_key",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].referred_compound_unique_key",
        "unknown referred compound unique key: UK_UNKNOWN_MEMBERS_CODE",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
            ("source table name", "PARENT_MEMBERS"),
        ],
    );
}

#[test]
fn simultaneous_referred_unique_targets_are_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<referred_simple_unique_column>table.PARENT_MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "<referred_compound_unique_key>UK_PARENT_MEMBERS_CODE</referred_compound_unique_key>\n          <referred_simple_unique_column>table.PARENT_MEMBERS.PARENT_MEMBER_CODE</referred_simple_unique_column>",
        "simultaneous_referred_unique_targets",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].connections.relationship[0].referred_simple_unique_column",
        "referred_simple_unique_column and referred_compound_unique_key cannot both be specified",
        &[
            ("table name", "MEMBERS"),
            ("relationship name", "FK_MEMBERS_PARENT"),
        ],
    );
}

#[test]
fn unknown_normal_column_relationship_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<relationship>FK_MEMBERS_PARENT</relationship>",
        "<relationship>FK_UNKNOWN_MEMBERS_PARENT</relationship>",
        "unknown_normal_column_relationship",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].relationship",
        "unknown relationship: FK_UNKNOWN_MEMBERS_PARENT",
        &[("table name", "MEMBERS"), ("column name", "MEMBER_ID")],
    );
}

#[test]
fn unknown_column_group_reference_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<column_group>COMMON_COLUMNS</column_group>",
        "<column_group>UNKNOWN_COLUMNS</column_group>",
        "unknown_column_group_reference",
    );

    assert_validation_error_with_targets(
        result,
        "diagram_walkers.table[0].columns.column_group[2]",
        "unknown column group: UNKNOWN_COLUMNS",
        &[("table name", "MEMBERS")],
    );
}
