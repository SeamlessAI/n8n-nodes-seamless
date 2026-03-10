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

const emailFooterFields: INodeProperties[] = [];

export { emailFooterOperations, emailFooterFields };
