---
name: test-n8n-locally
description: Build, link, and test @seamless-oss/n8n-nodes-seamless against a local n8n instance — lint/build, start n8n with hot reload, derive test cases from the git diff, execute them headlessly with `n8n execute` (or in the browser for the trigger node and UI checks), and report a results table. Use when the user asks to test the n8n node locally, verify an operation end to end, run the node in n8n, or says /test-n8n-locally.
command: /test-n8n-locally
command-description: Build and test the Seamless n8n node against a local n8n. With no arguments runs the diff-derived/default test sequence; pass instructions to test specific resources/operations instead.
---

# Test n8n Node Locally

## Invocation

- `/test-n8n-locally` with no arguments: build, start n8n, run the default test sequence (see "Determine what to test").
- `/test-n8n-locally <instructions>`: build, start n8n, execute the user's instructions instead of the default sequence.

## Prerequisites

- The project root must contain a `.env` with `N8N_USERNAME` and `N8N_PASSWORD` (only needed for browser login). Read values individually without echoing the file:

```bash
grep '^N8N_USERNAME=' <project-root>/.env | cut -d= -f2-
```

Never print `N8N_PASSWORD`, dump `.env` contents, or let the password appear in tool output or screenshots.

- A Seamless credential (`seamlessApi` or `seamlessOAuth2Api`) must be saved in n8n. If none exists and no API key is available (no `.env` key, no injected secret), do not invent one. Either stop and ask, or — if the goal is to validate the node's request/response handling rather than the live API — offer the mock path in "No Seamless API key available" and label every result as mock-only.

## Steps

### 1. Preflight

```bash
node -v   # must be >= 20; nvm can silently switch versions
command -v n8n >/dev/null 2>&1 || npm install -g n8n
mkdir -p ~/.n8n/nodes
```

If `npm install -g` fails with `EACCES` (global prefix is `/`, common in containers), install into a user prefix instead of using sudo:

```bash
npm config set prefix ~/.npm-global && export PATH=~/.npm-global/bin:$PATH && npm install -g n8n
```

Export that `PATH` in every later shell that runs `n8n`.

Link the node (one-time). Skip if the link already resolves to the project:

```bash
readlink -f ~/.n8n/nodes/node_modules/@seamless-oss/n8n-nodes-seamless
```

If missing or pointing elsewhere:

```bash
cd <project-root> && npm i && npm link
cd ~/.n8n/nodes && npm link @seamless-oss/n8n-nodes-seamless
```

`npm i` may rewrite `package-lock.json` with npm-version noise (`libc` metadata, optional peers). Restore it with `git checkout package-lock.json` unless a dependency change is intended.

### 2. Lint and build once (fail fast)

```bash
cd <project-root>
npm run lint && npm run build
```

If either fails, stop and report before touching n8n. Verify `test -f dist/nodes/Seamless/Seamless.node.js`.

**Lint false positive when the repo's parent is `/`** (e.g. `/workspace`): `@n8n/community-nodes/no-credential-reuse` reports `seamlessApi` / `seamlessOAuth2Api` as "not defined in this package". This is an upstream bug in the plugin's `findPackageJson` (it never checks `package.json` in a top-level directory). Check with `[ "$(dirname "$PWD")" = / ]`; if so, lint from a deeper worktree and treat that result as authoritative:

```bash
git worktree add /tmp/lint-wt HEAD && ln -s "$PWD/node_modules" /tmp/lint-wt/node_modules
(cd /tmp/lint-wt && npm run lint); git worktree remove --force /tmp/lint-wt
```

### 3. Start n8n with hot reload (if not running)

Detect "running" by port, not process name:

```bash
curl -sf http://localhost:5678/healthz >/dev/null && echo running || echo "not running"
```

Decision:

- **Not running** → start both processes below.
- **Running, started by this session** → reuse it; ensure the dev watcher (process B) is running.
- **Running, not started by this session** → it may lack `N8N_DEV_RELOAD`. Ask before restarting; never `pkill` a pre-existing n8n.
- **Port 5678 held by something that is not n8n** (healthz fails but `lsof -iTCP:5678 -sTCP:LISTEN` shows a listener) → start with `N8N_PORT=<other>` and use that port everywhere below.

Run both processes in tmux sessions (`n8n-server`, `n8n-dev-watch`) so they can be inspected and killed by name.

**Process A — n8n server:**

```bash
cd ~/.n8n/nodes
N8N_DEV_RELOAD=true N8N_BLOCK_ENV_ACCESS_IN_NODE=false NODE_FUNCTION_ALLOW_BUILTIN=crypto,child_process \
  N8N_DIAGNOSTICS_ENABLED=false N8N_SECURE_COOKIE=false n8n start > /tmp/n8n.log 2>&1
```

**Process B — watch + rebuild, no embedded n8n:**

```bash
cd <project-root>
npm run dev -- --external-n8n > /tmp/n8n-dev.log 2>&1
```

Readiness:

- n8n: poll `curl -sf http://localhost:5678/healthz` (up to ~60s). Do not grep stdout for "n8n ready on".
- Watcher: wait for `Found 0 errors. Watching for file changes.` in `/tmp/n8n-dev.log` (strip ANSI escapes first; the output is a redrawn TUI box).

Confirm the node loaded: grep `/tmp/n8n.log` for `Loaded all credentials and nodes from @seamless-oss/n8n-nodes-seamless` (expect `credentials: 2, nodes: 2`) and for load errors mentioning `seamless`. Set `N8N_LOG_LEVEL=debug` on process A when debugging load issues.

After a mid-session code change: wait for the rebuild line in `/tmp/n8n-dev.log`, then re-run the affected test. n8n picks up the new `dist` without a restart.

### 4. First-run instance (no owner account)

If `http://localhost:5678` redirects to `/setup`, the instance has no owner. Default: stop and tell the user; do not create an account. Only if the user explicitly asked for an account to be created:

```bash
PW="$(openssl rand -hex 12)Aa1"
printf 'N8N_USERNAME=agent@seamless.local\nN8N_PASSWORD=%s\n' "$PW" > <project-root>/.env && chmod 600 <project-root>/.env
curl -s -o /dev/null -w '%{http_code}\n' -c /tmp/n8n-cookies.txt -H 'content-type: application/json' \
  -X POST http://localhost:5678/rest/owner/setup \
  -d "{\"email\":\"agent@seamless.local\",\"firstName\":\"Cloud\",\"lastName\":\"Agent\",\"password\":\"$PW\"}"
```

`.env` is gitignored. Expect `200`. Confirm `git status --short` does not list `.env`.

### 5. Determine what to test

If the user provided instructions, use those. Otherwise derive cases from `git diff origin/main...HEAD --name-only` (fetch `origin/main` first; the local ref may be stale):

| Changed file | Test |
|---|---|
| `nodes/Seamless/descriptions/<Resource>Description.ts` | The affected operations of that resource |
| `nodes/Seamless/descriptions/searchShared.ts` | Contact Search and Company Search with Locations entries |
| `nodes/Seamless/GenericFunctions.ts`, `Seamless.node.ts`, `toolMapping.ts` | Default sequence plus one operation per touched resource |
| `nodes/Seamless/SeamlessTrigger.node.ts` | Trigger test (browser only, step 7) |
| `credentials/*` | Re-create credentials in the browser, then Credits → Get Balance |

If there are no changes vs `main` (or you are on `main`), fall back to the default sequence: **Credits → Get Balance**, then **Contact → Get Many** (limit 1).

For each case, assert on the MCP `tools/call` arguments the node sent (not just "it ran"): array fields are arrays, `0`-valued optional IDs are dropped, flattened filters are folded (`jobChanges`, `pastCompany`, `newsTypeDates`), `locations` entries keep their commas, pagination uses the expected `offset`/`limit`.

### 6. Execute headless (default for standard cases)

Use `n8n execute` for diff-derived and default cases. Reserve the browser (step 7) for the trigger node, user-directed UI checks, and failure screenshots.

Find the saved credential ID once:

```bash
n8n export:credentials --all --pretty
```

Never pass `--decrypted`; never print the `data` field.

Generate one workflow JSON per case under `/tmp/`. Node type is `@seamless-oss/n8n-nodes-seamless.seamless`; set `authentication: 'apiKey'` explicitly (the default is `oAuth2`); a fixed `id` means re-imports overwrite instead of piling up:

```json
{
  "id": "skilltestcase0001",
  "name": "skill-test-credits-getBalance",
  "active": false,
  "settings": {},
  "nodes": [
    { "id": "m1", "name": "Manual Trigger", "type": "n8n-nodes-base.manualTrigger", "typeVersion": 1, "position": [0, 0], "parameters": {} },
    {
      "id": "s1",
      "name": "Seamless",
      "type": "@seamless-oss/n8n-nodes-seamless.seamless",
      "typeVersion": 1,
      "position": [220, 0],
      "parameters": { "authentication": "apiKey", "resource": "credits", "operation": "getBalance" },
      "credentials": { "seamlessApi": { "id": "<credId>", "name": "<credName>" } }
    }
  ],
  "connections": { "Manual Trigger": { "main": [[{ "node": "Seamless", "type": "main", "index": 0 }]] } }
}
```

Fixed-collection parameters use n8n's nested shape, e.g. Locations: `"additionalFields": { "locations": { "location": [{ "value": "Austin, Texas" }, { "value": "-Dallas, Texas" }] } }`.

Run each case (`--file` is deprecated; import then execute by ID):

```bash
export N8N_RUNNERS_BROKER_PORT=5779   # see gotchas
n8n import:workflow --input=/tmp/<case>.json
n8n execute --id=skilltestcase0001 --rawOutput
```

`n8n execute` gotchas (n8n 2.x):

- It starts a task broker on `5679` and aborts with "Task Broker's port 5679 is already in use" while the server (process A) is running. Set `N8N_RUNNERS_BROKER_PORT` to a free port for the CLI.
- `--rawOutput` is emitted through the logger. Do not set `N8N_LOG_LEVEL=error` (the JSON disappears). Extract the JSON block from stdout: from the first line that is exactly `{` to the last line that is exactly `}`; the broker banner and, on failure, an `Execution error:` line surround it.
- The process exits non-zero when the execution itself errored. That is the expected result for negative cases (e.g. more than 10 Locations); still parse stdout.
- It opens the same `~/.n8n/database.sqlite` as the running server. Run cases **serially**. On `SQLITE_BUSY`, fall back to the browser path for that case instead of retrying in a loop.

Parse the JSON: `data.resultData.error` present → failed, report the message; otherwise passed, report the item count from `data.resultData.runData.Seamless[0].data.main[0]`.

### No Seamless API key available

When no real key exists and the user wants request-shape validation anyway, run a local mock MCP server (JSON-RPC over HTTP POST) and point a credential at it:

- Require the `Token` header (return `401` otherwise) so the credential's auth path is exercised.
- `tools/list` → `{ result: { tools: [{ name }] } }` for every name in `dist/nodes/Seamless/toolMapping.js` (`getAllMcpToolNames()`); this is what the credential test calls.
- `tools/call` → append `{ name, arguments }` to a JSONL log for assertions and return canned `result.content[0].text` JSON (or `structuredContent`) per tool. For offset-paged tools (`list_campaigns`, `list_tasks`) return a full page then a short page so `returnAll` paging is exercised.
- Create the credential through the REST API after logging in (cookie jar from `POST /rest/login` with `emailOrLdapLoginId` + `password`):

```bash
curl -s -b /tmp/n8n-cookies.txt -H 'content-type: application/json' -X POST http://localhost:5678/rest/credentials \
  -d '{"name":"Seamless Mock API","type":"seamlessApi","data":{"baseUrl":"http://localhost:4010/mcp","apiKey":"mock-token"}}'
```

Say clearly in the report that results validate the node's mapping against a mock, not the live API, and name the secret the user can add (e.g. a Seamless API key in Cloud Agents → Secrets) to test live.

### 7. Test in browser (trigger node, user instructions, failures)

1. Navigate to `http://localhost:5678` (or the `N8N_PORT` chosen in step 3).
2. If `/setup` appears, see step 4.
3. Log in with `N8N_USERNAME` / `N8N_PASSWORD` from `.env`. Keep the password out of output and screenshots.
4. Create a new workflow, add a **Seamless** node, select the saved credentials (Seamless API or Seamless OAuth2 API).
5. Execute each browser-path case with **Execute step**; screenshot results.
6. **Trigger test** (when `SeamlessTrigger.node.ts` changed): add a **Seamless Trigger** node, select credentials, click **Listen for test event**, and confirm the webhook registers — or report the exact error. This cannot be exercised headlessly.

### 8. Report

End with a fixed format:

| Resource | Operation | Path | Result | Error | Screenshot |
|---|---|---|---|---|---|
| credits | getBalance | headless | pass (1 item) | — | — |

Plus: n8n version (`n8n --version`), node package version (from `package.json`), the git SHA tested (`git rev-parse --short HEAD`), and whether the credential was live or mock.

### 9. Cleanup

Kill **only the processes this skill started** (tmux sessions `n8n-server`, `n8n-dev-watch`, and the mock server if any). If n8n was already running before the skill ran, leave it up. Never use `pkill -f n8n`.

```bash
tmux kill-session -t n8n-server; tmux kill-session -t n8n-dev-watch; tmux kill-session -t mock-mcp
rm -f /tmp/skill-test-*.json
git worktree prune
```

Imported `skill-test-*` workflows can be left in place; fixed IDs mean the next run overwrites them. Leave `.env` in place so the next run can log in.
