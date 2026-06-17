import {
	type IAuthenticateGeneric,
	type ICredentialTestRequest,
	type ICredentialType,
	type INodeProperties,
} from 'n8n-workflow';

export class SeamlessApi implements ICredentialType {
	name = 'seamlessApi';
	displayName = 'Seamless API';
	documentationUrl = 'https://docs.seamless.ai';
	properties: INodeProperties[] = [
		{
			displayName: 'MCP Server URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mcp.seamless.ai/mcp',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'API key for authenticating with the Seamless MCP server',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Token: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '={{$credentials.baseUrl}}',
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/list',
				params: {},
			},
			headers: {
				'content-type': 'application/json',
				accept: 'application/json, text/event-stream',
			},
		},
	};
}
