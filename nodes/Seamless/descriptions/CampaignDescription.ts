import { type INodeProperties } from 'n8n-workflow';

import {
	campaignCreateStepsField,
	campaignDailySendLimitsField,
	campaignDailyTaskLimitsField,
	campaignResourceLocatorModes,
} from './campaignShared';

const CAMPAIGN_START_REQUIREMENTS =
	'The campaign must have a schedule, at least one linked email account if it has email steps, at least one contact, at least one step, and an email template on every unfinished automatic email step. The account owner must also have accepted the Engage Terms of Service in the Seamless.AI app (otherwise 403 tosNotAccepted). Returns the campaign ID and new status.';
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
				description:
					'Add contacts to a campaign by ID (max 500). Rejected if the campaign is archived or deleted. Returns the updated campaign and contactsAdded — the number actually enrolled, which can be lower than requested when contacts are not in the org or fall below the campaign AI score threshold.',
			},
			{
				name: 'Archive',
				value: 'archive',
				action: 'Archive campaign',
				description:
					'Archive a draft, active, or paused campaign, stopping it and hiding it from the active campaign list. Restore it to draft with Unarchive. Returns the campaign ID and new status.',
			},
			{
				name: 'Clone',
				value: 'clone',
				action: 'Clone campaign',
				description: 'Create a copy of an existing campaign',
			},
			{
				name: 'Complete',
				value: 'complete',
				action: 'Complete campaign',
				description:
					'Mark an active campaign as completed, ending it for all contacts. A completed campaign cannot be started, resumed, or archived again. Returns the campaign ID and new status.',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create campaign',
				description:
					'Create a new campaign, optionally with inline steps and contacts. Each inline step\'s content is exactly one of Template ID, Template Data (static template with merge tags), or AI Prompt (plain instructions with no merge tags; the AI writes personalized content per contact when the step runs).',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete campaign',
				description: 'Permanently delete a campaign',
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
				description:
					'Retrieve contacts in a campaign with engagement status and current step. Paginated by limit/offset; the server reports total and hasMore.',
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
				name: 'Pause',
				value: 'pause',
				action: 'Pause campaign',
				description:
					'Pause an active campaign. No further steps run or emails send until it is resumed with Resume. Returns the campaign ID and new status.',
			},
			{
				name: 'Remove Contacts',
				value: 'removeContacts',
				action: 'Remove contacts from campaign',
				description:
					'Remove contacts from a campaign by ID (max 500). Returns the updated campaign and contactsRemoved — the number actually removed, which is 0 when none of the IDs are currently enrolled. Does not delete the contacts themselves.',
			},
			{
				name: 'Resume',
				value: 'resume',
				action: 'Resume campaign',
				description: `Resume a paused campaign so it continues working its contacts and sending its email steps. Only a paused campaign can be resumed. ${CAMPAIGN_START_REQUIREMENTS}`,
			},
			{
				name: 'Start',
				value: 'start',
				action: 'Start campaign',
				description: `Start a draft campaign so it begins working its contacts and sending its email steps. Only a draft campaign can be started. ${CAMPAIGN_START_REQUIREMENTS}`,
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
				action: 'Unarchive campaign',
				description:
					'Restore an archived campaign to draft. It does not resume sending; run Start afterward to run it again. Returns the campaign ID and new status.',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update campaign',
				description:
					'Update a campaign\'s name, visibility, linked email accounts, per-account daily send limits, or per-day task limits. Send and task limits can be changed in any campaign state and take effect at once (an active campaign moves contacts between active and pending to fit). Email accounts can be added in any state, but removing one from an active campaign fails (422 campaignActive): pause the campaign first, then resume it. Returns the updated campaign with its dailySendLimits and dailyTaskLimits.',
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
					'start',
					'pause',
					'resume',
					'complete',
					'archive',
					'unarchive',
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
			campaignDailySendLimitsField(
				"This campaign's daily send limit on each linked email account (each Email Account ID must also be in Email Account IDs). Accounts not listed keep the default allocation. Requires the campaign send limits feature; otherwise the request is rejected.",
			),
			campaignDailyTaskLimitsField(
				'Per-day task limits for the inline Steps: how many contacts may become due on each cadence day. Due Day must match a step and Daily Task Limit must be at least the number of steps on that day, otherwise the request fails before anything is created. Days not listed receive the default for organizations on campaign send limits and stay unlimited for everyone else. Requires the campaign send limits feature.',
			),
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
			campaignDailySendLimitsField(
				"This campaign's daily send limit on linked email accounts. Accounts not listed keep their current limit; unlinked accounts are rejected (link them via Email Account IDs first). Can be changed in any campaign state and takes effect at once. Requires the campaign send limits feature.",
			),
			campaignDailyTaskLimitsField(
				"Per-day task limits: how many contacts may become due on each cadence day. Due Day must match a step and Daily Task Limit must be at least the number of steps on that day; a day with an email step cannot exceed the campaign's dailySendCapacity. Can be changed in any campaign state and takes effect at once. Requires the campaign send limits feature.",
			),
			{
				displayName: 'Email Account IDs',
				name: 'emailAccountIds',
				type: 'string',
				default: '',
				description:
					'Comma-separated email account IDs to link for sending. Accounts can be added in any state; removing one from an active campaign fails with 422 campaignActive — pause the campaign first, then resume it.',
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
	// ------ Execute Action (legacy; kept so saved workflows keep running) ------
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		default: 'START',
		required: true,
		description:
			'Deprecated: the Execute Action operation was replaced by the Start, Pause, Resume, Complete, Archive, Unarchive, and Delete operations. Each value is routed to the matching operation. Allowed transitions: DRAFT → START/ARCHIVE; ACTIVE → PAUSE/COMPLETE/ARCHIVE; PAUSED → RESUME/ARCHIVE; ARCHIVED → UNARCHIVE/DELETE. Case-insensitive when supplied via an expression.',
		displayOptions: {
			show: { resource: ['campaign'], operation: ['executeAction'] },
		},
		options: [
			{
				name: 'Archive',
				value: 'ARCHIVE',
				action: 'Archive a campaign',
			},
			{
				name: 'Complete',
				value: 'COMPLETE',
				action: 'Complete a campaign',
			},
			{ name: 'Delete', value: 'DELETE', action: 'Delete a campaign' },
			{ name: 'Pause', value: 'PAUSE', action: 'Pause a campaign' },
			{ name: 'Resume', value: 'RESUME', action: 'Resume a campaign' },
			{ name: 'Start', value: 'START', action: 'Start a campaign' },
			{
				name: 'Unarchive',
				value: 'UNARCHIVE',
				action: 'Unarchive a campaign',
			},
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
		displayName: 'Status',
		name: 'status',
		type: 'multiOptions',
		default: [],
		description:
			'Filter campaigns by lifecycle status. Archived campaigns are excluded unless Archived is selected.',
		options: [
			{ name: 'Active', value: 'active' },
			{ name: 'Archived', value: 'archived' },
			{ name: 'Completed', value: 'completed' },
			{ name: 'Draft', value: 'draft' },
			{ name: 'Paused', value: 'paused' },
		],
		displayOptions: {
			show: { resource: ['campaign'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['campaign'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['getMany'],
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
		default: 50,
		description: 'Max number of results to return',
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
