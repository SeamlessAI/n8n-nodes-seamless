import {
	type ICredentialTestFunctions,
	type ICredentialsDecrypted,
	type IDataObject,
	type IExecuteFunctions,
	type ILoadOptionsFunctions,
	type INodeCredentialTestResult,
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
 * Parse the JSON-RPC response envelope returned by the MCP server.
 * Extracts result.content[0].text and parses it as JSON.
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

	const content = (result.content as IDataObject[] | undefined)?.[0];
	const text = content?.text as string | undefined;
	if (!text) return result;

	try {
		return JSON.parse(text) as IDataObject;
	} catch {
		return { text } as unknown as IDataObject;
	}
}

/**
 * Extract a useful error message from a failed HTTP request to the MCP server.
 */
function extractHttpError(err: unknown): string {
	const e = err as {
		statusCode?: number;
		error?: IDataObject | string;
		message?: string;
		response?: { body?: unknown };
	};
	const status = e.statusCode ? `HTTP ${e.statusCode}` : '';
	let body = '';
	if (typeof e.error === 'object' && e.error !== null) {
		body = JSON.stringify(e.error);
	} else if (typeof e.error === 'string') {
		body = e.error;
	} else if (e.response?.body) {
		body = typeof e.response.body === 'string'
			? e.response.body
			: JSON.stringify(e.response.body);
	}
	if (status && body) return `${status}: ${body}`;
	if (body) return body;
	if (status) return status;
	return (e.message as string) || 'MCP request failed';
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

	let rawResponse: IDataObject;
	if (credentialType === 'seamlessOAuth2Api') {
		rawResponse = (await this.helpers.requestWithAuthentication.call(
			this,
			'seamlessOAuth2Api',
			{
				method: 'POST',
				uri: baseUrl,
				body,
				json: true,
				simple: false,
				resolveWithFullResponse: true,
				headers: {
					'content-type': 'application/json',
					accept: 'application/json, text/event-stream',
				},
			},
		)) as IDataObject;
	} else {
		rawResponse = (await this.helpers.request({
			method: 'POST',
			uri: baseUrl,
			body,
			json: true,
			simple: false,
			resolveWithFullResponse: true,
			headers: {
				'content-type': 'application/json',
				accept: 'application/json, text/event-stream',
				Token: String(credentials.apiKey),
			},
		})) as IDataObject;
	}

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

/**
 * Credential test -- validates the API key via MCP tools/list.
 * Uses legacy this.helpers.request (ICredentialTestFunctions only exposes request, not httpRequest).
 */
async function testSeamlessApiCredential(
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted,
): Promise<INodeCredentialTestResult> {
	const creds = credential.data as IDataObject;
	const baseUrl = String(creds.baseUrl || 'https://mcp.seamless.ai/mcp');
	const apiKey = String(creds.apiKey || '');

	try {
		const response = await this.helpers.request({
			method: 'POST',
			uri: baseUrl,
			body: { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
			json: true,
			headers: {
				'content-type': 'application/json',
				accept: 'application/json, text/event-stream',
				Token: apiKey,
			},
		});

		if (response?.error) {
			return {
				status: 'Error',
				message:
					response.error.message || 'MCP server returned an issue',
			};
		}

		return { status: 'OK', message: 'Connection successful' };
	} catch (err) {
		return {
			status: 'Error',
			message:
				(err as { message?: string }).message || 'Connection failed',
		};
	}
}

export {
	seamlessMcpCall,
	seamlessMcpCallAllPages,
	seamlessMcpCallAllOffsets,
	seamlessMcpSearchAll,
	testSeamlessApiCredential,
};
