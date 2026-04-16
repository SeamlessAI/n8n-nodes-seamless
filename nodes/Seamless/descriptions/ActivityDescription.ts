import { type INodeProperties } from 'n8n-workflow';

const activityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['activity'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many activities',
				description: 'Retrieve engagement activity events',
			},
		],
		default: 'getMany',
	},
];

const activityFields: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['activity'], operation: ['getMany'] },
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
				resource: ['activity'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: { resource: ['activity'], operation: ['getMany'] },
		},
		options: [
			{
				displayName: 'Campaign Identifier',
				name: 'campaignIdentifier',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				description: 'Pagination offset (default 0)',
				typeOptions: { minValue: 0 },
			},
			{
				displayName: 'Search Text',
				name: 'searchText',
				type: 'string',
				default: '',
			},
		],
	},
];

export { activityOperations, activityFields };
