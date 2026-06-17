import {
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestOptions,
	type ILoadOptionsFunctions,
	type IPollFunctions,
} from 'n8n-workflow';

/**
 * Determine which credential type is active based on the `authentication` parameter.
 */
function getCredentialType(
	ctx: IExecuteFunctions | IPollFunctions | ILoadOptionsFunctions,
): string {
	try {
		const auth = ctx.getNodeParameter('authentication', 0) as string;
		return auth === 'oAuth2' ? 'seamlessOAuth2Api' : 'seamlessApi';
	} catch {
		return 'seamlessApi';
	}
}

/**
 * Build the JSON-RPC `tools/call` request body for a given MCP tool.
 */
function buildMcpBody(toolName: string, args?: IDataObject): IDataObject {
	return {
		jsonrpc: '2.0',
		id: 1,
		method: 'tools/call',
		params: { name: toolName, arguments: args || {} },
	};
}

/**
 * Coerce a single markdown-table cell value to a native JS type.
 * Strips surrounding quotes, parses JSON objects/arrays, and converts booleans.
 */
function cleanCellValue(raw: string): unknown {
	let val = raw.trim();
	if (!val) return null;

	if (val.length >= 2 && val.startsWith('"') && val.endsWith('"')) {
		val = val.slice(1, -1);
	}

	if (
		(val.startsWith('{') && val.endsWith('}')) ||
		(val.startsWith('[') && val.endsWith(']'))
	) {
		try {
			return JSON.parse(val);
		} catch {
			/* keep as string */
		}
	}

	if (val === 'true') return true;
	if (val === 'false') return false;
	if (val === 'null') return null;

	return val;
}

/**
 * Parse a markdown table (pipe-delimited with `--- | ---` separator) into an
 * array of objects keyed by the header row. Returns null when the text does not
 * look like a markdown table.
 */
function parseMarkdownTable(text: string): IDataObject[] | null {
	const lines = text.split('\n');

	const sepIdx = lines.findIndex((l) =>
		/^-{2,}(\s*\|\s*-{2,})+\s*$/.test(l.trim()),
	);
	if (sepIdx < 1) return null;

	let headerIdx = sepIdx - 1;
	while (headerIdx >= 0 && !lines[headerIdx].trim()) headerIdx--;
	if (headerIdx < 0) return null;

	const headers = lines[headerIdx].split(' | ').map((h) => h.trim());
	if (headers.length < 2) return null;

	const rows: IDataObject[] = [];
	for (let r = sepIdx + 1; r < lines.length; r++) {
		let line = lines[r].trim();
		if (!line) continue;

		if (line.endsWith('|')) line += ' ';

		const cells = line.split(' | ');
		const record: IDataObject = {};
		for (let c = 0; c < headers.length; c++) {
			const raw =
				c < headers.length - 1
					? (cells[c] ?? '')
					: cells.slice(c).join(' | ');
			record[headers[c]] = cleanCellValue(raw) as IDataObject[keyof IDataObject];
		}
		rows.push(record);
	}

	return rows.length > 0 ? rows : null;
}

/**
 * Parse the JSON-RPC response envelope returned by the MCP server.
 * Extracts result.content[0].text and attempts JSON parsing first, then
 * falls back to markdown-table parsing so callers always receive structured data.
 */
function parseMcpResponse(response: IDataObject): IDataObject {
	if (response.error) {
		const err = response.error as IDataObject;
		const code = err.code !== undefined ? ` (code ${err.code})` : '';
		const data = err.data ? ` — ${JSON.stringify(err.data)}` : '';
		throw new Error(String(err.message || 'MCP request failed') + code + data);
	}

	const result = response.result as IDataObject | undefined;
	if (!result) return response;

	if (result.isError) {
		const content = (result.content as IDataObject[] | undefined)?.[0];
		const msg = (content?.text as string) || 'MCP tool returned an error';
		throw new Error(msg);
	}

	const content = (result.content as IDataObject[] | undefined)?.[0];
	const text = content?.text as string | undefined;
	if (!text) return result;

	try {
		return JSON.parse(text) as IDataObject;
	} catch {
		const rows = parseMarkdownTable(text);
		if (rows) {
			return (rows.length === 1 ? rows[0] : { data: rows }) as IDataObject;
		}
		return { text } as unknown as IDataObject;
	}
}

/**
 * Call an MCP tool via JSON-RPC `tools/call`.
 * Sends a single POST to the MCP endpoint and parses the JSON-RPC response envelope.
 * Supports both API Key and OAuth2 credentials.
 */
async function seamlessMcpCall(
	this: IExecuteFunctions | IPollFunctions | ILoadOptionsFunctions,
	toolName: string,
	args?: IDataObject,
): Promise<IDataObject> {
	const credentialType = getCredentialType(this);
	const credentials = await this.getCredentials(credentialType);
	const baseUrl = String(credentials.baseUrl || 'https://mcp.seamless.ai/mcp');
	const body = buildMcpBody(toolName, args);

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: baseUrl,
		body,
		json: true,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
		headers: {
			'content-type': 'application/json',
			accept: 'application/json, text/event-stream',
		},
	};

	const rawResponse = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		credentialType,
		requestOptions,
	)) as IDataObject;

	const statusCode = rawResponse.statusCode as number | undefined;
	const responseBody = rawResponse.body as IDataObject | string | undefined;

	if (statusCode && statusCode >= 400) {
		const detail = typeof responseBody === 'string'
			? responseBody
			: JSON.stringify(responseBody);
		throw new Error(`MCP HTTP ${statusCode}: ${detail}`);
	}

	const response = (typeof responseBody === 'object' && responseBody !== null
		? responseBody
		: rawResponse) as IDataObject;

	return parseMcpResponse(response);
}

/**
 * Auto-paginate through page-based MCP tools (page + limit).
 */
async function seamlessMcpCallAllPages(
	this: IExecuteFunctions | IPollFunctions,
	toolName: string,
	args?: IDataObject,
	dataKey?: string,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let page = 1;
	const limit = 100;
	let hasMore = true;

	while (hasMore) {
		const response = await seamlessMcpCall.call(
			this,
			toolName,
			{ ...args, page, limit },
		);
		const items = (dataKey ? response[dataKey] : response.data) as
			| IDataObject[]
			| undefined;

		if (Array.isArray(items) && items.length > 0) {
			allItems.push(...items);
			page++;
			hasMore = items.length === limit;
		} else {
			hasMore = false;
		}
	}

	return allItems;
}

/**
 * Auto-paginate through offset-based MCP tools (offset + limit).
 */
async function seamlessMcpCallAllOffsets(
	this: IExecuteFunctions | IPollFunctions,
	toolName: string,
	args: IDataObject,
	batchSize: number,
	dataKey?: string,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let offset = 0;
	let hasMore = true;

	while (hasMore) {
		const response = await seamlessMcpCall.call(
			this,
			toolName,
			{ ...args, limit: batchSize, offset },
		);
		const items = (dataKey ? response[dataKey] : (response.data || response)) as
			| IDataObject[]
			| undefined;

		if (Array.isArray(items) && items.length > 0) {
			allItems.push(...items);
			offset += items.length;
			hasMore = items.length === batchSize;
		} else {
			hasMore = false;
		}
	}

	return allItems;
}

/**
 * Auto-paginate through cursor-based MCP search tools (nextToken + limit).
 */
async function seamlessMcpSearchAll(
	this: IExecuteFunctions,
	toolName: string,
	body: IDataObject,
	maxResults?: number,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let nextToken: string | undefined;
	let hasMore = true;

	while (hasMore) {
		const perPage = maxResults
			? Math.min(maxResults - allItems.length, 100)
			: 100;
		const args: IDataObject = { ...body, limit: perPage };
		if (nextToken) {
			args.nextToken = nextToken;
		}

		const response = await seamlessMcpCall.call(this, toolName, args);
		const items = (response.data || []) as IDataObject[];
		allItems.push(...items);

		nextToken = response.nextToken as string | undefined;
		hasMore = !!nextToken && (!maxResults || allItems.length < maxResults);
	}

	return allItems;
}

export {
	seamlessMcpCall,
	seamlessMcpCallAllPages,
	seamlessMcpCallAllOffsets,
	seamlessMcpSearchAll,
};
