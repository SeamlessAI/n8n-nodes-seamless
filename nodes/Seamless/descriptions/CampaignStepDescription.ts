import { type INodeProperties } from 'n8n-workflow';

const campaignStepOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['campaignStep'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a campaign step',
				description: 'Add a new step to a campaign',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a campaign step',
				description: 'Remove a step from a campaign',
			},
			{
				name: 'Execute Action',
				value: 'executeAction',
				action: 'Execute an action on a campaign step',
				description: 'Pause, resume, or skip a campaign step',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many campaign steps',
				description: 'Retrieve all steps in a campaign',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a campaign step',
				description: 'Update properties of a campaign step',
			},
		],
		default: 'getMany',
	},
];

const campaignStepFields: INodeProperties[] = [
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The ID of the campaign',
		displayOptions: { show: { resource: ['campaignStep'] } },
	},
	{
		displayName: 'Step ID',
		name: 'stepId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The ID of the campaign step',
		displayOptions: {
			show: {
				resource: ['campaignStep'],
				operation: ['update', 'delete', 'executeAction'],
			},
		},
	},
	// ------ Create ------
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: 'manual-email',
		required: true,
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['create'] },
		},
		options: [
			{ name: 'Auto Email', value: 'auto-email' },
			{ name: 'Call', value: 'call' },
			{ name: 'Custom', value: 'custom' },
			{ name: 'LinkedIn', value: 'linkedIn' },
			{
				name: 'LinkedIn Connect Request',
				value: 'linkedin-connect-request',
			},
			{ name: 'LinkedIn Message', value: 'linkedin-message' },
			{ name: 'Manual Email', value: 'manual-email' },
		],
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the step',
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['create'] },
		},
	},
	{
		displayName: 'Due Day',
		name: 'dueDay',
		type: 'number',
		default: 1,
		required: true,
		description: 'The day number when this step is due (starting at 1)',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['create'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['create'] },
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
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
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['update'] },
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Due Day',
				name: 'dueDay',
				type: 'number',
				default: 1,
				typeOptions: { minValue: 1 },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Step Number',
				name: 'stepNumber',
				type: 'number',
				default: 0,
				description: 'The order position of the step',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				default: 0,
			},
		],
	},
	// ------ Execute Action ------
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		default: 'PAUSE',
		required: true,
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['executeAction'] },
		},
		options: [
			{ name: 'Pause', value: 'PAUSE' },
			{ name: 'Resume', value: 'RESUME' },
			{ name: 'Skip', value: 'SKIP' },
		],
	},
];

export { campaignStepOperations, campaignStepFields };
