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
		default: 50,
		description: 'Max number of results to return',
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
