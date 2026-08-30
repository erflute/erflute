---
name: review-to-pr
description: Review the current erflute branch with Codex and publish approved findings as one GitHub pull request review. Use only when the user explicitly invokes $review-to-pr. Do not use for ordinary local reviews, creating pull requests, fixing findings, or reviewing another repository.
---

# Review to PR

Review the current branch with the dedicated Codex reviewer for a user-identified pull request in `erflute/erflute`. Preview the exact GitHub review and publish it only after explicit approval.

## Workflow

1. Confirm that the current directory belongs to the `erflute` Git repository and inspect `git status --short --branch`, the current branch, `HEAD`, and configured remotes. Refuse a detached `HEAD`. Never stage, commit, stash, discard, or edit application files as part of this workflow.
2. Require the `codex`, `gh`, and `jq` commands and authenticated GitHub access. Check `gh auth status -h github.com`; if authentication is unavailable, or a network, permission, or API failure prevents verification, report the failure and stop without publishing.
3. Use a pull request URL or number only when the user provided it explicitly in the current request or it appears unambiguously earlier in the current conversation, such as the result of creating a pull request. If neither is available, ask the user for the pull request URL or number and stop. Do not discover or infer a pull request from the current branch, Git remotes, the authenticated GitHub user, or matching commit IDs.
4. Fetch the identified pull request from GitHub. Require it to belong to `erflute/erflute`, be open, and have a head object ID equal to local `HEAD`; otherwise report the mismatch and stop. Resolve its number, URL, base ref and object ID, and head object ID. Do not create a pull request.
5. Use the exact base object ID reported by GitHub. Locate or fetch that commit through an existing remote without adding or changing remotes, pruning, merging, or rebasing. Pass a verified local ref or commit resolving to that object ID to `codex review --base`. Warn that uncommitted changes are outside a branch-against-base review. Do not switch to `--uncommitted` unless the user explicitly changes the requested scope.
6. Run `codex review --base <verified-base>` and preserve its complete review result. Do not replace the dedicated reviewer with an ad hoc review prompt, invent findings, or modify the reviewed code. Each actionable finding used for GitHub must retain its priority, concise title, explanation, repository-relative path, and shortest useful line range.
7. Before preparing a GitHub review, require local `HEAD` to still equal the pull request head object ID captured before the review. If it differs, return the findings locally and do not publish them; explain that the local review does not represent the selected pull request head.
8. Fetch the pull request diff and the existing submitted reviews and review comments with authenticated `gh api` calls. Follow pagination when listing existing content. Never expose authentication data in command output, temporary files, previews, or comments.
9. Classify each finding against the exact pull request diff:
   - Use a `RIGHT`-side inline comment when the repository-relative path and selected new-file line occur in a pull request diff hunk. Prefer one line; use `start_line` and `start_side` only when the entire short finding range is present in the same hunk.
   - Put the finding in the top-level review body when no valid diff line can be established. Do not force an arbitrary nearby line.
   - Format an inline finding as a bold `[P0]` through `[P3]` title followed by its concise explanation. Do not repeat unnecessary path or line details in its visible body.
10. Prevent duplicate comments. Build a stable SHA-256 fingerprint from the target repository, pull request number, pull request head object ID, path, line or fallback location, priority, title, and normalized explanation. Append `<!-- review-to-pr:<fingerprint> -->` to each inline comment or top-level fallback entry. Skip a finding when that marker already exists in an existing review or review comment for the pull request. Never treat ordinary human comments as duplicates merely because their wording is similar.
11. Prepare one `COMMENT` review containing all new inline comments. Its non-empty top-level body must contain a concise `Codex Review` summary, the dedicated reviewer's overall assessment, any diff-unanchored findings, and the markers for those fallback findings. If there are no findings, or every finding is a duplicate, do not create an empty review.
12. Present an exact preview containing:
   - repository, pull request number and URL, base ref, and head object ID;
   - the fixed review event `COMMENT`;
   - every inline comment with path, side, line range, and complete Markdown body;
   - the complete top-level review body;
   - counts of inline comments, top-level findings, and skipped duplicates.
   Ask for explicit approval of this complete preview. The initial `$review-to-pr` request is not approval of unseen GitHub content. If any field or comment changes, show a revised preview and obtain approval again.
13. After approval, verify once more that local `HEAD` and GitHub's current pull request head both equal the captured head object ID. If either changed, discard the prepared payload and stop; a new review run and approval are required.
14. Generate the JSON payload in a temporary directory using structured JSON tooling, not shell-interpolated JSON. Submit the approved comments together in one call to `POST repos/erflute/erflute/pulls/{pull_number}/reviews`, with the verified head object ID as `commit_id` and `COMMENT` as `event`. Remove the temporary payload after the request when practical.
15. Return the created review identifier or URL when available and the final counts of inline comments, top-level findings, and skipped duplicates. If submission fails ambiguously, inspect the pull request's reviews and comments for the approved fingerprints before any retry. Never retry blindly. If GitHub rejects the payload without creating it, report the failure; moving or changing comments requires a revised preview and fresh approval.

## Review Content Rules

- Publish only discrete, actionable defects introduced by the reviewed branch. Omit praise, style-only observations, speculative concerns, and findings the author would not reasonably fix.
- Keep each explanation to one short paragraph and state the triggering scenario or input when severity depends on it.
- Write GitHub review content in English and use a matter-of-fact tone.
- Use suggestion blocks only for exact replacement code and keep them minimal.
- Do not publish an approval or request changes, resolve threads, reply to comments, or alter pull request metadata.

## Safety Boundaries

- GitHub publishing is the only external mutation authorized by this skill, and only after approval of the exact preview.
- Do not create or update pull requests, issues, branches, commits, labels, assignments, review requests, or source files.
- Do not publish when the reviewed local head, approved payload head, and current pull request head are not the same commit.
- Do not split the findings into independent API posts; a single review avoids partial publication and unnecessary notifications.
