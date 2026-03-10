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
				action: 'Create a list',
				description: 'Create a new contact list',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a list',
				description: 'Permanently remove a contact list',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a list',
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
				action: 'Update a list',
				description: 'Rename a contact list',
			},
		],
		default: 'getMany',
	},
];

const listFields: INodeProperties[] = [
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The ID of the list',
		displayOptions: {
			show: {
				resource: ['list'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the list',
		displayOptions: {
			show: { resource: ['list'], operation: ['create', 'update'] },
		},
	},
];

export { listOperations, listFields };
