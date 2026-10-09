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

// Modes have no `default`; the lint exemption for that only applies to objects
// written directly under a `modes` key.
const campaignResourceLocator = {
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
		{
			displayName: 'By Identifier',
			name: 'identifier',
			type: 'string',
			placeholder: 'e.g. my-campaign-slug',
		},
	],
} satisfies Required<Pick<INodeProperties, 'modes'>>;

export const campaignResourceLocatorModes = campaignResourceLocator.modes;

const campaignStepAiPromptField: INodeProperties = {
	displayName: 'AI Prompt',
	name: 'aiPrompt',
	type: 'string',
	default: '',
	typeOptions: { rows: 5 },
	description:
		'Plain-text instructions (max 10,000 characters) the AI runs for EACH contact when the step executes, producing unique content per contact instead of a fixed template. Describe the goal, value proposition, tone, call to action and length; do not write the message itself and do not include HTML. Curly-brace merge tags like {first_name}, {company} are resolved before the AI runs, and the AI also receives the contact\'s full profile. For email steps the AI writes both the subject and the body. Cannot be combined with Template ID or Template Data. Each per-contact generation consumes AI credits.',
};

const campaignStepTemplateDataField: INodeProperties = {
	displayName: 'Template Data',
	name: 'templateData',
	type: 'fixedCollection',
	default: {},
	description:
		'Inline static template content. Creates a hidden template for this step; the same copy is sent to every contact with the variables filled in. Cannot be combined with Template ID or AI Prompt.',
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
						'Email subject line. Supports curly-brace template variables like {first_name}, {company}; unknown tags are not rejected and reach the recipient as literal text.',
				},
				{
					displayName: 'Template',
					name: 'template',
					type: 'string',
					default: '',
					typeOptions: { rows: 5 },
					description:
						'Email body HTML content. Supports curly-brace template variables like {first_name}, {company}, {title}; unknown tags are not rejected and reach the recipient as literal text.',
				},
			],
		},
	],
};

export const campaignStepOptionalFields: INodeProperties[] = [
	campaignStepAiPromptField,
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
			'ID of an existing saved template. Cannot be combined with Template Data or AI Prompt.',
	},
	campaignStepTemplateDataField,
];

export const campaignStepUpdateFields: INodeProperties[] = [
	{
		...campaignStepAiPromptField,
		description: `Replaces the step content with an AI prompt. ${campaignStepAiPromptField.description}`,
	},
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
			'ID of an existing saved template. Cannot be combined with Template Data or AI Prompt.',
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
			'For auto-email and manual-email steps, the campaign must have linked email accounts. Auto-email steps must include a Template ID, Template Data, or AI Prompt; other email steps should too.',
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
		'Campaign steps to create inline (preferred over separate Create Campaign Step calls). Processed sequentially in order. Each step takes its content from exactly one of Template ID (saved template), Template Data (static template with merge tags), or AI Prompt (AI writes personalized content per contact when the step runs).',
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
