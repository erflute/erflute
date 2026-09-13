---
name: create-github-bug-issue
description: Turn bugs discovered in a Codex discussion into verified GitHub issues for the erflute repository. Use when the user explicitly asks to draft, prepare, file, open, or create GitHub issues from bugs or unexpected behavior discussed in the current conversation. Do not trigger merely because a bug is discovered, for feature requests, or for implementing a fix.
---

# Create GitHub Bug Issue

Create accurate, reviewable bug reports for `erflute/erflute`. Never modify the application or attempt a fix as part of this workflow.

## Workflow

1. Use `erflute/erflute` as the target repository for issue searches, previews, and creation. Inspect the local remotes for context, but accept both a direct clone whose `origin` is `erflute/erflute` and a fork whose `origin` points elsewhere. Never redirect the issue to the fork or another repository; if the user intends a different target, stop and clarify that this skill is scoped to `erflute/erflute`.
2. Read `.github/ISSUE_TEMPLATE/bug_report.md` and use its current headings, order, and structure. Treat that file as the only source of truth; do not rely on a copied template or hard-coded section list.
3. Extract the bug candidates from the current conversation. Split candidates when they can be fixed and verified independently; keep symptoms together when they share one fix and one acceptance path.
4. Inspect relevant code, configuration, logs already provided by the user, and the current commit using read-only operations. Distinguish confirmed facts from hypotheses. Do not edit files, run destructive commands, expose secrets, or include irrelevant conversation content.
5. Require enough evidence for each candidate to state:
   - a concise user-visible summary;
   - reproducible steps, triggering conditions, or a deterministic code path;
   - expected behavior;
   - actual behavior.
   Ask only for missing information that is necessary to avoid a misleading report. Include environment details only when known; never invent them.
6. Search both open and closed issues for the affected area, distinctive symptoms, and likely title keywords. If an issue describes the same behavior and trigger or cause, show its URL and reasoning and do not create a new issue unless the user explicitly confirms that a separate issue is still required.
7. Confirm that the `bug` label exists. If it does not, ask whether to create the issue without it; never create repository labels automatically.
8. Draft each issue in English and present an exact preview containing the repository, title, complete Markdown body, and labels. Structure the body according to the current repository template read in step 2.
9. Ask for explicit approval of the complete preview. A request made before the preview, such as "create an issue," is not approval of unseen content. If any field changes, show the revised preview and obtain approval again. One approval may cover a clearly enumerated batch of unchanged previews.
10. After approval, create issues sequentially through the connected GitHub app. Prefer its issue creation capability over the CLI. Use authenticated `gh issue create` only when the connector is unavailable and preserve the approved title, body, and labels exactly.
11. Return each created issue number and URL. If creation fails partway through a batch, stop immediately, report the successfully created issues and the failure, and search again for duplicates before any retry.

## Issue Content Rules

- Write a specific, outcome-oriented title without prefixes such as `[Bug]` when the `bug` label already communicates the type.
- Keep reproduction steps minimal and ordered. Describe a triggering condition instead when interactive steps do not apply.
- Separate expected and actual behavior explicitly.
- Include the OS, browser or app, and version or commit only when verified. Use `Not provided` for fields that the current template requires to remain visible but whose values are unknown.
- Include relevant file paths, logs, screenshots, suspected causes, and investigation notes in the most appropriate sections of the current template. Label suspected causes as hypotheses.
- Apply `bug` by default. Add assignees or a milestone only when the user explicitly requests them.
- Do not include credentials, tokens, private user data, or secrets found in logs or configuration.

## Safety Boundaries

- Do not create, update, close, label, assign, or comment on any GitHub issue before the approval gate.
- Do not silently fall back to a different repository.
- Do not combine unrelated bugs to reduce the number of issues.
- Do not retry a failed create call blindly; first verify whether GitHub created the issue despite the reported failure.
