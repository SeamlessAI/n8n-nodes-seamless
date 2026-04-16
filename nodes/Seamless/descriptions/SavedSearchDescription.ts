import { type INodeProperties } from 'n8n-workflow';

const savedSearchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['savedSearch'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create saved search',
				description: 'Create a new saved search',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete saved search',
				description: 'Permanently remove a saved search',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get saved search',
				description: 'Retrieve a saved search by ID',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many saved searches',
				description: 'Retrieve a list of saved searches',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update saved search',
				description: 'Update an existing saved search',
			},
		],
		default: 'getMany',
	},
];

const savedSearchFields: INodeProperties[] = [
	{
		displayName: 'Saved Search',
		name: 'savedSearchId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The saved search to operate on',
		displayOptions: {
			show: {
				resource: ['savedSearch'],
				operation: ['get', 'update', 'delete'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchSavedSearches',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 12345',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9]+$',
							errorMessage: 'Must be a numeric ID',
						},
					},
				],
			},
		],
	},
	// ------ Create ------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the saved search',
		displayOptions: {
			show: { resource: ['savedSearch'], operation: ['create'] },
		},
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: 'contacts',
		required: true,
		displayOptions: {
			show: { resource: ['savedSearch'], operation: ['create'] },
		},
		options: [
			{ name: 'Companies', value: 'companies' },
			{ name: 'Contacts', value: 'contacts' },
		],
	},
	{
		displayName: 'Values (JSON)',
		name: 'values',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The filter values for this saved search as a JSON object',
		displayOptions: {
			show: { resource: ['savedSearch'], operation: ['create'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['savedSearch'], operation: ['create'] },
		},
		options: [
			{
				displayName: 'Num Results Approved',
				name: 'numResultsApproved',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
			},
			{
				displayName: 'Sort Column',
				name: 'sortColumn',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description:
					'Comma-separated list IDs to associate with this saved search',
			},
		],
	},
	// ------ Update ------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['savedSearch'], operation: ['update'] },
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Num Results Approved',
				name: 'numResultsApproved',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
			},
			{
				displayName: 'Sort Column',
				name: 'sortColumn',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description:
					'Comma-separated list IDs to associate with this saved search',
			},
			{
				displayName: 'Values (JSON)',
				name: 'values',
				type: 'json',
				default: '{}',
			},
		],
	},
	// ------ Get Many ------
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: '',
		description: 'Filter saved searches by type',
		displayOptions: {
			show: { resource: ['savedSearch'], operation: ['getMany'] },
		},
		options: [
			{ name: 'All', value: '' },
			{ name: 'Companies', value: 'companies' },
			{ name: 'Contacts', value: 'contacts' },
		],
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description:
			'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['savedSearch'],
				operation: ['get', 'getMany'],
			},
		},
	},
];

export { savedSearchOperations, savedSearchFields };
