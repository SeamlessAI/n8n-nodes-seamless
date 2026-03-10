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
					'Preview an email with template variables resolved',
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
	// ------ Create Draft ------
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
				operation: ['createDraft', 'send', 'sendBulk', 'preview'],
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
		description: 'Sender email address (overrides draft value)',
		displayOptions: {
			show: { resource: ['email'], operation: ['sendDraft'] },
		},
	},
	// ------ Send Bulk ------
	{
		displayName: 'Filters (JSON)',
		name: 'filters',
		type: 'json',
		default: '{}',
		description:
			'JSON filter object defining which contacts receive the email',
		displayOptions: {
			show: { resource: ['email'], operation: ['sendBulk'] },
		},
	},
];

export { emailOperations, emailFields };
