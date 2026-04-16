import { type INodeProperties } from 'n8n-workflow';

const emailOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['email'] } },
		options: [
			{
				name: 'Create Draft',
				value: 'createDraft',
				action: 'Create an email draft',
				description: 'Create a new email draft for a contact',
			},
			{
				name: 'Get Draft',
				value: 'getDraft',
				action: 'Get an email draft',
				description: 'Retrieve an email draft by ID',
			},
			{
				name: 'Preview',
				value: 'preview',
				action: 'Preview an email',
				description:
					'Send a preview of an email to a specified address',
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send an email',
				description: 'Send an email immediately to a contact',
			},
			{
				name: 'Send Bulk',
				value: 'sendBulk',
				action: 'Send bulk emails',
				description:
					'Send an email to multiple contacts matching filters',
			},
			{
				name: 'Send Draft',
				value: 'sendDraft',
				action: 'Send an email draft',
				description: 'Send a previously created email draft',
			},
			{
				name: 'Update Draft',
				value: 'updateDraft',
				action: 'Update an email draft',
				description: 'Update properties of an email draft',
			},
		],
		default: 'send',
	},
];

const BULK_FILTER_OPTIONS: INodeProperties[] = [
	{
		displayName: 'Contact IDs',
		name: 'contactIds',
		type: 'string',
		default: '',
		description: 'Comma-separated saved contact IDs to include',
	},
	{
		displayName: 'Lists',
		name: 'lists',
		type: 'string',
		default: '',
		description: 'Comma-separated list IDs to filter contacts by',
	},
	{
		displayName: 'Query Text',
		name: 'queryText',
		type: 'string',
		default: '',
		description: 'General text search across contact fields',
	},
	{
		displayName: 'Query Text Name',
		name: 'queryTextName',
		type: 'string',
		default: '',
		description: 'Search by contact name',
	},
	{
		displayName: 'Query Text Company',
		name: 'queryTextCompany',
		type: 'string',
		default: '',
		description: 'Search by company name',
	},
	{
		displayName: 'Query Text Domain',
		name: 'queryTextDomain',
		type: 'string',
		default: '',
		description: 'Search by company domain',
	},
	{
		displayName: 'Query Text Title',
		name: 'queryTextTitle',
		type: 'string',
		default: '',
		description: 'Search by job title',
	},
	{
		displayName: 'Query Text Location',
		name: 'queryTextLocation',
		type: 'string',
		default: '',
		description: 'Search by contact location',
	},
	{
		displayName: 'Industry Filters',
		name: 'industryFilters',
		type: 'string',
		default: '',
		description: 'Comma-separated industries',
	},
	{
		displayName: 'Company Filters',
		name: 'companyFilters',
		type: 'string',
		default: '',
		description: 'Comma-separated companies',
	},
	{
		displayName: 'Seniorities',
		name: 'seniorities',
		type: 'string',
		default: '',
		description: 'Comma-separated seniority levels',
	},
	{
		displayName: 'Departments',
		name: 'departments',
		type: 'string',
		default: '',
		description: 'Comma-separated departments',
	},
	{
		displayName: 'Prospect Statuses',
		name: 'prospectStatuses',
		type: 'string',
		default: '',
		description: 'Comma-separated prospect statuses',
	},
	{
		displayName: 'Engagement Statuses',
		name: 'engagementStatuses',
		type: 'string',
		default: '',
		description: 'Comma-separated engagement statuses',
	},
	{
		displayName: 'Employee Size Filters',
		name: 'employeeSizeFilters',
		type: 'string',
		default: '',
		description: 'Comma-separated employee size ranges',
	},
	{
		displayName: 'Revenue Filters',
		name: 'revenueFilters',
		type: 'string',
		default: '',
		description: 'Comma-separated revenue ranges',
	},
	{
		displayName: 'Campaign IDs',
		name: 'campaignIds',
		type: 'string',
		default: '',
		description: 'Comma-separated campaign IDs',
	},
	{
		displayName: 'Technologies',
		name: 'technologies',
		type: 'string',
		default: '',
		description: 'Comma-separated technologies used',
	},
];

const emailFields: INodeProperties[] = [
	// ------ Shared: Email ID ------
	{
		displayName: 'Email ID',
		name: 'emailId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The ID of the email',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['getDraft', 'updateDraft', 'sendDraft'],
			},
		},
	},
	// ------ Create Draft / Send ------
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The contact to send the email to',
		displayOptions: {
			show: { resource: ['email'], operation: ['createDraft', 'send'] },
		},
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		default: '',
		required: true,
		description: 'The sender email address',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['createDraft', 'send', 'sendBulk'],
			},
		},
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		required: true,
		description: 'The recipient email address',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['createDraft', 'send', 'preview'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['createDraft', 'send'],
			},
		},
		options: [
			{
				displayName: 'BCC',
				name: 'bcc',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				typeOptions: { rows: 5 },
			},
			{
				displayName: 'CC',
				name: 'cc',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Schedule At',
				name: 'scheduleAt',
				type: 'dateTime',
				default: '',
				description: 'When to send the email (ISO 8601)',
			},
			{
				displayName: 'Subject',
				name: 'subject',
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
	// ------ Update Draft ------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['email'], operation: ['updateDraft'] },
		},
		options: [
			{
				displayName: 'BCC',
				name: 'bcc',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				typeOptions: { rows: 5 },
			},
			{
				displayName: 'CC',
				name: 'cc',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Schedule At',
				name: 'scheduleAt',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
			},
		],
	},
	// ------ Send Draft ------
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		default: '',
		description: 'Sender email address (overrides draft default)',
		displayOptions: {
			show: { resource: ['email'], operation: ['sendDraft'] },
		},
	},
	// ------ Send Bulk ------
	{
		displayName: 'Bulk Fields',
		name: 'bulkFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['email'], operation: ['sendBulk'] },
		},
		options: [
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				typeOptions: { rows: 5 },
				description:
					'Email body HTML (required if no Template ID). Supports template variables.',
			},
			{
				displayName: 'Schedule At',
				name: 'scheduleAt',
				type: 'dateTime',
				default: '',
				description: 'When to send the email (ISO 8601)',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description:
					'Email subject (required if no Template ID). Supports template variables.',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				default: 0,
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		description: 'Filter criteria to select saved contacts for bulk email',
		displayOptions: {
			show: { resource: ['email'], operation: ['sendBulk'] },
		},
		options: BULK_FILTER_OPTIONS,
	},
	// ------ Preview ------
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		required: true,
		description: 'Email subject line to preview',
		displayOptions: {
			show: { resource: ['email'], operation: ['preview'] },
		},
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		default: '',
		required: true,
		typeOptions: { rows: 5 },
		description: 'Email body HTML content to preview',
		displayOptions: {
			show: { resource: ['email'], operation: ['preview'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['email'], operation: ['preview'] },
		},
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				description: 'Sender email address',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				default: 0,
				description: 'Template ID to use for preview',
			},
		],
	},
];

export { emailOperations, emailFields };
