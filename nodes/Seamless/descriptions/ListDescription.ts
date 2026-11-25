import { type INodeProperties } from 'n8n-workflow';

const listOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['list'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create list',
				description:
					'Create a new contact list. Populate it with the Contact/Company Update operation, or via List IDs on Contact Research.',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete list',
				description: 'Permanently remove a contact list',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get list',
				description: 'Retrieve a single contact list by ID',
			},
			{
				name: 'Get Contacts',
				value: 'getContacts',
				action: 'Get list contacts',
				description:
					'Retrieve the saved contacts that belong to a contact list, with contactId, name, title, and company for each member. Paginated by an opaque cursor; the server reports total and pagination.nextCursor.',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many lists',
				description: 'Retrieve all contact lists',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update list',
				description: 'Rename a contact list',
			},
		],
		default: 'getMany',
	},
];

const listFields: INodeProperties[] = [
	{
		displayName: 'List',
		name: 'listId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The list to operate on',
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['get', 'getContacts', 'update', 'delete'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchLists', searchable: true },
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
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. myContactList',
		description: 'The name of the list',
		displayOptions: {
			show: { resource: ['list'], operation: ['create', 'update'] },
		},
	},
	// ------ Get Contacts ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['list'], operation: ['getContacts'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['getContacts'],
				returnAll: [false],
			},
		},
	},
];

export { listOperations, listFields };
