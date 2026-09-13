---
name: create-git-commit-message
description: Draft or review an English Conventional Commit message for the erflute repository from staged changes, working-tree changes, or a user-selected diff. Use when the user asks for a commit message or wants an existing message checked. Do not use to stage files, create a commit, or rewrite Git history.
---

# Create Git Commit Message

Produce a commit message that accurately represents one coherent change in the current `erflute` repository. This is a read-only workflow: never stage files, create or amend a commit, change branches, or modify the working tree.

## Workflow

1. Confirm that the current directory belongs to a Git repository and inspect `git status --short --branch`.
2. Resolve the change set to describe:
   - Follow an explicit user selection, such as staged changes, named files, a commit, or a revision range.
   - Otherwise, if any staged changes exist, use only the staged diff. Mention that unstaged and untracked changes were excluded.
   - If nothing is staged, use the current tracked and untracked working-tree changes. Do not imply that untracked files are staged.
   - If there are no applicable changes, report that no commit message can be derived instead of inventing one.
3. Inspect the selected change set with read-only Git commands. Review its name-status summary, diff statistics, and complete meaningful diff. Read relevant untracked files and nearby code only when needed to understand intent. Do not read likely secret files such as `.env` files, credentials, keys, or tokens; identify them only by path and warn the user that their contents were not inspected.
4. Read the commit message rules in `CONTRIBUTING.md`. Treat that document as the sole source of truth for message format and the selected diff as the source of truth for change content. Do not infer conventions from commit history. If the rules are missing or ambiguous, report that a compliant message cannot be determined instead of inventing a convention.
5. Identify the primary outcome and reason for the change. Describe behavior or repository capability rather than listing edited filenames or low-level operations.
6. If the selected changes contain independently committable concerns, recommend splitting them and draft one message per coherent group. Do not stage, unstage, or rearrange files.
7. Draft the message according to `CONTRIBUTING.md`. Derive the required scope from the primary logical area represented by the selected diff. If the user requests a format that conflicts with the documented rules, explain the conflict and recommend a compliant message.
8. When reviewing a user-provided message, compare it with the selected diff, identify only material accuracy or convention problems, and provide an improved exact message when needed.

## Output

- Present the recommended commit message exactly as it should be used in a Markdown code block.
- State briefly whether it was based on staged changes, unstaged working-tree changes, untracked files, or a user-selected revision.
- Call out excluded changes, unread secret-like files, uncertainty that materially affects the wording, or a recommended split.
- Prefer one recommendation. Offer alternatives only when the diff genuinely supports more than one interpretation.
- Do not claim that tests, lint, type checking, or builds passed unless their results were supplied or verified separately.
