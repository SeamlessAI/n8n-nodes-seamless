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
		options: CAMPAIGN_STEP_TYPE_OPTIONS,
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
