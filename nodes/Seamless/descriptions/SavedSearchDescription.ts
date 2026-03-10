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
				action: 'Create a saved search',
				description: 'Create a new saved search',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a saved search',
				description: 'Permanently remove a saved search',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a saved search',
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
				action: 'Update a saved search',
				description: 'Update an existing saved search',
			},
		],
		default: 'getMany',
	},
];

const savedSearchFields: INodeProperties[] = [
	{
		displayName: 'Saved Search ID',
		name: 'savedSearchId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The ID of the saved search',
		displayOptions: {
			show: {
				resource: ['savedSearch'],
				operation: ['get', 'update', 'delete'],
			},
		},
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
			{ name: 'Intent', value: 'intent' },
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
			{ name: 'Intent', value: 'intent' },
		],
	},
];

export { savedSearchOperations, savedSearchFields };
