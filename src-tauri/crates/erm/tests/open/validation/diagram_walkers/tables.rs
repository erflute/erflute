use crate::open::support;
use crate::open::validation::support::assert_validation_error;

const DIAGRAM_WALKERS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_walkers.erm";
const DIAGRAM_WALKERS_DETAILS_FIXTURE: &str =
    "./tests/open/fixtures/diagram/diagram_walkers_details.erm";
const TEMP_PREFIX: &str = "erm_diagram_walkers_tables_validation";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_FIXTURE, TEMP_PREFIX, "      ");
const DETAILS_ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_DETAILS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn duplicate_column_physical_name_in_same_table_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<physical_name>MEMBER_NAME</physical_name>",
        "<physical_name>MEMBER_ID</physical_name>",
        "duplicate_column_physical_name_in_same_table",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].columns.normal_column[1].physical_name",
        "duplicate column physical_name: MEMBER_ID",
    );
}

#[test]
fn same_column_physical_name_in_different_tables_is_accepted() {
    ASSERTIONS.assert_replaced_fixture_parse_success(
        "<columns />",
        "      <columns>\n        <normal_column>\n          <physical_name>MEMBER_ID</physical_name>\n        </normal_column>\n      </columns>",
        "same_column_physical_name_in_different_tables",
    );
}

#[test]
fn duplicate_index_name_in_same_table_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "      <indexes>\n        <index>\n          <name>IDX_MEMBERS_NAME</name>\n          <type>BTREE</type>\n          <description>Name lookup</description>\n          <full_text>false</full_text>\n          <non_unique>true</non_unique>\n          <columns>\n            <column>\n              <column_id>MEMBER_NAME</column_id>\n              <desc>true</desc>\n            </column>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>\n          </columns>\n        </index>\n      </indexes>",
        "      <indexes>\n        <index>\n          <name>IDX_MEMBERS_NAME</name>\n          <type>BTREE</type>\n          <columns>\n            <column>\n              <column_id>MEMBER_NAME</column_id>\n            </column>\n          </columns>\n        </index>\n        <index>\n          <name>IDX_MEMBERS_NAME</name>\n          <type>BTREE</type>\n          <columns>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>\n          </columns>\n        </index>\n      </indexes>",
        "duplicate_index_name_in_same_table",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].indexes[1].name",
        "duplicate index name: IDX_MEMBERS_NAME",
    );
}

#[test]
fn duplicate_compound_unique_key_name_in_same_table_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "      <compound_unique_key_list>\n        <compound_unique_key>\n          <name>UK_MEMBERS_NAME</name>\n          <columns>\n            <column>\n              <column_id>MEMBER_NAME</column_id>\n            </column>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>\n          </columns>\n        </compound_unique_key>\n      </compound_unique_key_list>",
        "      <compound_unique_key_list>\n        <compound_unique_key>\n          <name>UK_MEMBERS_NAME</name>\n          <columns>\n            <column>\n              <column_id>MEMBER_NAME</column_id>\n            </column>\n          </columns>\n        </compound_unique_key>\n        <compound_unique_key>\n          <name>UK_MEMBERS_NAME</name>\n          <columns>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>\n          </columns>\n        </compound_unique_key>\n      </compound_unique_key_list>",
        "duplicate_compound_unique_key_name_in_same_table",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].compound_unique_key_list.compound_unique_key[1].name",
        "duplicate compound unique key name: UK_MEMBERS_NAME",
    );
}

#[test]
fn primary_key_name_without_primary_key_column_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<primary_key>true</primary_key>",
        "<primary_key>false</primary_key>",
        "primary_key_name_without_primary_key_column",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].primary_key_name",
        "primary_key_name requires at least one primary key column",
    );
}

#[test]
fn auto_increment_without_key_column_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<physical_name>PARENT_MEMBER_ID</physical_name>",
        "<physical_name>PARENT_MEMBER_ID</physical_name>\n          <auto_increment>true</auto_increment>",
        "auto_increment_without_key_column",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[1].columns.normal_column[0].auto_increment",
        "auto_increment column must be a key column: PARENT_MEMBER_ID",
    );
}

#[test]
fn decimal_greater_than_length_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<decimal>0</decimal>",
        "<decimal>19</decimal>",
        "decimal_greater_than_length",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].decimal",
        "decimal must be less than or equal to length: 19 > 18",
    );
}

#[test]
fn length_for_unsupported_column_type_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<type>decimal(p,s)</type>",
        "<type>datetime</type>",
        "length_for_unsupported_column_type",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].length",
        "column type does not support length: datetime",
    );
}

#[test]
fn length_for_base_numeric_column_type_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<type>decimal(p,s)</type>",
        "<type>bigint</type>",
        "length_for_base_numeric_column_type",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].length",
        "column type does not support length: bigint",
    );
}

#[test]
fn length_for_display_label_column_type_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<type>decimal(p,s)</type>",
        "<type>double(m,d)</type>",
        "length_for_display_label_column_type",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].columns.normal_column[0].length",
        "column type does not support length: double(m,d)",
    );
}

#[test]
fn decimal_for_unsupported_column_type_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<physical_name>MEMBER_NAME</physical_name>",
        "<physical_name>MEMBER_NAME</physical_name>\n          <type>varchar(n)</type>\n          <decimal>1</decimal>",
        "decimal_for_unsupported_column_type",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].columns.normal_column[1].decimal",
        "column type does not support decimal: varchar(n)",
    );
}

#[test]
fn unknown_index_column_id_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<column_id>MEMBER_NAME</column_id>",
        "<column_id>UNKNOWN_MEMBER_NAME</column_id>",
        "unknown_index_column_id",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].indexes[0].columns[0].column_id",
        "unknown index column_id: UNKNOWN_MEMBER_NAME",
    );
}

#[test]
fn unknown_compound_unique_key_column_id_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "            <column>\n              <column_id>MEMBER_NAME</column_id>\n            </column>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>",
        "            <column>\n              <column_id>UNKNOWN_MEMBER_NAME</column_id>\n            </column>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>",
        "unknown_compound_unique_key_column_id",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].compound_unique_key_list.compound_unique_key[0].columns[0].column_id",
        "unknown compound unique key column_id: UNKNOWN_MEMBER_NAME",
    );
}
