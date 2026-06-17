import { type INodeProperties } from 'n8n-workflow';

import {
	campaignCreateStepsField,
	campaignResourceLocatorModes,
} from './campaignShared';

const campaignOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['campaign'] } },
		options: [
			{
				name: 'Add Contacts',
				value: 'addContacts',
				action: 'Add contacts to campaign',
				description: 'Add contacts to a campaign by ID (max 500)',
			},
			{
				name: 'Clone',
				value: 'clone',
				action: 'Clone campaign',
				description: 'Create a copy of an existing campaign',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create campaign',
				description: 'Create a new campaign',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete campaign',
				description: 'Permanently delete a campaign',
			},
			{
				name: 'Execute Action',
				value: 'executeAction',
				action: 'Execute action on campaign',
				description:
					'Start, pause, resume, complete, archive, unarchive, or delete a campaign',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get campaign',
				description: 'Retrieve a campaign by ID',
			},
			{
				name: 'Get Contacts',
				value: 'getContacts',
				action: 'Get campaign contacts',
				description: 'Retrieve contacts in a campaign',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many campaigns',
				description: 'Retrieve a list of campaigns',
			},
			{
				name: 'Get Metrics',
				value: 'getMetrics',
				action: 'Get campaign metrics',
				description: 'Retrieve performance metrics for a campaign',
			},
			{
				name: 'Remove Contacts',
				value: 'removeContacts',
				action: 'Remove contacts from campaign',
				description: 'Remove contacts from a campaign by ID (max 500)',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update campaign',
				description: 'Update campaign properties',
			},
		],
		default: 'getMany',
	},
];

const campaignFields: INodeProperties[] = [
	{
		displayName: 'Campaign',
		name: 'campaignId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The campaign to operate on (by list, numeric ID, or identifier slug)',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: [
					'get',
					'update',
					'delete',
					'executeAction',
					'clone',
					'addContacts',
					'removeContacts',
					'getContacts',
					'getMetrics',
				],
			},
		},
		modes: campaignResourceLocatorModes,
	},
	// ------ Create ------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the campaign',
		displayOptions: {
			show: { resource: ['campaign'], operation: ['create', 'clone'] },
		},
	},
	campaignCreateStepsField,
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['campaign'], operation: ['create'] },
		},
		options: [
			{
				displayName: 'Contact IDs',
				name: 'contactIds',
				type: 'string',
				default: '',
				description:
					'Comma-separated saved contact IDs (from Get My Contacts) to add inline. Max 500. Preferred over a separate Add Contacts call when building a new campaign.',
			},
			{
				displayName: 'Email Account IDs',
				name: 'emailAccountIds',
				type: 'string',
				default: '',
				description:
					'Comma-separated email account IDs to link as sending addresses. Required before adding auto-email or manual-email steps.',
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
			show: { resource: ['campaign'], operation: ['update'] },
		},
		options: [
			{
				displayName: 'Email Account IDs',
				name: 'emailAccountIds',
				type: 'string',
				default: '',
				description: 'Comma-separated email account IDs to link',
			},
			{
				displayName: 'Is Public',
				name: 'isPublic',
				type: 'boolean',
				default: false,
				description:
					'Whether the campaign is visible to the entire organization',
			},
			{
				displayName: 'Name',
				name: 'name',
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
		default: 'START',
		required: true,
		displayOptions: {
			show: { resource: ['campaign'], operation: ['executeAction'] },
		},
		options: [
			{ name: 'Archive', value: 'ARCHIVE' },
			{ name: 'Complete', value: 'COMPLETE' },
			{ name: 'Delete', value: 'DELETE' },
			{ name: 'Pause', value: 'PAUSE' },
			{ name: 'Resume', value: 'RESUME' },
			{ name: 'Start', value: 'START' },
			{ name: 'Unarchive', value: 'UNARCHIVE' },
		],
	},
	// ------ Add / Remove Contacts ------
	{
		displayName: 'Contact IDs',
		name: 'contactIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated contact IDs (max 500)',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['addContacts', 'removeContacts'],
			},
		},
	},
	// ------ Get Many ------
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		default: '',
		description: 'Filter campaigns by name',
		displayOptions: {
			show: { resource: ['campaign'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 10,
		description: 'Max number of results to return (max 25)',
		typeOptions: { minValue: 1, maxValue: 25 },
		displayOptions: {
			show: { resource: ['campaign'], operation: ['getMany'] },
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
			show: { resource: ['campaign'], operation: ['get', 'getMany'] },
		},
	},
	// ------ Get Contacts ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['campaign'], operation: ['getContacts'] },
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
				resource: ['campaign'],
				operation: ['getContacts'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		description: 'Pagination offset (default 0)',
		typeOptions: { minValue: 0 },
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['getContacts'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		default: '',
		description: 'Search contacts within the campaign',
		displayOptions: {
			show: { resource: ['campaign'], operation: ['getContacts'] },
		},
	},
];

export { campaignOperations, campaignFields };
