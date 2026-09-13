# Contributing

## Commit Messages

Use the following format for every commit message:

```text
type(scope): subject
```

### Type

Use the narrowest type that accurately describes the change:

| Type | Use for |
| --- | --- |
| `feat` | New user-facing behavior or capability |
| `fix` | A defect correction |
| `refactor` | A code change that neither fixes a defect nor adds behavior |
| `test` | Test additions or corrections without a production behavior change |
| `docs` | Documentation-only changes |
| `chore` | Repository maintenance not covered by another type |
| `build` | Build system or dependency changes |
| `ci` | Continuous integration or delivery changes |
| `perf` | Performance improvements |
| `style` | Formatting-only changes that do not affect behavior |
| `revert` | Reverting an earlier commit |

### Scope

The scope is required. Write it in lowercase kebab-case and use the most specific stable logical area affected by the change, not a filename. Scopes are not restricted to a predefined list.

When a commit affects multiple closely related areas, use their shared logical area. If no accurate shared scope exists, split the changes into separate commits.

### Subject

Write the subject in English and in the imperative mood. Start it with a lowercase letter and do not end it with a period. Keep the entire header, including `type(scope): `, within 72 characters.

### Body and Footers

Add a body only when the motivation, an important constraint, or multiple tightly related outcomes cannot be expressed clearly in the subject. Separate it from the header with a blank line and explain why the change was needed or what behavior changed.

Use a `BREAKING CHANGE:` footer when the change introduces an incompatibility. Add issue references, co-authors, or other trailers only when they are supported by the change context or explicitly required.

### Examples

Valid messages:

```text
feat(diagram): add column group validation
fix(tauri-menu): preserve file state after cancellation
```

Invalid messages:

```text
feat: add column group validation
feat(Diagram): add column group validation
chore(misc): update files
```

The invalid examples respectively omit the required scope, use a scope that is not lowercase kebab-case, and use an ambiguous scope and subject instead of describing a coherent change.
