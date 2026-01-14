# AGENTS.md

## General

- Write all code in English, including tests.
- Fix all ESLint syntax errors and warnings before completing any task.

## Component Directory Structure

Place each component in its own directory.
A typical structure should look like:

```
component_name/
  index.tsx       // Component implementation
  types.ts        // Component-specific type definitions
  // other files (e.g., hooks, styles, tests)
```

## Tests

### General

- Do not wrap test files in a top-level `describe` block.  
  A `describe` block must be used only when it meaningfully expresses a user-facing scenario or condition.

- Avoid using component or function names in `describe` blocks.  
  `describe` should group tests only by user-visible behavior or scenario, not by implementation details.

- Use `describe` sparingly.  
  Add a `describe` block only when multiple tests share the same user-facing situation  
  (e.g., “when the dialog is open”, “with invalid input”).  
  If a single test can stand alone, do not create a wrapping `describe` at all.

- Tests should have a clear and single behavioral flow.
  Do not mix multiple UI interactions and assertions in a way that blurs the Given / When / Then structure.
  In particular, avoid tests where assertions are followed by additional userEvent interactions within the same test.
  If a test requires another user interaction after an assertion, it should be split into a separate test case.
  Each test is expected to represent one coherent user scenario, expressed through its structure rather than explanatory comments.

### Testing library

- Avoid selecting elements by passing `id` values to `getByLabelText`.
  Prefer user-facing attributes such as roles, labels, and visible text rather than internal implementation details.

- Maintain a clear Given–When–Then structure conceptually in unit tests.
  This structure guides test clarity, but does not require explicit comments in the code.
  Keep each test focused, and limit interactions to a single user action when possible.

- Avoid using DOM navigation helpers such as `closest`.
  These patterns depend on non-user-visible implementation details and conflict with Testing Library’s user-centric approach.
  Use them only when no accessible queries or user-facing selectors are viable.
