#!/usr/bin/env node

/**
 * Validates that the n8n node's toolMapping.ts covers every MCP tool
 * exposed by the Seamless MCP server. Exits with code 1 if discrepancies
 * are found, making it suitable as a CI gate.
 *
 * Environment variables:
 *   MCP_BASE_URL  - MCP server URL (required)
 *   MCP_API_KEY   - API key for authentication (required)
 */

const MCP_BASE_URL = process.env.MCP_BASE_URL || 'https://mcp.seamless.ai/mcp';
const MCP_API_KEY = process.env.MCP_API_KEY || '';

async function fetchMcpTools() {
	const response = await fetch(MCP_BASE_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
			Token: MCP_API_KEY,
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			method: 'tools/list',
			params: {},
		}),
	});

	if (!response.ok) {
		throw new Error(`MCP server returned ${response.status}: ${response.statusText}`);
	}

	const data = await response.json();
	if (data.error) {
		throw new Error(`MCP error: ${data.error.message || JSON.stringify(data.error)}`);
	}

	return (data.result?.tools || []).map((t) => t.name);
}

async function loadLocalMapping() {
	const { TOOL_MAP, getAllMcpToolNames } = await import(
		'../tmp-build/nodes/Seamless/toolMapping.js'
	);
	return { TOOL_MAP, localToolNames: getAllMcpToolNames() };
}

async function main() {
	if (!MCP_API_KEY || !MCP_BASE_URL) {
		console.warn('⚠ MCP_API_KEY or MCP_BASE_URL not set — skipping live validation');
		process.exit(0);
	}

	console.log(`Fetching tools from ${MCP_BASE_URL}…`);
	const remoteTools = await fetchMcpTools();
	const remoteSet = new Set(remoteTools);

	console.log(`Found ${remoteTools.length} MCP tools on server`);

	const { localToolNames } = await loadLocalMapping();
	console.log(`Found ${localToolNames.size} unique MCP tool names in toolMapping.ts`);

	const missingInNode = remoteTools.filter((t) => !localToolNames.has(t));
	const extraInNode = [...localToolNames].filter((t) => !remoteSet.has(t));

	let failed = false;

	if (missingInNode.length > 0) {
		console.error('\nMCP tools NOT mapped in n8n node:');
		for (const name of missingInNode) {
			console.error(`  - ${name}`);
		}
		failed = true;
	}

	if (extraInNode.length > 0) {
		console.warn('\ntools in n8n node NOT found on MCP server:');
		for (const name of extraInNode) {
			console.warn(`  - ${name}`);
		}
		failed = true;
	}

	if (failed) {
		console.error('\nValidation FAILED — toolMapping.ts is out of sync with MCP server');
		process.exit(1);
	}

	console.log('\nAll MCP tools are mapped. Validation passed.');
}

main().catch((err) => {
	console.error('Validation script error:', err.message);
	process.exit(1);
});
