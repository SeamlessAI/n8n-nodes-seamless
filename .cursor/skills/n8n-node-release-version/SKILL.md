---
name: n8n-node-release-version
description: Release @seamless-oss/n8n-nodes-seamless by bumping version, committing, pushing, and tagging to trigger npm publish. Use when the user asks to release this n8n node, version bump, publish to npm, create a release tag, or says patch/minor/major bump for n8n-nodes-seamless.
command: /n8n-node-release-version
command-description: Bump version, commit, push, and tag @seamless-oss/n8n-nodes-seamless to trigger npm publish. Optionally specify a version (e.g. 1.2.3) or bump type (patch, minor, major).
---

# n8n Node Release Version

Release workflow for `@seamless-oss/n8n-nodes-seamless`. Pushing a `v*.*.*` tag triggers `.github/workflows/publish.yml`, which runs `npm run release` to publish to npm.

## Invocation

- `/n8n-node-release-version` — ask bump type (patch / minor / major), then release
- `/n8n-node-release-version 1.2.3` — release exact version
- `/n8n-node-release-version patch` — bump patch from current version
- `/n8n-node-release-version minor` — bump minor, reset patch to 0
- `/n8n-node-release-version major` — bump major, reset minor and patch to 0

## Resolve target version

1. Read current version from `package.json`.
2. If user gave an exact semver (e.g. `1.2.3`), use it.
3. If user gave `patch`, `minor`, or `major`, compute:
   - **patch**: `x.y.(z+1)`
   - **minor**: `x.(y+1).0`
   - **major**: `(x+1).0.0`
4. If no version or bump type given, use AskQuestion:
   - patch (Recommended for fixes)
   - minor
   - major
   - Other (custom version)

Validate: semver format, newer than current version, tag `v<version>` does not already exist.

## Pre-flight

Run in parallel:

```bash
git status
git diff
git log -5 --oneline
git tag -l 'v*' | tail -10
```

Before proceeding:

- Confirm intended changes are present (or only version bump if that is the release model).
- Do not commit secrets (`.env`, credentials files with secrets, etc.).
- Warn if unrelated uncommitted changes will be included.
- Run `npm run lint` and `npm run build` — fix failures before releasing.

## Bump version files

Update **only** the package root version fields:

1. `package.json` → `"version"`
2. `package-lock.json` → top-level `"version"` and `packages[""].version`

Do not change dependency versions elsewhere in the lockfile.

## Commit

Stage release-related files. Commit message format:

```
chore: release v<version>
```

Use a HEREDOC for the commit message. Follow git safety rules:

- Never update git config
- Never skip hooks unless user explicitly requests
- Never force-push to main/master

If the commit includes substantive changes beyond the version bump, the body may summarize the why in 1–2 sentences.

## Push and tag

```bash
git push origin HEAD
git tag v<version>
git push origin v<version>
```

Tag format: `v<semver>` (e.g. `v0.6.1`).

## Verify release triggered

Publish workflow triggers on tags matching `v*.*.*`.

Check workflow status when `gh` is available:

```bash
gh run list --workflow=publish.yml --limit 3
```

Report back: new version, commit SHA, tag name, and whether the publish workflow was triggered.
