---
name: create-github-pull-request
description: Create a reviewed draft GitHub pull request for the erflute repository from the current non-default branch, using only committed changes and generating the body from the repository's live pull request template. Use when the user explicitly asks to preview, open, or create a PR for the branch currently checked out. Do not use for committing working-tree changes, publishing a different branch, modifying an existing PR, or creating issues.
---

# Create GitHub Pull Request

Create one draft pull request from the current branch for `erflute/erflute`. Preview the exact pull request and obtain approval before pushing or creating it.

## Workflow

1. Use `erflute/erflute` as the base repository. Inspect the GitHub remotes and current-branch configuration to resolve the base remote, the existing remote to which the head branch will be pushed, and that remote's owner and repository. Accept both a direct clone and a fork setup such as `origin=<owner>/erflute` with `upstream=erflute/erflute`; do not require `origin` to be the base repository. Prefer the configured push remote, then an unambiguous existing remote owned by or writable to the authenticated user. Never add or change remotes. If the push target is missing or ambiguous, stop and ask the user to identify it.
2. Determine the current branch and the default branch of the base repository. Refuse to create a pull request from a detached HEAD or from the base repository's default branch. Use that default branch as the base; do not assume that it is named `main`.
3. Fetch the current base branch and head remote refs without pruning, rebasing, merging, or modifying tracked files. Prefer an existing remote for `erflute/erflute`; if none exists, fetch the base branch directly from the canonical repository URL without adding or changing a remote. Inspect:
   - `git status --short --branch`;
   - the commits and diff between the remote base branch and `HEAD`;
   - whether the current branch has a counterpart on the resolved head remote and whether the histories have diverged.
   Stop if there are no committed changes for the pull request. Never stage, commit, stash, discard, or include working-tree changes. If uncommitted changes exist, list them as a warning in the preview.
4. Confirm before previewing that a pull request can be created through either the connected GitHub app or an installed and authenticated `gh` CLI. Stop before pushing if neither path is available.
5. Search `erflute/erflute` for an open pull request with the same qualified head (`<head-owner>:<branch>`). If one exists, return its number and URL without creating another. If only a closed or merged pull request exists for that qualified head, show it and require explicit confirmation before preparing a new pull request.
6. Read `.github/pull_request_template.md` from the current commit. Treat its current visible headings, order, and Markdown structure as the only source of truth; do not use a copied or hard-coded template. Remove instructional HTML comments from the proposed body, but preserve the visible section order and checklist structure.
7. Derive a concise English title and body from the complete committed diff and commit history:
   - Summarize the purpose and reason for the pull request in one or two lines where the template requests a summary.
   - List each meaningful completed change with a checked Markdown checkbox where the template provides a change checklist.
   - Infer an issue number from a branch name such as `feat/134_description`, then verify that the issue exists in `erflute/erflute`. Use `Closes #134` only after verification. Ask the user when the number is missing, ambiguous, or invalid; use `None` only after the user confirms that there is no related issue.
   - State in the notes that tests were not run as part of this pull request creation workflow. Never imply that checks passed when they were not run.
   - Include only information supported by the diff, commit history, repository, or user. Do not expose credentials, tokens, private data, or unrelated conversation content.
8. Present an exact preview containing the base repository (`erflute/erflute`), base branch, qualified head repository and branch, draft status, title, complete Markdown body, resolved push remote and action, uncommitted-change warning, and the fact that validation will not be run. Ask for explicit approval of this complete preview. A prior request to create a pull request is not approval of unseen content. If any proposed field changes, show the revised preview and obtain approval again.
9. After approval, push the checked-out branch to the approved head remote with upstream tracking. Use a normal push only; never force-push or push the branch to a different repository. If the remote branch has diverged or the push is rejected, stop and report the state without merging, rebasing, or retrying destructively.
10. Create the draft pull request in `erflute/erflute` through the connected GitHub app, using the approved base branch and qualified head (`<head-owner>:<branch>`) and preserving the approved title and body exactly. Use authenticated `gh pr create --draft` with a temporary body file only when the connector is unavailable or cannot represent the request cleanly.
11. Return the pull request number and URL together with the base repository and branch and the head repository and branch. If creation reports an ambiguous failure, search again for a pull request with the same qualified head before retrying; never create a duplicate blindly.

## Content Rules

- Keep the title outcome-oriented and representative of the entire diff.
- Keep the body concise while completing every visible section required by the current template.
- Preserve real Markdown newlines. When using `gh`, pass the approved body through a temporary file rather than escaped inline text.
- Do not run tests, lint, type checking, builds, or formatters in this workflow. Report this accurately in the pull request notes and preview.

## Safety Boundaries

- Do not create a ready-for-review pull request; always create a draft.
- Do not push or create the pull request before approval of the exact preview.
- Do not stage, commit, stash, edit, or discard local files.
- Do not change branches, rewrite history, force-push, merge, or rebase.
- Do not add, remove, or change Git remotes.
- Do not silently use a different base repository, base branch, head repository, head branch, or push remote.
- Do not update, close, label, assign, or comment on existing pull requests or issues.
