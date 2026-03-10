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
				name: 'Get Balance',
				value: 'getBalance',
				action: 'Get credit balance',
				description: 'Retrieve the current credit balance and usage',
			},
		],
		default: 'getBalance',
	},
];

const creditsFields: INodeProperties[] = [];

export { creditsOperations, creditsFields };
