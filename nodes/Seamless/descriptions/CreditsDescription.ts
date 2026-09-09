import { type INodeProperties } from 'n8n-workflow';

const creditsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['credits'] } },
		options: [
			{
				name: 'Get Credits',
				value: 'getCredits',
				action: 'Get credits',
				description: 'Retrieve the current credit balance and usage',
			},
		],
		default: 'getCredits',
	},
];

const creditsFields: INodeProperties[] = [];

export { creditsOperations, creditsFields };
