---
name: public-repo-text
description: Rules for everything written to this public repo - PR titles and bodies, PR comments and reviews, commit messages, branch names and issues. Use before opening or updating a PR, posting a comment or review, or committing, and in every automation run (MCP tool sync, Dependabot review, batch merge).
---

# Public Repo Text

This repo is public (MIT) and reviewed by n8n. The Seamless MCP server source is private. Everything written here is public: PR titles and bodies, comments, reviews, commit messages, branch names, issues and files. Every automation that writes here follows this skill, so edit the rules here rather than in an automation's prompt.

## Never include

- The private Seamless repository's name, or any path or file name from it (`modules/...`, `packages/...`, `*.js` source files).
- Commit SHAs from any private repository. SHAs of this repo's own commits are fine.
- Jira keys or links (`SEAM-…`, `SPR-…`, `TC-…`, `*.atlassian.net`), including in commit subjects and branch names.
- Server internals: function, class, service, handler, constant, feature-flag or environment-variable names (for example `OrgApi.*`, `publicAPI.*`, helper or validator names).
- Internal hostnames, dev or staging URLs, dashboards, internal test-account names.
- People's internal notes, Slack or Jira discussion, customer or contact data, employee emails. Use fake data such as `jane@example.com` and `Example Co` in examples.
- Secrets, tokens or API keys.

MCP tool names, parameter names, descriptions and response fields that `tools/list` exposes are public, so name them freely.

## Describe instead

- What changed in the public MCP contract: tools added, removed or renamed; parameters; descriptions; annotations; response shape.
- What changed in the node: resources, operations, fields, behavior.
- How it was verified: build, lint, harness or n8n runs.
- Upstream changes in plain words ("search now costs 1 credit per 50 results"), never by commit, ticket or file.

Sync PR follow-up comment shape:

```md
## MCP sync YYYY-MM-DD — pushed `<this repo's short SHA>`

### <domain>

- `tool_name`: what changed in the MCP contract. n8n: what changed in the node.

Build OK; lint unchanged.

Upstream snapshot: 2026-11-04T15:03:46Z
```

## Sync baseline

The MCP sync records its progress as a timestamp, never as a private SHA. End the sync PR body and every follow-up comment with one line:

`Upstream snapshot: <UTC ISO-8601 time at which upstream was read>`

To find the baseline, take the newest `Upstream snapshot:` line in the open sync PR (body and comments), or in the most recently merged sync PR if none is open. Resolve it to a commit privately, inside the run, and keep the result out of this repo.

## Check before posting

Write the PR title and body, comment, or commit message to a file and run:

```sh
npm run check:public-text -- <file>
```

CI runs the same check on PR titles, bodies and commit messages. It only catches patterns, so the rules above still apply to what it cannot detect, such as internal names and notes.

## If something leaks

Edit the PR text or comment to remove it. Do not force-push or rewrite history; tell the maintainers which commits still contain it.
