import { type INodeProperties } from 'n8n-workflow';

const emailAccountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['emailAccount'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many email accounts',
				description: 'Retrieve a list of connected email accounts',
			},
		],
		default: 'getMany',
	},
];

const emailAccountFields: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['emailAccount'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 25,
		description: 'Max number of results to return (max 50)',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: {
			show: {
				resource: ['emailAccount'],
				operation: ['getMany'],
				returnAll: [false],
			},
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
			show: {
				resource: ['emailAccount'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		default: '',
		description: 'Filter email accounts by name',
		displayOptions: {
			show: { resource: ['emailAccount'], operation: ['getMany'] },
		},
	},
];

export { emailAccountOperations, emailAccountFields };
