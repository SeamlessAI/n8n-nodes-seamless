import {
	type ICredentialTestFunctions,
	type ICredentialsDecrypted,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestMethods,
	type IHttpRequestOptions,
	type ILoadOptionsFunctions,
	type INodeCredentialTestResult,
	type IPollFunctions,
} from 'n8n-workflow';

/**
 * Make an authenticated request to the Seamless REST v2 API.
 * Derives the REST base URL from the MCP credential URL by stripping `/mcp`.
 */
async function seamlessApiRequest(
	this: IExecuteFunctions | IPollFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject
): Promise<IDataObject> {
	const credentials = await this.getCredentials('seamlessApi');
	const baseUrl = String(
		credentials.baseUrl || 'https://mcp.seamless.ai/mcp'
	);
	const apiBase = baseUrl.replace(/\/mcp$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${apiBase}/api/client/v2${endpoint}`,
		headers: { Token: String(credentials.apiKey) },
		qs,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	return (await this.helpers.httpRequest(options)) as IDataObject;
}

/**
 * Auto-paginate through page-based endpoints (GET list endpoints).
 */
async function seamlessApiRequestAllItems(
	this: IExecuteFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
	dataKey?: string
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let page = 1;
	const limit = 100;
	let hasMore = true;

	while (hasMore) {
		const queryParams = { ...qs, page, limit };
		const response = await seamlessApiRequest.call(
			this,
			method,
			endpoint,
			body,
			queryParams
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
 * Auto-paginate through cursor-based search endpoints (POST /search/*).
 */
async function seamlessApiSearchAllItems(
	this: IExecuteFunctions,
	endpoint: string,
	body: IDataObject,
	maxResults?: number
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let nextToken: string | undefined;
	let hasMore = true;

	while (hasMore) {
		const perPage = maxResults
			? Math.min(maxResults - allItems.length, 100)
			: 100;
		const reqBody: IDataObject = { ...body, limit: perPage };
		if (nextToken) {
			reqBody.nextToken = nextToken;
		}

		const response = await seamlessApiRequest.call(
			this,
			'POST',
			endpoint,
			reqBody
		);
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
	credential: ICredentialsDecrypted
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
				accept: 'application/json',
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
	seamlessApiRequest,
	seamlessApiRequestAllItems,
	seamlessApiSearchAllItems,
	testSeamlessApiCredential,
};
