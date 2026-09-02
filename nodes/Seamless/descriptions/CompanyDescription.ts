import { type INodeProperties } from 'n8n-workflow';

import { searchLocationsField } from './searchShared';

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
			{
				name: 'Update',
				value: 'update',
				action: 'Update companies',
				description:
					'Update saved companies. Currently manages which lists they belong to.',
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
		placeholder: 'e.g. Acme Corp',
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
		placeholder: 'e.g. acme.com',
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
		placeholder: 'e.g. Software',
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
					{ name: '$100K - $1M', value: '$100K - $1M' },
					{ name: '$100M - $500M', value: '$100M - $500M' },
					{ name: '$1B+', value: '$1B+' },
					{ name: '$1M - $5M', value: '$1M - $5M' },
					{ name: '$20M - $50M', value: '$20M - $50M' },
					{ name: '$500M - $1B', value: '$500M - $1B' },
					{ name: '$50M - $100M', value: '$50M - $100M' },
					{ name: '$5M - $20M', value: '$5M - $20M' },
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
				displayName: 'Company Types',
				name: 'companyTypes',
				type: 'multiOptions',
				default: [],
				description: 'Filter by company type (Public or Private)',
				options: [
					{ name: 'Private', value: 'Private' },
					{ name: 'Public', value: 'Public' },
				],
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
				displayName: 'Funding Totals',
				name: 'fundingTotals',
				type: 'multiOptions',
				default: [],
				description:
					'Filter by total funding amount range (e.g. ["$1M-$5M", "$5M-$20M"])',
				options: [
					{ name: '$0-$100K', value: '$0-$100K' },
					{ name: '$100K-$1M', value: '$100K-$1M' },
					{ name: '$100M-$500M', value: '$100M-$500M' },
					{ name: '$1B+', value: '$1B+' },
					{ name: '$1M-$5M', value: '$1M-$5M' },
					{ name: '$20M-$50M', value: '$20M-$50M' },
					{ name: '$500M-$1B', value: '$500M-$1B' },
					{ name: '$50M-$100M', value: '$50M-$100M' },
					{ name: '$5M-$20M', value: '$5M-$20M' },
				],
			},
			{
				displayName: 'Industry NAICS Codes',
				name: 'industryNaicsCodes',
				type: 'string',
				default: '',
				description:
					'Filter by NAICS code, independently of Industry (e.g. 511210). Prefix a value with "-" to exclude it. Comma-separated values to provide multiple.',
			},
			{
				displayName: 'Industry SIC Codes',
				name: 'industrySicCodes',
				type: 'string',
				default: '',
				description:
					'Filter by SIC code, independently of Industry (e.g. 7372). Prefix a value with "-" to exclude it. Comma-separated values to provide multiple.',
			},
			{
				displayName: 'Keywords Is Or',
				name: 'keywordsIsOr',
				type: 'boolean',
				default: false,
				description:
					'Whether multiple Company Keyword values match ANY of them (true) or require ALL of them (false)',
			},
			{
				displayName: 'Latest Funding Classifications',
				name: 'latestFundingClassifications',
				type: 'multiOptions',
				default: [],
				description:
					'Filter by latest funding round type (e.g. Seed, Series A)',
				options: [
					{ name: 'Angel', value: 'Angel' },
					{ name: 'Other', value: 'Other' },
					{ name: 'Pre-Seed', value: 'Pre-Seed' },
					{ name: 'Seed', value: 'Seed' },
					{ name: 'Series A', value: 'Series A' },
					{ name: 'Series B', value: 'Series B' },
					{ name: 'Series C', value: 'Series C' },
					{ name: 'Series D', value: 'Series D' },
					{ name: 'Series E', value: 'Series E' },
					{ name: 'Series F', value: 'Series F' },
					{ name: 'Series G', value: 'Series G' },
					{ name: 'Series H', value: 'Series H' },
					{ name: 'Series I', value: 'Series I' },
					{ name: 'Series J', value: 'Series J' },
				],
			},
			{
				displayName: 'Latest Funding Dates',
				name: 'latestFundingDates',
				type: 'multiOptions',
				default: [],
				description: 'Filter by recency of latest funding round',
				options: [
					{ name: 'Last 180 Days', value: '180' },
					{ name: 'Last 3 Years', value: '1095' },
					{ name: 'Last 90 Days', value: '90' },
					{ name: 'Last Year', value: '365' },
				],
			},
			{
				displayName: 'Location Radius',
				name: 'locationRadius',
				type: 'options',
				default: '25',
				description:
					'Widen every company location filter, Company Zip Code included, to everything within this radius in miles. Only geocodable values (cities, zip codes) get a radius.',
				options: [
					{ name: '100 Miles', value: '100' },
					{ name: '25 Miles', value: '25' },
					{ name: '250 Miles', value: '250' },
					{ name: '50 Miles', value: '50' },
				],
			},
			searchLocationsField,
			{
				displayName: 'News Type Dates',
				name: 'newsTypeDates',
				type: 'options',
				default: '90',
				description: 'Recency window for News Types, in days',
				options: [
					{ name: 'Last 180 Days', value: '180' },
					{ name: 'Last 60 Days', value: '60' },
					{ name: 'Last 90 Days', value: '90' },
					{ name: 'Last Year', value: '365' },
				],
			},
			{
				displayName: 'News Types',
				name: 'newsTypes',
				type: 'multiOptions',
				default: [],
				description:
					'Filter by company news/event type. Pair with News Type Dates to bound recency.',
				options: [
					{ name: 'Acquisition', value: 'Acquisition' },
					{
						name: 'Corporate Challenges',
						value: 'Corporate Challenges',
					},
					{ name: 'Cost Cutting', value: 'Cost Cutting' },
					{ name: 'Expansion', value: 'Expansion' },
					{ name: 'Investment', value: 'Investment' },
					{ name: 'Leadership', value: 'Leadership' },
					{ name: 'Partnership', value: 'Partnership' },
					{ name: 'Recognition', value: 'Recognition' },
				],
			},
			{
				displayName: 'Next Token',
				name: 'nextToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description:
					'Pagination token from a previous search response',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				typeOptions: { minValue: 1 },
				description:
					'1-based page number, for jumping to a specific offset. Prefer Next Token for sequential paging.',
			},
			{
				displayName: 'Saved Search ID',
				name: 'savedSearchId',
				type: 'string',
				default: '',
				description:
					'Run the filters held by a saved search. Cannot be combined with other filters.',
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
		displayName: 'Skip Deduplication Check',
		name: 'skipDeduplicationCheck',
		type: 'boolean',
		default: false,
		description:
			'Whether to bypass the deduplication check so an already-researched record is enriched again. Consumes credits each time.',
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
		placeholder: 'e.g. req_abc123,req_def456',
		description: 'Comma-separated request IDs from a prior research call',
		displayOptions: {
			show: { resource: ['company'], operation: ['pollResearch'] },
		},
	},
	// ------ Update ------
	{
		displayName: 'Company IDs',
		name: 'companyIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123,456',
		description:
			'Comma-separated IDs of the saved companies to update (max 500). IDs come from Get Many.',
		displayOptions: {
			show: { resource: ['company'], operation: ['update'] },
		},
	},
	{
		displayName: 'List IDs',
		name: 'listIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123,456',
		description:
			'Comma-separated IDs of the lists to apply (max 50). May be empty only with List Action "Replace", which clears every list off the companies.',
		displayOptions: {
			show: { resource: ['company'], operation: ['update'] },
		},
	},
	{
		displayName: 'List Action',
		name: 'listAction',
		type: 'options',
		default: 'add',
		description:
			'How List IDs is applied. "Add" leaves the companies in any lists they are already in.',
		options: [
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Replace', value: 'replace' },
		],
		displayOptions: {
			show: { resource: ['company'], operation: ['update'] },
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
		default: 50,
		description: 'Max number of results to return',
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
