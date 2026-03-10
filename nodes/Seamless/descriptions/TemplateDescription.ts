import { type INodeProperties } from 'n8n-workflow';

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
				action: 'Create a template',
				description: 'Create a new email template',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a template',
				description: 'Permanently remove an email template',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a template',
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
				action: 'Update a template',
				description: 'Update an existing email template',
			},
		],
		default: 'getMany',
	},
];

const templateFields: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The ID of the template',
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
			},
			{
				displayName: 'Email Footer ID',
				name: 'emailFooterId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
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
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
			},
		],
	},
	// ------ Get Many ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['template'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['getMany'],
				returnAll: [false],
			},
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
		type: 'string',
		default: '',
		description: 'Filter templates by type',
		displayOptions: {
			show: { resource: ['template'], operation: ['getMany'] },
		},
	},
];

export { templateOperations, templateFields };
