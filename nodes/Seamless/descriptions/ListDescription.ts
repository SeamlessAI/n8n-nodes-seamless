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
				description: 'Create a new contact list',
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
				operation: ['get', 'update', 'delete'],
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
];

export { listOperations, listFields };
