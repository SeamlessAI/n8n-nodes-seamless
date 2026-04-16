import { type INodeProperties } from 'n8n-workflow';

const TEMPLATE_TYPE_OPTIONS = [
	{ name: 'Call', value: 'call' },
	{ name: 'Custom', value: 'custom' },
	{ name: 'Email', value: 'email' },
	{ name: 'LinkedIn Connect Request', value: 'linkedin-connect-request' },
	{ name: 'LinkedIn Message', value: 'linkedin-message' },
];

const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['template'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create template',
				description: 'Create a new email template',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete template',
				description: 'Permanently remove an email template',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get template',
				description: 'Retrieve an email template by ID',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many templates',
				description: 'Retrieve a list of email templates',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update template',
				description: 'Update an existing email template',
			},
		],
		default: 'getMany',
	},
];

const templateFields: INodeProperties[] = [
	{
		displayName: 'Template',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The template to operate on',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['get', 'update', 'delete'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchTemplates', searchable: true },
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
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: 'email',
		description: 'The type of the template',
		options: TEMPLATE_TYPE_OPTIONS,
		displayOptions: {
			show: {
				resource: ['template'],
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
		description: 'The name of the template',
		displayOptions: {
			show: { resource: ['template'], operation: ['create'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['template'], operation: ['create'] },
		},
		options: [
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				typeOptions: { rows: 5 },
				description:
					'Email body HTML. Supports template variables like {first_name}, {company}.',
			},
			{
				displayName: 'Content Category',
				name: 'contentCategory',
				type: 'options',
				default: 'static',
				description:
					'Content category: "static" for standard templates, "ai_prompt" for AI-generated',
				options: [
					{ name: 'Static', value: 'static' },
					{ name: 'AI Prompt', value: 'ai_prompt' },
				],
			},
			{
				displayName: 'Email Footer ID',
				name: 'emailFooterId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Email Signature ID',
				name: 'emailSignatureId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description:
					'Email subject. Supports template variables like {first_name}, {company}.',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 'email',
				options: TEMPLATE_TYPE_OPTIONS,
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
			show: { resource: ['template'], operation: ['update'] },
		},
		options: [
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				typeOptions: { rows: 5 },
			},
			{
				displayName: 'Content Category',
				name: 'contentCategory',
				type: 'options',
				default: 'static',
				options: [
					{ name: 'Static', value: 'static' },
					{ name: 'AI Prompt', value: 'ai_prompt' },
				],
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
			},
		],
	},
	// ------ Get Many ------
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		description: 'Page number (default 1)',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: { resource: ['template'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 15,
		description: 'Max number of results to return (max 50)',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: {
			show: { resource: ['template'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		default: '',
		description: 'Filter templates by name',
		displayOptions: {
			show: { resource: ['template'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: '',
		description: 'Filter templates by type',
		options: [{ name: 'All', value: '' }, ...TEMPLATE_TYPE_OPTIONS],
		displayOptions: {
			show: { resource: ['template'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Include Stats',
		name: 'includeStats',
		type: 'boolean',
		default: false,
		description: 'Whether to include engagement statistics in results',
		displayOptions: {
			show: { resource: ['template'], operation: ['getMany'] },
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
			show: {
				resource: ['template'],
				operation: ['get', 'getMany'],
			},
		},
	},
];

export { templateOperations, templateFields };
