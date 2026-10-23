import { type INodeProperties } from 'n8n-workflow';

import {
	CAMPAIGN_STEP_TYPE_OPTIONS,
	campaignResourceLocatorModes,
	campaignStepOptionalFields,
	campaignStepUpdateFields,
} from './campaignShared';

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
				description:
					'Add a new step to an existing campaign. For email steps, provide exactly one of Template ID, Template Data (static content with merge tags), or AI Prompt (plain instructions with no merge tags; the AI writes personalized content per contact when the step runs); automatic email steps are rejected without one.',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete campaign step',
				description:
					'Remove a draft step from a campaign. Remaining steps are renumbered; returns the deleted step and the remaining steps.',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many campaign steps',
				description: 'Retrieve all steps in a campaign',
			},
			{
				name: 'Pause',
				value: 'pause',
				action: 'Pause campaign step',
				description:
					'Pause an in-progress step of a campaign. Its tasks stop running until the step is resumed with Resume. The campaign must not be completed, archived, or deleted. Returns the step ID and new status.',
			},
			{
				name: 'Resume',
				value: 'resume',
				action: 'Resume campaign step',
				description:
					'Resume a paused campaign step so its tasks run again, including any email sends. The campaign must not be completed, archived, or deleted. Returns the step ID and new status.',
			},
			{
				name: 'Skip',
				value: 'skip',
				action: 'Skip campaign step',
				description:
					'Skip an in-progress or paused campaign step, so its remaining tasks are skipped for every contact. The campaign must not be completed, archived, or deleted. Returns the step ID and new status.',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update campaign step',
				description:
					'Update a campaign step\'s name, delay, content, or position. Content can be switched to a saved template (Template ID), static inline content (Template Data), or an AI prompt (AI Prompt; plain instructions with no merge tags) — provide exactly one.',
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
		description: 'The parent campaign (by list, numeric ID, or identifier slug)',
		displayOptions: { show: { resource: ['campaignStep'] } },
		modes: campaignResourceLocatorModes,
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
				operation: [
					'update',
					'delete',
					'pause',
					'resume',
					'skip',
					'executeAction',
				],
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
		options: campaignStepOptionalFields,
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
		options: campaignStepUpdateFields,
	},
	// ------ Execute Action (legacy; kept so saved workflows keep running) ------
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		default: 'PAUSE',
		required: true,
		description:
			'Deprecated: the Execute Action operation was replaced by the Pause, Resume, and Skip operations. Each value is routed to the matching operation. Case-insensitive when supplied via an expression.',
		displayOptions: {
			show: { resource: ['campaignStep'], operation: ['executeAction'] },
		},
		options: [
			{
				name: 'Pause',
				value: 'PAUSE',
				action: 'Pause a campaign step',
			},
			{
				name: 'Resume',
				value: 'RESUME',
				action: 'Resume a campaign step',
			},
			{ name: 'Skip', value: 'SKIP', action: 'Skip a campaign step' },
		],
	},
];

export { campaignStepOperations, campaignStepFields };
