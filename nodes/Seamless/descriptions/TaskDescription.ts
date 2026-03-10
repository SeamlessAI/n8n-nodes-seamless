import { type INodeProperties } from 'n8n-workflow';

const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['task'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a task',
				description: 'Create a new task',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a task',
				description: 'Permanently remove a task',
			},
			{
				name: 'Execute Action',
				value: 'executeAction',
				action: 'Execute an action on a task',
				description:
					'Change the state of a task (e.g. pause, start, complete)',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a task',
				description: 'Retrieve a task by ID',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many tasks',
				description: 'Retrieve a list of tasks',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a task',
				description: 'Update task properties',
			},
		],
		default: 'getMany',
	},
];

const taskFields: INodeProperties[] = [
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The ID of the task',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['get', 'update', 'delete', 'executeAction'],
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
		description: 'The name of the task',
		displayOptions: { show: { resource: ['task'], operation: ['create'] } },
	},
	{
		displayName: 'Task Type',
		name: 'taskType',
		type: 'string',
		default: '',
		required: true,
		description: 'The type of the task (e.g. call, email)',
		displayOptions: { show: { resource: ['task'], operation: ['create'] } },
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The contact associated with this task',
		displayOptions: { show: { resource: ['task'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['task'], operation: ['create'] } },
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				default: 0,
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
		displayOptions: { show: { resource: ['task'], operation: ['update'] } },
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
			},
		],
	},
	// ------ Execute Action ------
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		default: 'start',
		required: true,
		displayOptions: {
			show: { resource: ['task'], operation: ['executeAction'] },
		},
		options: [
			{ name: 'Cancel', value: 'cancel' },
			{ name: 'Complete', value: 'complete' },
			{ name: 'Delete', value: 'delete' },
			{ name: 'Pause', value: 'pause' },
			{ name: 'Reschedule', value: 'reschedule' },
			{ name: 'Schedule', value: 'schedule' },
			{ name: 'Skip', value: 'skip' },
			{ name: 'Start', value: 'start' },
			{ name: 'Unpause', value: 'unpause' },
		],
	},
	// ------ Get Many ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['task'], operation: ['getMany'] },
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
				resource: ['task'],
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
			show: { resource: ['task'], operation: ['getMany'] },
		},
		options: [
			{
				displayName: 'Campaign Identifier',
				name: 'campaignIdentifier',
				type: 'string',
				default: '',
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
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Task Type',
				name: 'taskType',
				type: 'string',
				default: '',
			},
		],
	},
];

export { taskOperations, taskFields };
