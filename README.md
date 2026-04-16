# n8n-nodes-seamless

Seamless.ai community nodes for [n8n](https://n8n.io).

## Nodes

### Seamless

Full REST API node for managing Seamless.ai resources:

- **Contact** — Search, research, get, and poll contacts
- **Company** — Search, research, get, and poll companies
- **Campaign** — Create, update, clone, manage contacts, and execute actions
- **Campaign Step** — Create, update, delete, and execute campaign steps
- **List** — Create, get, update, and delete lists
- **Saved Search** — Create, get, update, and delete saved searches
- **Template** — Create, get, update, and delete email templates
- **Email** — Create drafts, send, preview, and send bulk emails
- **Task** — Create, get, update, delete, and execute task actions
- **Call** — Log and retrieve calls
- **Activity** — Retrieve engagement activity events
- **Email Account** — Manage email accounts
- **Credits** — Check credit balance
- **Email Footer** — Retrieve email footers

### Seamless Trigger

Polling trigger node that watches for new events:

- **Activity Event** — Triggers on new engagement activity
- **Company Researched** — Triggers when a company research completes
- **Contact Researched** — Triggers when a contact research completes

## Installation

### From npm (recommended)

In your n8n instance, go to **Settings > Community Nodes** and install:

```
n8n-nodes-seamless
```

### Local development

```bash
git clone https://github.com/SeamlessAI/n8n-nodes-seamless.git
cd n8n-nodes-seamless
npm install
npm run dev   # Starts local n8n with the node loaded at localhost:5678
```

## Credentials

Create **Seamless API** credentials in n8n and provide:

| Field | Description |
|-------|-------------|
| **MCP Server URL** | The Seamless MCP endpoint (defaults to `https://mcp.seamless.ai/mcp`) |
| **API Key** | Your Seamless.ai API key (treated as a password field) |

## Usage example

1. Add the **Seamless** node to your workflow.
2. Select a **Resource** (e.g. Contact) and an **Operation** (e.g. Search).
3. Fill in the required fields and any optional filters.
4. Execute the workflow to retrieve data from Seamless.ai.

For trigger-based workflows, add the **Seamless Trigger** node and choose the event type to poll for.

## Publishing

This package is published to npm via a GitHub Actions workflow with provenance, triggered by pushing a tag matching `n8n-v*`:

1. Update `version` in `package.json`
2. Commit: `chore(n8n): release vX.Y.Z`
3. Tag: `git tag n8n-vX.Y.Z`
4. Push: `git push origin n8n-vX.Y.Z`

## License

[MIT](LICENSE)
