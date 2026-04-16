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
				action: 'Create campaign step',
				description: 'Add a new step to a campaign',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete campaign step',
				description: 'Remove a step from a campaign',
			},
			{
				name: 'Execute Action',
				value: 'executeAction',
				action: 'Execute action on campaign step',
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
				action: 'Update campaign step',
				description: 'Update properties of a campaign step',
			},
		],
		default: 'getMany',
	},
];

const campaignStepFields: INodeProperties[] = [
	{
		displayName: 'Campaign',
		name: 'campaignId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The parent campaign',
		displayOptions: { show: { resource: ['campaignStep'] } },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchCampaigns', searchable: true },
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
				description:
					'ID of an existing template. Cannot be combined with Template Data.',
			},
			{
				displayName: 'Template Data',
				name: 'templateData',
				type: 'fixedCollection',
				default: {},
				description:
					'Inline template content. Creates a hidden template for this step. Cannot be combined with Template ID.',
				options: [
					{
						displayName: 'Template Data',
						name: 'value',
						values: [
							{
								displayName: 'Subject',
								name: 'subject',
								type: 'string',
								default: '',
								description:
									'Email subject line. Supports template variables like {first_name}, {company}.',
							},
							{
								displayName: 'Template',
								name: 'template',
								type: 'string',
								default: '',
								typeOptions: { rows: 5 },
								description:
									'Email body HTML content. Supports template variables like {first_name}, {company}, {title}.',
							},
						],
					},
				],
			},
		],
	},
	// ------ Update ------
	{
		displayName: 'Due Day',
		name: 'dueDay',
		type: 'number',
		default: 1,
		required: true,
		description: 'The day number when this step is due (starting at 1)',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['update'] },
		},
	},
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
				description:
					'ID of an existing template. Cannot be combined with Template Data.',
			},
			{
				displayName: 'Template Data',
				name: 'templateData',
				type: 'fixedCollection',
				default: {},
				description:
					'Inline template content. Cannot be combined with Template ID.',
				options: [
					{
						displayName: 'Template Data',
						name: 'value',
						values: [
							{
								displayName: 'Subject',
								name: 'subject',
								type: 'string',
								default: '',
								description:
									'Email subject line. Supports template variables.',
							},
							{
								displayName: 'Template',
								name: 'template',
								type: 'string',
								default: '',
								typeOptions: { rows: 5 },
								description:
									'Email body HTML content. Supports template variables.',
							},
						],
					},
				],
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
