import {
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestOptions,
	type ILoadOptionsFunctions,
	type IPollFunctions,
	type JsonObject,
	NodeApiError,
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
 * Normalize `result.structuredContent` to the shape callers expect: rows under
 * `data`, or the lone row itself so single-record operations receive a flat object.
 * Any sibling keys (e.g. `pagination`, `nextToken`) are kept alongside `data`.
 * A paginated page is always a list, even when it holds a single row.
 */
function normalizeStructuredContent(structured: IDataObject): IDataObject {
	const rows = structured.results;
	if (!Array.isArray(rows)) return structured;
	if (rows.length === 1 && structured.pagination === undefined) {
		return rows[0] as IDataObject;
	}

	const rest = { ...structured };
	delete rest.results;

	return { data: rows, ...rest };
}

/**
 * Parse the JSON-RPC response envelope returned by the MCP server.
 * Prefers result.structuredContent, which carries the machine-readable payload.
 * Otherwise extracts result.content[0].text and attempts JSON parsing first, then
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

	const structured = result.structuredContent as IDataObject | undefined;
	if (structured) return normalizeStructuredContent(structured);

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

	// HTTP status errors must propagate as thrown errors (no `ignoreHttpStatusErrors`):
	// n8n's OAuth2 helper only refreshes an expired access token when the request
	// throws with a 401, then retries with the renewed token automatically.
	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: baseUrl,
		body,
		json: true,
		returnFullResponse: true,
		headers: {
			'content-type': 'application/json',
			accept: 'application/json, text/event-stream',
		},
	};

	let rawResponse: IDataObject;
	try {
		rawResponse = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			credentialType,
			requestOptions,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}

	const responseBody = rawResponse.body as IDataObject | string | undefined;
	const response = (typeof responseBody === 'object' && responseBody !== null
		? responseBody
		: rawResponse) as IDataObject;

	return parseMcpResponse(response);
}

/**
 * Whether a charged search page exhausted the caller's credits (SEAM-44181).
 * The next page would be rejected with `insufficientCredits`, so stop paging
 * and keep the rows already paid for. Uncharged pages (free-api-search beta,
 * `creditsConsumed` 0) and an unreadable balance (`null`) never stop paging.
 */
function searchCreditsExhausted(pagination: IDataObject | undefined): boolean {
	if (!pagination) return false;
	const consumed = pagination.creditsConsumed;
	const remaining = pagination.creditsRemaining;
	return (
		typeof consumed === 'number' &&
		consumed > 0 &&
		typeof remaining === 'number' &&
		remaining <= 0
	);
}

/**
 * Auto-paginate any cursor-paged MCP tool (`cursor` in, `pagination.nextCursor` out).
 * `limit` is sent on the first call only: the cursor carries the page size and
 * the server rejects a different `limit` alongside it. The same filters are
 * resent on every call, as a cursor is bound to them. A missing or null
 * `nextCursor` ends paging; so does an empty page, a spent credit balance
 * (charged search pages), or reaching `maxResults`.
 */
async function seamlessMcpCallAll(
	this: IExecuteFunctions | IPollFunctions,
	toolName: string,
	args: IDataObject,
	options: { batchSize: number; maxResults?: number },
): Promise<IDataObject[]> {
	const { batchSize, maxResults } = options;
	const allItems: IDataObject[] = [];
	let cursor: string | undefined;
	let hasMore = true;

	while (hasMore) {
		const pageArgs: IDataObject = cursor
			? { ...args, cursor }
			: {
					...args,
					limit: maxResults ? Math.min(maxResults, batchSize) : batchSize,
				};

		const response = await seamlessMcpCall.call(this, toolName, pageArgs);
		const items = (response.data || []) as IDataObject[];
		allItems.push(...items);

		const pagination = response.pagination as IDataObject | undefined;
		const nextCursor = pagination?.nextCursor;
		cursor = typeof nextCursor === 'string' && nextCursor ? nextCursor : undefined;
		hasMore =
			!!cursor &&
			items.length > 0 &&
			(!maxResults || allItems.length < maxResults) &&
			!searchCreditsExhausted(pagination);
	}

	return maxResults ? allItems.slice(0, maxResults) : allItems;
}

export { seamlessMcpCall, seamlessMcpCallAll };
