import { type INodeProperties } from 'n8n-workflow';

const companyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['company'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many companies',
				description: 'Retrieve a list of researched companies',
			},
			{
				name: 'Poll Research',
				value: 'pollResearch',
				action: 'Poll company research results',
				description: 'Check the status of a pending research request',
			},
			{
				name: 'Research',
				value: 'research',
				action: 'Research companies',
				description:
					'Enrich companies with verified data (consumes credits)',
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search companies',
				description: 'Find companies matching filter criteria',
			},
		],
		default: 'search',
	},
];

const companyFields: INodeProperties[] = [
	// ------ Search ------
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		default: '',
		description:
			'Filter by company name. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['company'], operation: ['search'] },
		},
	},
	{
		displayName: 'Company Domain',
		name: 'companyDomain',
		type: 'string',
		default: '',
		description:
			'Filter by company domain. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['company'], operation: ['search'] },
		},
	},
	{
		displayName: 'Industry',
		name: 'industry',
		type: 'string',
		default: '',
		description:
			'Filter by industry. Comma-separated values to provide multiple.',
		displayOptions: {
			show: { resource: ['company'], operation: ['search'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['company'], operation: ['search'] },
		},
		options: [
			{
				displayName: 'Company Country',
				name: 'companyCountry',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
			},
			{
				displayName: 'Company Keyword',
				name: 'companyKeyword',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
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
				displayName: 'Company State',
				name: 'companyState',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
			},
			{
				displayName: 'Company Zip Code',
				name: 'companyZipCode',
				type: 'string',
				default: '',
				description: 'Comma-separated values to provide multiple',
			},
			{
				displayName: 'Founded On',
				name: 'foundedOn',
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
		description: 'Comma-separated search result IDs from a prior search',
		displayOptions: {
			show: { resource: ['company'], operation: ['research'] },
		},
	},
	{
		displayName: 'Companies (JSON)',
		name: 'companies',
		type: 'json',
		default: '[]',
		description:
			'JSON array of companies to research. Each object needs a domain or companyName.',
		displayOptions: {
			show: { resource: ['company'], operation: ['research'] },
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
			show: { resource: ['company'], operation: ['research'] },
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
			show: { resource: ['company'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		description: 'End of the lookback period (ISO 8601). Defaults to now.',
		displayOptions: {
			show: { resource: ['company'], operation: ['getMany'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['company'], operation: ['getMany'] },
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
		description: 'Comma-separated request IDs from a prior research call',
		displayOptions: {
			show: { resource: ['company'], operation: ['pollResearch'] },
		},
	},
	// ------ Shared ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['company'], operation: ['search', 'getMany'] },
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
				resource: ['company'],
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
				resource: ['company'],
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
			show: { resource: ['company'], operation: ['search', 'getMany'] },
		},
	},
];

export { companyOperations, companyFields };
