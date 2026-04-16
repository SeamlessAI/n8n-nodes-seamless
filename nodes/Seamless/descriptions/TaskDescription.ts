import { type INodeProperties } from 'n8n-workflow';

const TASK_STATUS_OPTIONS = [
	{ name: 'Scheduled', value: 'scheduled' },
	{ name: 'In Progress', value: 'in-progress' },
	{ name: 'Completed', value: 'completed' },
	{ name: 'Paused', value: 'paused' },
	{ name: 'Errored', value: 'errored' },
	{ name: 'Cancelled', value: 'cancelled' },
	{ name: 'Skipped', value: 'skipped' },
];

const LIST_TASK_TYPE_OPTIONS = [
	{ name: 'Manual Email', value: 'manual-email' },
	{ name: 'Auto Email', value: 'auto-email' },
	{ name: 'Call', value: 'call' },
	{ name: 'LinkedIn', value: 'linkedIn' },
	{ name: 'LinkedIn Message', value: 'linkedin-message' },
	{ name: 'LinkedIn Connect Request', value: 'linkedin-connect-request' },
	{ name: 'Custom', value: 'custom' },
];

const CREATE_TASK_TYPE_OPTIONS = [
	{ name: 'Manual Email', value: 'manual-email' },
	{ name: 'Call', value: 'call' },
	{ name: 'Action Item', value: 'action-item' },
	{ name: 'LinkedIn', value: 'linkedin' },
];

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
				action: 'Create task',
				description: 'Create a new task',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete task',
				description: 'Permanently remove a task',
			},
			{
				name: 'Execute Action',
				value: 'executeAction',
				action: 'Execute action on task',
				description:
					'Change the state of a task (e.g. pause, start, complete)',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get task',
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
				action: 'Update task',
				description: 'Update task properties',
			},
		],
		default: 'getMany',
	},
];

const taskFields: INodeProperties[] = [
	{
		displayName: 'Task',
		name: 'taskId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The task to operate on',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['get', 'update', 'delete', 'executeAction'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchTasks', searchable: true },
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
		description: 'The name of the task',
		displayOptions: { show: { resource: ['task'], operation: ['create'] } },
	},
	{
		displayName: 'Task Type',
		name: 'taskType',
		type: 'options',
		default: 'manual-email',
		required: true,
		description: 'The type of the task',
		options: CREATE_TASK_TYPE_OPTIONS,
		displayOptions: { show: { resource: ['task'], operation: ['create'] } },
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		default: 0,
		required: true,
		description:
			'The saved contact ID to associate with (from get_my_contacts)',
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
				type: 'options',
				default: 0,
				description: 'Priority level',
				options: [
					{ name: 'Normal', value: 0 },
					{ name: 'High', value: 1 },
					{ name: 'Urgent', value: 2 },
				],
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				default: 0,
				description: 'Template ID for email tasks',
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
				type: 'options',
				default: 0,
				options: [
					{ name: 'Normal', value: 0 },
					{ name: 'High', value: 1 },
					{ name: 'Urgent', value: 2 },
				],
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
		default: 25,
		description: 'Max number of results to return (max 50)',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description:
			'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: { resource: ['task'], operation: ['get', 'getMany'] },
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
				description:
					'Filter tasks by campaign identifier (slug, not numeric ID)',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description:
					'Pagination offset (only used when Return All is off)',
			},
			{
				displayName: 'Sort Column',
				name: 'sortColumn',
				type: 'string',
				default: 'createdAt',
				description: 'Column to sort by (default "createdAt")',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				default: 'desc',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [{ name: 'Any', value: '' }, ...TASK_STATUS_OPTIONS],
			},
			{
				displayName: 'Task Type',
				name: 'taskType',
				type: 'options',
				default: '',
				options: [
					{ name: 'Any', value: '' },
					...LIST_TASK_TYPE_OPTIONS,
				],
			},
		],
	},
];

export { taskOperations, taskFields };
