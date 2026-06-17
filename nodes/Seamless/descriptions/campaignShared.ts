import { type INodeProperties } from 'n8n-workflow';

export const CAMPAIGN_STEP_TYPE_OPTIONS = [
	{ name: 'Auto Email', value: 'auto-email' },
	{ name: 'Call', value: 'call' },
	{ name: 'Custom', value: 'custom' },
	{ name: 'LinkedIn', value: 'linkedIn' },
	{ name: 'LinkedIn Connect Request', value: 'linkedin-connect-request' },
	{ name: 'LinkedIn Message', value: 'linkedin-message' },
	{ name: 'Manual Email', value: 'manual-email' },
];

export const campaignResourceLocatorModes: NonNullable<
	INodeProperties['modes']
> = [
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
	{
		displayName: 'By Identifier',
		name: 'identifier',
		type: 'string',
		placeholder: 'e.g. my-campaign-slug',
	},
];

const campaignStepTemplateDataField: INodeProperties = {
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
};

export const campaignStepOptionalFields: INodeProperties[] = [
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'Description of what this step does',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'number',
		default: 0,
		description:
			'ID of an existing template. Cannot be combined with Template Data.',
	},
	campaignStepTemplateDataField,
];

export const campaignStepUpdateFields: INodeProperties[] = [
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
		description: 'New position/order number for the step',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'number',
		default: 0,
		description:
			'ID of an existing template. Cannot be combined with Template Data.',
	},
	campaignStepTemplateDataField,
];

const campaignStepInlineValues: INodeProperties[] = [
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: 'manual-email',
		required: true,
		options: CAMPAIGN_STEP_TYPE_OPTIONS,
		description:
			'For auto-email and manual-email steps, the campaign must have linked email accounts',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Name/title of the step',
	},
	{
		displayName: 'Due Day',
		name: 'dueDay',
		type: 'number',
		default: 1,
		required: true,
		description:
			'Day number from campaign start to execute this step (e.g. 1 = first day)',
		typeOptions: { minValue: 1 },
	},
	...campaignStepOptionalFields,
];

export const campaignCreateStepsField: INodeProperties = {
	displayName: 'Steps',
	name: 'steps',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true },
	placeholder: 'Add Step',
	default: {},
	description:
		'Campaign steps to create inline (preferred over separate Create Campaign Step calls). Processed sequentially in order.',
	displayOptions: {
		show: { resource: ['campaign'], operation: ['create'] },
	},
	options: [
		{
			displayName: 'Step',
			name: 'step',
			values: campaignStepInlineValues,
		},
	],
};
