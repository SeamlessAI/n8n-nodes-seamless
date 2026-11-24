import { type INodeProperties } from 'n8n-workflow';

const emailFooterOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['emailFooter'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many email footers',
				description: 'Retrieve a list of email footers',
			},
		],
		default: 'getMany',
	},
];

const emailFooterFields: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['emailFooter'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: {
			show: {
				resource: ['emailFooter'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
	},
];

export { emailFooterOperations, emailFooterFields };
