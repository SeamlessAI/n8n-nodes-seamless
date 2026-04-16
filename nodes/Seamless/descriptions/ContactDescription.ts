import { type INodeProperties } from 'n8n-workflow';

const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contact'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many contacts',
				description: 'Retrieve a list of researched contacts',
			},
			{
				name: 'Poll Research',
				value: 'pollResearch',
				action: 'Poll contact research results',
				description: 'Check the status of a pending research request',
			},
			{
				name: 'Research',
				value: 'research',
				action: 'Research contacts',
				description:
					'Enrich contacts with verified data (consumes credits)',
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search contacts',
				description: 'Find contacts matching filter criteria',
			},
		],
		default: 'search',
	},
];

const contactFields: INodeProperties[] = [
	// ------ Search ------
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		default: '',
		placeholder: 'e.g. Acme Corp',
		description:
			'Filter by company name. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
	},
	{
		displayName: 'Job Title',
		name: 'jobTitle',
		type: 'string',
		default: '',
		placeholder: 'e.g. Sales Manager',
		description:
			'Filter by job title. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
	},
	{
		displayName: 'Seniority',
		name: 'seniority',
		type: 'multiOptions',
		default: [],
		description: 'Filter by seniority level',
		options: [
			{ name: 'C-Level', value: 'C-Level' },
			{ name: 'Director', value: 'Director' },
			{ name: 'Entry Level', value: 'Entry Level' },
			{ name: 'Manager', value: 'Manager' },
			{ name: 'Mid-Level', value: 'Mid-Level' },
			{ name: 'Other', value: 'Other' },
			{ name: 'Senior', value: 'Senior' },
			{ name: 'VP', value: 'VP' },
		],
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
	},
	{
		displayName: 'Department',
		name: 'department',
		type: 'multiOptions',
		default: [],
		description: 'Filter by department',
		options: [
			{ name: 'Engineering', value: 'Engineering' },
			{ name: 'Finance', value: 'Finance' },
			{ name: 'Human Resources', value: 'Human Resources' },
			{ name: 'IT', value: 'IT' },
			{ name: 'Legal', value: 'Legal' },
			{ name: 'Marketing', value: 'Marketing' },
			{ name: 'Operations', value: 'Operations' },
			{ name: 'Other', value: 'Other' },
			{ name: 'Project Management', value: 'Project Management' },
			{ name: 'Sales', value: 'Sales' },
			{ name: 'Support', value: 'Support' },
		],
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
	},
	{
		displayName: 'Company Domain',
		name: 'companyDomain',
		type: 'string',
		default: '',
		placeholder: 'e.g. acme.com',
		description:
			'Filter by company domain. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
	},
	{
		displayName: 'Industry',
		name: 'industry',
		type: 'string',
		default: '',
		placeholder: 'e.g. Software',
		description:
			'Filter by industry. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
	},
	{
		displayName: 'Full Name',
		name: 'fullname',
		type: 'string',
		default: '',
		placeholder: 'e.g. Nathan Smith',
		description:
			'Filter by contact full name. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['contact'], operation: ['search'] },
		},
		options: [
			{
				displayName: 'Company Founded On',
				name: 'companyFoundedOn',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: '10+ Years', value: '10+ Years' },
					{ name: 'Last 1-3 Years', value: 'Last 1-3 Years' },
					{ name: 'Last 4-10 Years', value: 'Last 4-10 Years' },
					{ name: 'Less Than 1 Year', value: 'Less than 1 Year' },
				],
			},
			{
				displayName: 'Company Name Search Type',
				name: 'companyNameSearchType',
				type: 'options',
				default: 'default',
				options: [
					{ name: 'Default', value: 'default' },
					{ name: 'Exact', value: 'exact' },
					{ name: 'Related', value: 'related' },
				],
			},
			{
				displayName: 'Company Revenue',
				name: 'companyRevenue',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: '$0 - $100K', value: '$0 - $100K' },
					{ name: '$1B+', value: '$1B+' },
					{ name: '$1M - $5M', value: '$1M - $5M' },
					{ name: '$100K - $1M', value: '$100K - $1M' },
					{ name: '$100M - $500M', value: '$100M - $500M' },
					{ name: '$20M - $50M', value: '$20M - $50M' },
					{ name: '$5M - $20M', value: '$5M - $20M' },
					{ name: '$50M - $100M', value: '$50M - $100M' },
					{ name: '$500M - $1B', value: '$500M - $1B' },
				],
			},
			{
				displayName: 'Company Size',
				name: 'companySize',
				type: 'multiOptions',
				default: [],
				options: [
					{
						name: '0 - 1 (Self-Employed)',
						value: '0 - 1 (Self-employed)',
					},
					{ name: '1,001 - 5,000', value: '1,001 - 5,000' },
					{ name: '10,001+', value: '10,001+' },
					{ name: '11 - 50', value: '11 - 50' },
					{ name: '2 - 10', value: '2 - 10' },
					{ name: '201 - 500', value: '201 - 500' },
					{ name: '5,001 - 10,000', value: '5,001 - 10,000' },
					{ name: '501 - 1,000', value: '501 - 1,000' },
					{ name: '51 - 200', value: '51 - 200' },
				],
			},
			{
				displayName: 'Contact Country',
				name: 'contactCountry',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
			},
			{
				displayName: 'Contact Keyword',
				name: 'contactKeyword',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
			},
			{
				displayName: 'Contact State',
				name: 'contactState',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
			},
			{
				displayName: 'Contact Zip Code',
				name: 'contactZipCode',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
			},
			{
				displayName: 'Last Modified After',
				name: 'lastModifiedAfter',
				type: 'dateTime',
				default: '',
				description:
					'Only return contacts modified after this date (ISO 8601)',
			},
			{
				displayName: 'Last Modified Before',
				name: 'lastModifiedBefore',
				type: 'dateTime',
				default: '',
				description:
					'Only return contacts modified before this date (ISO 8601)',
			},
			{
				displayName: 'Location Type',
				name: 'locationType',
				type: 'options',
				default: 'bothOR',
				options: [
					{ name: 'Both (AND)', value: 'bothAND' },
					{ name: 'Both (OR)', value: 'bothOR' },
					{ name: 'Company', value: 'company' },
					{ name: 'Contact', value: 'contact' },
				],
			},
			{
				displayName: 'Next Token',
				name: 'nextToken',
				type: 'string',
				default: '',
				description:
					'Pagination token from a previous search response',
			},
			{
				displayName: 'Technologies',
				name: 'technologies',
				type: 'string',
				default: '',
				description: 'Comma-separated list of technologies',
			},
			{
				displayName: 'Technologies Is Or',
				name: 'technologiesIsOr',
				type: 'boolean',
				default: true,
				description:
					'Whether to match any technology (OR) or all (AND)',
			},
		],
	},
	// ------ Research ------
	{
		displayName: 'Search Result IDs',
		name: 'searchResultIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. abc123,def456',
		description: 'Comma-separated search result IDs from a prior search',
		displayOptions: {
			show: { resource: ['contact'], operation: ['research'] },
		},
	},
	{
		displayName: 'Contacts (JSON)',
		name: 'contacts',
		type: 'json',
		default: '[]',
		description:
			'JSON array of contacts to research. Each object needs contactName+companyName, contactName+domain, email, liProfileUrl, liSalesNavUrl, or liRecruiterUrl.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['research'] },
		},
	},
	{
		displayName: 'Is Job Change',
		name: 'isJobChange',
		type: 'boolean',
		default: false,
		description: 'Whether this is a job change research request',
		displayOptions: {
			show: { resource: ['contact'], operation: ['research'] },
		},
	},
	{
		displayName: 'Wait for Results',
		name: 'waitForResults',
		type: 'boolean',
		default: false,
		description:
			'Whether to auto-poll for up to 30s for results. When false, returns requestIds immediately.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['research'] },
		},
	},
	// ------ Get Many ------
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		description:
			'Start of the lookback period (ISO 8601). Defaults to 30 days ago.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		description: 'End of the lookback period (ISO 8601). Defaults to now.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['contact'], operation: ['getMany'] },
		},
		options: [
			{
				displayName: 'Org IDs',
				name: 'orgIds',
				type: 'string',
				default: '',
				description: 'Comma-separated org IDs to filter by',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				typeOptions: { minValue: 1 },
				description: 'Page number (default 1)',
			},
		],
	},
	// ------ Poll Research ------
	{
		displayName: 'Request IDs',
		name: 'requestIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. req_abc123,req_def456',
		description: 'Comma-separated request IDs from a prior research call',
		displayOptions: {
			show: { resource: ['contact'], operation: ['pollResearch'] },
		},
	},
	// ------ Shared: Return All / Limit / Simplify ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['contact'], operation: ['search', 'getMany'] },
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
				resource: ['contact'],
				operation: ['search'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 500,
		description: 'Max number of results to return (max 500)',
		typeOptions: { minValue: 1, maxValue: 500 },
		displayOptions: {
			show: {
				resource: ['contact'],
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
			show: { resource: ['contact'], operation: ['search', 'getMany'] },
		},
	},
];

export { contactOperations, contactFields };
