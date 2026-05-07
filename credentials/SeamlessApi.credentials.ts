import {
	type IAuthenticateGeneric,
	type ICredentialType,
	type INodeProperties,
} from 'n8n-workflow';

export class SeamlessApi implements ICredentialType {
	name = 'seamlessApi';
	displayName = 'Seamless API';
	documentationUrl = 'https://docs.seamless.ai/mcp';
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
}
