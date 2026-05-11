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
        let content = replaced_fixture_content(self.fixture_path, target, replacement, test_name);

        open_content(content, self.temp_prefix, test_name)
    }

    pub(crate) fn validate_replaced_fixture(
        &self,
        target: &str,
        replacement: &str,
        test_name: &str,
    ) -> Result<Vec<ValidationProblem>, Error> {
        let content = replaced_fixture_content(self.fixture_path, target, replacement, test_name);

        validate_content(content, self.temp_prefix, test_name)
    }

    pub(crate) fn assert_replaced_fixture_validation_success(
        &self,
        target: &str,
        replacement: &str,
        test_name: &str,
    ) {
        let content = replaced_fixture_content(self.fixture_path, target, replacement, test_name);

        let problems = validate_content(content, self.temp_prefix, test_name)
            .expect("failed to validate fixture");
        assert!(
            problems.is_empty(),
            "expected no validation problems for {test_name}, but found:\n{}",
            format_validation_problems(&problems),
        );
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
    let content = replaced_fixture_content(fixture_path, target, replacement, test_name);

    assert_parse_error(content, temp_prefix, test_name);
}

pub(crate) fn assert_replaced_fixture_parse_success(
    fixture_path: &str,
    temp_prefix: &str,
    target: &str,
    replacement: &str,
    test_name: &str,
) {
    let content = replaced_fixture_content(fixture_path, target, replacement, test_name);

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
    assert!(
        fixture != content,
        "failed to remove line from fixture\nfixture: {fixture_path}\ntest: {test_name}\ntag: {tag_name}",
    );

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

    assert!(
        fixture != content,
        "failed to remove element from fixture\nfixture: {fixture_path}\ntest: {test_name}\ntag: {tag_name}",
    );
    assert_parse_error(content, temp_prefix, test_name);
}

fn replaced_fixture_content(
    fixture_path: &str,
    target: &str,
    replacement: &str,
    test_name: &str,
) -> String {
    let fixture = fs::read_to_string(fixture_path).expect("failed to read fixture");

    assert!(
        fixture.contains(target),
        "failed to replace fixture content because target text was not found\nfixture: {fixture_path}\ntest: {test_name}\ntarget:\n{target}\n\nreplacement:\n{replacement}",
    );

    fixture.replace(target, replacement)
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

fn format_validation_problems(problems: &[ValidationProblem]) -> String {
    if problems.is_empty() {
        return "  <none>".to_string();
    }

    problems
        .iter()
        .enumerate()
        .map(|(index, problem)| {
            let targets = if problem.targets.is_empty() {
                "targets: <none>".to_string()
            } else {
                format!(
                    "targets: {}",
                    problem
                        .targets
                        .iter()
                        .map(|target| format!("{}={}", target.label, target.value))
                        .collect::<Vec<_>>()
                        .join(", "),
                )
            };

            format!(
                "  {index}. path: {}\n     title: {}\n     {targets}",
                problem.path, problem.title,
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}
