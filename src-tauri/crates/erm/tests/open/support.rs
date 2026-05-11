use std::fs;

use erm::dtos::diagram::Diagram;
use erm::errors::Error;
use erm::open_unvalidated;
use erm::validate_diagram;
use erm::validation::problems::ValidationProblem;

pub(crate) struct FixtureAssertions {
    fixture_path: &'static str,
    temp_prefix: &'static str,
    element_indent: &'static str,
}

impl FixtureAssertions {
    pub(crate) const fn new(
        fixture_path: &'static str,
        temp_prefix: &'static str,
        element_indent: &'static str,
    ) -> Self {
        Self {
            fixture_path,
            temp_prefix,
            element_indent,
        }
    }

    pub(crate) fn assert_replaced_fixture_parse_error(
        &self,
        target: &str,
        replacement: &str,
        test_name: &str,
    ) {
        assert_replaced_fixture_parse_error(
            self.fixture_path,
            self.temp_prefix,
            target,
            replacement,
            test_name,
        );
    }

    pub(crate) fn open_replaced_fixture(
        &self,
        target: &str,
        replacement: &str,
        test_name: &str,
    ) -> Result<Diagram, Error> {
        let fixture = fs::read_to_string(self.fixture_path).expect("failed to read fixture");
        let content = fixture.replace(target, replacement);
        assert_ne!(fixture, content);

        open_content(content, self.temp_prefix, test_name)
    }

    pub(crate) fn validate_replaced_fixture(
        &self,
        target: &str,
        replacement: &str,
        test_name: &str,
    ) -> Result<Vec<ValidationProblem>, Error> {
        let fixture = fs::read_to_string(self.fixture_path).expect("failed to read fixture");
        let content = fixture.replace(target, replacement);
        assert_ne!(fixture, content);

        validate_content(content, self.temp_prefix, test_name)
    }

    pub(crate) fn assert_replaced_fixture_validation_success(
        &self,
        target: &str,
        replacement: &str,
        test_name: &str,
    ) {
        let fixture = fs::read_to_string(self.fixture_path).expect("failed to read fixture");
        let content = fixture.replace(target, replacement);
        assert_ne!(fixture, content);

        let problems = validate_content(content, self.temp_prefix, test_name)
            .expect("failed to validate fixture");
        assert!(problems.is_empty());
    }

    pub(crate) fn assert_removed_line_parse_error(&self, tag_name: &str, test_name: &str) {
        assert_removed_line_parse_error(self.fixture_path, self.temp_prefix, tag_name, test_name);
    }

    pub(crate) fn assert_removed_element_parse_error(&self, tag_name: &str, test_name: &str) {
        assert_removed_element_parse_error(
            self.fixture_path,
            self.temp_prefix,
            self.element_indent,
            tag_name,
            test_name,
        );
    }
}

pub(crate) fn assert_replaced_fixture_parse_error(
    fixture_path: &str,
    temp_prefix: &str,
    target: &str,
    replacement: &str,
    test_name: &str,
) {
    let fixture = fs::read_to_string(fixture_path).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_error(content, temp_prefix, test_name);
}

pub(crate) fn assert_replaced_fixture_parse_success(
    fixture_path: &str,
    temp_prefix: &str,
    target: &str,
    replacement: &str,
    test_name: &str,
) {
    let fixture = fs::read_to_string(fixture_path).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_success(content, temp_prefix, test_name);
}

pub(crate) fn assert_removed_line_parse_error(
    fixture_path: &str,
    temp_prefix: &str,
    tag_name: &str,
    test_name: &str,
) {
    let fixture = fs::read_to_string(fixture_path).expect("failed to read fixture");
    let line = fixture
        .lines()
        .find(|line| line.trim_start().starts_with(&format!("<{tag_name}>")))
        .expect("failed to find fixture line");
    let content = fixture.replace(&format!("{line}\n"), "");
    assert_ne!(fixture, content);

    assert_parse_error(content, temp_prefix, test_name);
}

pub(crate) fn assert_removed_element_parse_error(
    fixture_path: &str,
    temp_prefix: &str,
    element_indent: &str,
    tag_name: &str,
    test_name: &str,
) {
    let fixture = fs::read_to_string(fixture_path).expect("failed to read fixture");
    let start = fixture
        .find(&format!("{element_indent}<{tag_name}"))
        .expect("failed to find fixture element");

    let content = if let Some(self_closing_end) = fixture[start..].find("/>\n") {
        let end = start + self_closing_end + 3;
        let mut content = fixture.clone();
        content.replace_range(start..end, "");
        content
    } else {
        let closing = format!("{element_indent}</{tag_name}>\n");
        let end = fixture[start..]
            .find(&closing)
            .map(|index| start + index + closing.len())
            .expect("failed to find fixture closing element");
        let mut content = fixture.clone();
        content.replace_range(start..end, "");
        content
    };

    assert_ne!(fixture, content);
    assert_parse_error(content, temp_prefix, test_name);
}

pub(crate) fn assert_parse_error(content: String, temp_prefix: &str, test_name: &str) {
    let path = temp_file_path(temp_prefix, test_name);

    fs::write(&path, content).expect("failed to write fixture");

    let result = open_unvalidated(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    assert!(result.is_err());
}

fn assert_parse_success(content: String, temp_prefix: &str, test_name: &str) {
    open_content(content, temp_prefix, test_name).expect("failed to parse");
}

fn open_content(content: String, temp_prefix: &str, test_name: &str) -> Result<Diagram, Error> {
    let path = temp_file_path(temp_prefix, test_name);

    fs::write(&path, content).expect("failed to write fixture");

    let result = open_unvalidated(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    result
}

fn validate_content(
    content: String,
    temp_prefix: &str,
    test_name: &str,
) -> Result<Vec<ValidationProblem>, Error> {
    let path = temp_file_path(temp_prefix, test_name);

    fs::write(&path, content).expect("failed to write fixture");

    let result = validate_diagram(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    result
}

fn temp_file_path(temp_prefix: &str, test_name: &str) -> std::path::PathBuf {
    std::env::temp_dir().join(format!(
        "{temp_prefix}_{}_{}.erm",
        std::process::id(),
        test_name
    ))
}
