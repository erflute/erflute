---
name: create-github-feature-issue
description: Turn a feature, behavior change, or specification discussed with Codex into a reviewed GitHub issue for the erflute repository. Use when the user explicitly asks to draft, prepare, file, open, or create an issue for adding or changing product behavior. Do not trigger merely because an idea is mentioned, for bug reports, or for implementing the feature.
---

# Create GitHub Feature Issue

Create implementation-ready specification issues for `erflute/erflute`. Never implement the requested behavior as part of this workflow.

## Workflow

1. Use `erflute/erflute` as the target repository for issue searches, previews, and creation. Inspect the local remotes for context, but accept both a direct clone whose `origin` is `erflute/erflute` and a fork whose `origin` points elsewhere. Never redirect the issue to the fork or another repository; if the user intends a different target, stop and clarify that this skill is scoped to `erflute/erflute`.
2. Read `.github/ISSUE_TEMPLATE/task.md` and use its current headings, order, and structure. Treat that file as the only source of truth; do not rely on a copied template or hard-coded section list.
3. Extract the requested product behavior from the current conversation. Separate independent deliverables when each can be implemented and accepted on its own; keep changes together when splitting them would leave incomplete behavior.
4. Inspect relevant code, configuration, documentation, and the current commit using read-only operations. Describe the current state accurately, distinguish confirmed constraints from assumptions, and do not edit files or start implementation.
5. Require enough information to define:
   - the user or maintainer problem and desired outcome;
   - the requested behavior and its observable acceptance criteria;
   - the included and excluded scope when the boundary is not obvious;
   - compatibility, dependency, or migration constraints that materially affect delivery.
   Ask only for unresolved decisions that would materially change the issue. Do not invent product policy, UI behavior, data rules, or implementation details.
6. Search both open and closed issues for the affected area, desired outcome, and distinctive feature terms. If an issue covers the same outcome and scope, show its URL and reasoning and do not create a new issue unless the user explicitly confirms that a separate issue is still required.
7. Confirm that the `task` label exists. If it does not, ask whether to create the issue without it; never create repository labels automatically.
8. Draft each issue in English and present an exact preview containing the repository, title, complete Markdown body, and labels. Structure the body according to the current repository template read in step 2.
9. Ask for explicit approval of the complete preview. A request made before the preview, such as "create an issue," is not approval of unseen content. If any field changes, show the revised preview and obtain approval again. One approval may cover a clearly enumerated batch of unchanged previews.
10. After approval, create issues sequentially through the connected GitHub app. Prefer its issue creation capability over the CLI. Use authenticated `gh issue create` only when the connector is unavailable and preserve the approved title, body, and labels exactly.
11. Return each created issue number and URL. If creation fails partway through a batch, stop immediately, report the successfully created issues and the failure, and search again for duplicates before any retry.

## Issue Content Rules

- Write a concise, outcome-oriented title in imperative form. Do not add prefixes such as `[Feature]` when the `task` label already communicates the issue type.
- Explain the problem, intended users, desired behavior, and scope clearly. State assumptions explicitly.
- Express the requested behavior as observable, independently checkable acceptance criteria. Preserve checklist formatting when the current template provides it, and keep criteria implementation-agnostic unless the user selected a specific technical approach.
- Include affected areas, constraints, dependencies, migration considerations, alternatives, and relevant references in the most appropriate sections of the current template.
- Exclude speculative enhancements that are not necessary for the requested outcome. List explicitly rejected or deferred behavior only when it prevents scope ambiguity.
- Apply `task` by default. Add assignees or a milestone only when the user explicitly requests them.
- Do not include credentials, tokens, private user data, or secrets found during inspection.

## Safety Boundaries

- Do not create, update, close, label, assign, or comment on any GitHub issue before the approval gate.
- Do not silently fall back to a different repository.
- Do not turn unresolved product decisions into unstated assumptions.
- Do not combine unrelated specifications to reduce the number of issues.
- Do not retry a failed create call blindly; first verify whether GitHub created the issue despite the reported failure.
