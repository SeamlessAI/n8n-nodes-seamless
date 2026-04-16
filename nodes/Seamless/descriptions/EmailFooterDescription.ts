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
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 25,
		description: 'Max number of results to return (max 50)',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: {
			show: { resource: ['emailFooter'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		description: 'Page number (default 1)',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: { resource: ['emailFooter'], operation: ['getMany'] },
		},
	},
];

export { emailFooterOperations, emailFooterFields };
