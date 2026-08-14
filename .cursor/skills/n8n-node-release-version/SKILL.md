---
name: n8n-node-release-version
description: Release @seamless-oss/n8n-nodes-seamless using release-it to bump the version, write the changelog, commit, tag, push, and create the GitHub Release, which triggers the npm publish workflow. Use when the user asks to release this n8n node, version bump, publish to npm, create a release tag or GitHub release, or says patch/minor/major bump for n8n-nodes-seamless.
command: /n8n-node-release-version
command-description: Release @seamless-oss/n8n-nodes-seamless from main via release-it (bump, changelog, commit, tag, push, GitHub Release) to trigger the npm publish workflow. Optionally specify a version (e.g. 1.2.3) or bump type (patch, minor, major).
---

# n8n Node Release Version

Release workflow for `@seamless-oss/n8n-nodes-seamless`.

## How releasing works here

`npm run release` is `n8n-node release`, which is **dual-mode**:

- **Locally**: runs `release-it`, which bumps the version, regenerates the changelog, commits, tags, pushes, and creates the GitHub Release. It deliberately does **not** publish to npm.
- **In CI** (detected via `GITHUB_ACTIONS`): skips release-it entirely and runs lint, build, then `npm publish` with `NPM_CONFIG_PROVENANCE=true`.

Pushing the `v*.*.*` tag is what triggers `.github/workflows/publish.yml`, which is where the npm publish happens. npm provenance requires that publish to run in Actions, so never publish from a local machine — a locally published version cannot be a verified n8n community node.

Creating the GitHub Release does **not** trigger the workflow; it emits a `release` event and the workflow only subscribes to `push` tags. The tag push is the single trigger.

A release is complete only when all four are true: the tag is on `origin`, a GitHub Release exists for it, the publish workflow succeeded, and the new version is on npm.

## Do not run `npm run release` locally

It fails on the first step. `@n8n/node-cli` passes `'--git.requireBranch main'` to release-it as one argument with a literal space, and release-it v21 (which switched to node's `parseArgs`) rejects it:

```
ERROR Unknown option '--git.requireBranch main'
```

release-it is not a project dependency, so `npm exec` resolves the latest v21 and the local path exits 1 before doing anything. Two other flags n8n passes (`--git.changelog` and the `hooks.*` flags) also carry literal quote characters that break outside a shell.

So invoke `release-it` directly with correctly quoted flags, as in the command below. This preserves exactly what n8n intends locally. The CI half is unaffected by the bug, because in CI the command never calls release-it — leave `.github/workflows/publish.yml` running `npm run release`.

Still present as of `@n8n/node-cli@0.44.0`, whose `release.js` is byte-identical to 0.43.4's. Re-check on every upgrade by diffing the release-it argv in `node_modules/@n8n/node-cli/dist/commands/release.js`; if the flag becomes two separate array entries, switch back to plain `npm run release`.

## Resolve target version

release-it takes the increment or exact version as a positional argument:

- `patch`, `minor`, `major`, or an exact semver like `1.2.3`
- Default is `patch` if nothing is given

If the user gave neither a version nor a bump type, use AskQuestion: patch (Recommended for fixes), minor, major, Other (custom version).

Do **not** hand-edit `package.json` or `package-lock.json`. release-it owns the bump; editing them first dirties the working tree and trips `--git.requireCleanWorkingDir`.

## Pre-flight

Releases must happen from `main`. Verify before running:

```bash
git rev-parse --abbrev-ref HEAD
git status --porcelain
git fetch origin && git status -sb
git tag -l 'v*' | tail -5
```

Stop and report if any of these fail:

- **Not on `main`** — do not release from a feature branch. The workflow ignores branches, so a feature-branch tag publishes that branch's code to npm as the latest version.
- **Working tree not clean** — commit or stash first.
- **Behind or ahead of `origin/main`** — pull or push so the branch matches its upstream.
- **No commits since the last tag** — there is nothing to release.

Also confirm `GITHUB_TOKEN` is set, since release-it needs it to create the GitHub Release (`github.tokenRef` defaults to `GITHUB_TOKEN`):

```bash
[ -n "$GITHUB_TOKEN" ] && echo "token present" || echo "MISSING"
```

If it is missing, stop and tell the user to export a token with `repo` scope. Do not fall back to a manual tag push, which would publish to npm with no GitHub Release.

npm credentials are **not** needed locally — `--npm.publish=false` skips npm's auth check.

## Release

```bash
npm exec -- release-it <patch|minor|major|version> \
  --git.requireBranch=main \
  --git.requireCleanWorkingDir \
  --git.requireUpstream \
  --git.requireCommits \
  --git.commit \
  --git.tag \
  --git.push \
  --git.tagName='v${version}' \
  --github.release \
  --npm.publish=false \
  --git.changelog="npx auto-changelog --stdout --unreleased --commit-limit false -u --hide-credit" \
  --hooks.before:init="npm run lint && npm run build" \
  --hooks.after:bump="npx auto-changelog -p"
```

Notes:

- Keep `--git.tagName='v${version}'` in **single** quotes so the shell does not expand `${version}`. Without this flag release-it infers the prefix from the latest tag, which silently produces an unprefixed tag (and no workflow trigger) if the tag history is ever rewritten.
- `--npm.publish=false` is what keeps provenance intact by leaving the publish to Actions.
- `--hooks.before:init` runs lint and build, so a broken build aborts the release before anything is committed.
- `--hooks.after:bump` writes `CHANGELOG.md`, which is included in the release commit.
- Add `--dry-run` first if the user wants to preview. It prints the git, GitHub, and npm commands without running them, though `hooks.before:init` still executes, so lint and build really do run.
- To confirm the flag set parses without releasing, use `--release-version`, which prints the next version and exits. Note this also runs the lint/build hook.
- release-it prompts for confirmation at each step. `-n` is a no-op in v21, so do not pass it expecting non-interactive behavior; pass `--ci` if prompts must be skipped.

If release-it fails partway, it rolls back the local commit and tag it created. Re-run rather than finishing the steps by hand.

## Verify

```bash
git ls-remote --tags origin "refs/tags/v<version>"
gh release view v<version> --json tagName,isLatest,url
gh run list --workflow=publish.yml --limit 3
npm view @seamless-oss/n8n-nodes-seamless version
```

- Empty `ls-remote` output means the tag never reached `origin` and nothing published. Push it with `git push origin refs/tags/v<version>`.
- If the tag is on `origin` but there is no GitHub Release, create it from the existing tag with `gh release create v<version> --title "v<version>" --generate-notes --verify-tag --latest`. `--verify-tag` prevents `gh` from creating a divergent tag.
- If `gh` is unavailable or unauthenticated, say so rather than treating the remote tag as proof the publish succeeded.
- The npm version lags the tag by a minute or two while the workflow runs.

## Git safety

- Never update git config
- Never skip hooks unless the user explicitly requests it
- Never force-push, and never delete or move a published tag or release without explicit approval

Report back: new version, commit SHA, tag name, confirmation the tag is on `origin`, the GitHub Release URL, the publish workflow result, and the version live on npm.
