---
name: review-dependency-bump
description: Reviews a Dependabot dependency bump in this repo for breaking changes and posts a verdict comment on the pull request. Use when reviewing a Dependabot PR, checking whether a dependency update is safe to merge, or when an automation asks for a breaking-change review of a bump.
disable-model-invocation: true
---

# Review Dependency Bump

Shared review criteria for Dependabot pull requests in `@seamless-oss/n8n-nodes-seamless`. Both the per-PR review automation and the batch merge automation follow this skill, so edit the criteria here rather than in either automation's prompt.

## Criteria

Only act on pull requests authored by Dependabot. Do not trust the author in the trigger payload — it can show up as a placeholder like test-user. Instead, verify the real author by querying GitHub directly (e.g. `gh pr view <number> --json author`): the login should be "dependabot[bot]" or "app/dependabot" (is_bot: true). Dependabot comments at the top of the PR are corroborating evidence. If the actual PR author is anyone else, stop immediately and do nothing.

For each dependency bumped in this PR: check the changelog/release notes for breaking changes, search the codebase for affected usages, and run `npm run build` and `npm run lint`.

Post a single concise PR comment:

- First line: verdict — "Safe to merge", "Needs changes", or "Do not merge" — with a one-sentence reason.
- Then at most 3-5 bullets covering only findings that affect this repo: breaking changes with the affected file/API, build or lint failures, and required code changes.
- Omit anything that checked out fine — no summaries of what was verified, no changelog recaps, no boilerplate. If everything passes, the verdict line plus a bullet noting build and lint passed is the entire comment.

## Repo notes

Runtime surface is small: the node and credential entry points listed under `n8n` in `package.json`, plus `nodes/Seamless/GenericFunctions.ts` for HTTP behavior. `n8n-workflow` is a peer dependency, so a bump there affects consumers' installs, not just this build — call that out explicitly.
