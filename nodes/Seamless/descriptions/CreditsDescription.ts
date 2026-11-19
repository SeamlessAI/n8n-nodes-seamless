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
				description: 'Retrieve remaining credits by credit category, each with when it next refreshes (null if it does not). Balances can be fractional, up to 3 decimal places.',
			},
		],
		default: 'getCredits',
	},
];

const creditsFields: INodeProperties[] = [];

export { creditsOperations, creditsFields };
