import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SeamlessOAuth2Api implements ICredentialType {
	name = 'seamlessOAuth2Api';
	displayName = 'Seamless OAuth2 API';
	documentationUrl = 'https://docs.seamless.ai/mcp';
	extends = ['oAuth2Api'];

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'hidden',
			default: 'https://mcp.seamless.ai',
		},
		{
			displayName: 'Use Dynamic Client Registration',
			name: 'useDynamicClientRegistration',
			type: 'hidden',
			default: true,
		},
		{
			displayName: 'MCP Server URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mcp.seamless.ai/mcp',
			required: true,
			description:
				'Base URL of the Seamless MCP server (used to derive the REST API endpoint)',
		},
	];
}
