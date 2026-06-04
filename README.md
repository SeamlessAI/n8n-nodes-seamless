# n8n-nodes-seamless

[Seamless.ai](https://seamless.ai) community nodes for [n8n](https://n8n.io) — search contacts, enrich leads, run campaigns, and automate your sales pipeline.

[![npm version](https://img.shields.io/npm/v/@seamless-oss/n8n-nodes-seamless)](https://www.npmjs.com/package/@seamless-oss/n8n-nodes-seamless)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![n8n community](https://img.shields.io/badge/n8n-community%20node-ff6d5a)](https://docs.n8n.io/integrations/community-nodes/)

## Compatibility

| Requirement | Version |
|---|---|
| n8n | >= 1.71.0 |
| n8n-workflow | >= 1.120.0 |
| Node.js | >= 20 |

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

This node is also usable as an [AI tool](https://docs.n8n.io/advanced-ai/examples/using-tools/) in n8n's AI agent workflows.

### Seamless Trigger

Polling trigger node that watches for new events:

- **Activity Event** — Triggers on new engagement activity
- **Company Researched** — Triggers when a company research completes
- **Contact Researched** — Triggers when a contact research completes

## Installation

### From npm (recommended)

In your n8n instance, go to **Settings > Community Nodes** and install:

```
@seamless-oss/n8n-nodes-seamless
```

### Local development

```bash
git clone https://github.com/SeamlessAI/n8n-nodes-seamless.git
cd n8n-nodes-seamless
npm install
npm run dev   # Starts local n8n with the node loaded at localhost:5678
```

## Credentials

This node supports two authentication methods:

### OAuth2 (recommended)

Select **OAuth2** in the node's authentication dropdown and follow n8n's standard OAuth2 flow to connect your Seamless.ai account.

### API Key

Create **Seamless API** credentials in n8n and provide:

| Field | Description |
|-------|-------------|
| **MCP Server URL** | The Seamless MCP endpoint (defaults to `https://mcp.seamless.ai/mcp`) |
| **API Key** | Your Seamless.ai API key |

You can find your API key in the [Seamless.ai app](https://login.seamless.ai) under **Settings > Integrations > API**.

## Usage example

1. Add the **Seamless** node to your workflow.
2. Select a **Resource** (e.g. Contact) and an **Operation** (e.g. Search).
3. Fill in the required fields and any optional filters.
4. Execute the workflow to retrieve data from Seamless.ai.

For trigger-based workflows, add the **Seamless Trigger** node and choose the event type to poll for.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Run linting: `npm run lint`
4. Commit your changes (`git commit -m 'feat: add my feature'`)
5. Push to the branch (`git push origin feature/my-feature`)
6. Open a Pull Request

## Publishing

This package is published to npm via a GitHub Actions workflow with provenance, triggered by pushing a version tag:

1. Update `version` in `package.json`
2. Commit: `chore: release vX.Y.Z`
3. Tag: `git tag vX.Y.Z`
4. Push: `git push origin vX.Y.Z`

## Support

- [Open an issue](https://github.com/SeamlessAI/n8n-nodes-seamless/issues) for bug reports or feature requests
- [Seamless.ai API docs](https://docs.seamless.ai)
- [n8n community forum](https://community.n8n.io)

## Changelog

See [GitHub Releases](https://github.com/SeamlessAI/n8n-nodes-seamless/releases) for version history.

## License

[MIT](LICENSE)
