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
			{
				name: 'Update',
				value: 'update',
				action: 'Update contacts',
				description:
					'Update saved contacts. Currently manages which lists they belong to.',
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
				displayName: 'Company Funding Totals',
				name: 'companyFundingTotals',
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
				displayName: 'Company Latest Funding Classifications',
				name: 'companyLatestFundingClassifications',
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
				displayName: 'Company Latest Funding Dates',
				name: 'companyLatestFundingDates',
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
				displayName: 'Email Address',
				name: 'emailAddress',
				type: 'string',
				default: '',
				description:
					'Filter by email address. Comma-separated values to provide multiple.',
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
				displayName: 'Job Change Day Range',
				name: 'jobChangeDayRange',
				type: 'options',
				default: 'Last 90 Days',
				description:
					'How far back to look for a job change. Used with Job Change Type.',
				options: [
					{ name: 'Last 180 Days', value: 'Last 180 Days' },
					{ name: 'Last 365 Days', value: 'Last 365 Days' },
					{ name: 'Last 60 Days', value: 'Last 60 Days' },
					{ name: 'Last 90 Days', value: 'Last 90 Days' },
				],
			},
			{
				displayName: 'Job Change Type',
				name: 'jobChangeType',
				type: 'options',
				default: 'New Hire or New Promotion',
				description:
					'Filter to contacts who recently changed jobs, by kind of change',
				options: [
					{ name: 'New Hire', value: 'New Hire' },
					{
						name: 'New Hire or New Promotion',
						value: 'New Hire or New Promotion',
					},
					{ name: 'New Promotion', value: 'New Promotion' },
				],
			},
			{
				displayName: 'Keywords Is Or',
				name: 'keywordsIsOr',
				type: 'boolean',
				default: false,
				description:
					'Whether multiple Contact Keyword values match ANY of them (true) or require ALL of them (false)',
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
				displayName: 'Location Radius',
				name: 'locationRadius',
				type: 'options',
				default: '25',
				description:
					'Widen Locations and Contact Country to everything within this radius in miles. Only geocodable values (cities, zip codes) get a radius.',
				options: [
					{ name: '100 Miles', value: '100' },
					{ name: '25 Miles', value: '25' },
					{ name: '250 Miles', value: '250' },
					{ name: '50 Miles', value: '50' },
				],
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
				displayName: 'Locations',
				name: 'locations',
				type: 'string',
				default: '',
				description:
					'Filter by free-form location tags — city, state/region, or country, and the only way to filter by city (e.g. "Austin, Texas"). Prefix a value with "-" to exclude it. Comma-separated values to provide multiple.',
			},
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
				displayName: 'Past Company Exact Match',
				name: 'pastCompanyExactMatch',
				type: 'boolean',
				default: false,
				description:
					'Whether Past Company Names must match exactly. Defaults to false (relevance matching).',
			},
			{
				displayName: 'Past Company Names',
				name: 'pastCompanyNames',
				type: 'string',
				default: '',
				description:
					'Filter to contacts who previously worked at these companies. Comma-separated values to provide multiple.',
			},
			{
				displayName: 'Past Company Only Most Recent Departure',
				name: 'pastCompanyOnlyMostRecentDeparture',
				type: 'boolean',
				default: false,
				description:
					"Whether to only match the contact's most recent former company. Defaults to false (match any former company).",
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				description:
					'Filter by phone number. Accepts any format; non-digit characters are stripped automatically. Comma-separated values to provide multiple.',
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
			{
				displayName: 'Timezone Type',
				name: 'timezoneType',
				type: 'options',
				default: 'bothOR',
				description:
					'Determines which entity the Timezones filter applies to. Ignored unless Timezones is set.',
				options: [
					{ name: 'Both (AND)', value: 'bothAND' },
					{ name: 'Both (OR)', value: 'bothOR' },
					{ name: 'Company', value: 'company' },
					{ name: 'Contact', value: 'contact' },
				],
			},
			{
				displayName: 'Timezones',
				name: 'timezones',
				type: 'multiOptions',
				default: [],
				description:
					'Filter by timezone. Which entity this applies to is controlled by Timezone Type.',
				options: [
					{ name: '(Arabic) Egypt (ART)', value: '(Arabic) Egypt (ART)' },
					{ name: 'Alaska (AKST)', value: 'Alaska (AKST)' },
					{ name: 'Argentina (AGT)', value: 'Argentina (AGT)' },
					{
						name: 'Australia Central (ACT)',
						value: 'Australia Central (ACT)',
					},
					{
						name: 'Australia Eastern (AET)',
						value: 'Australia Eastern (AET)',
					},
					{ name: 'Bangladesh (BST)', value: 'Bangladesh (BST)' },
					{ name: 'Brazil Eastern (BET)', value: 'Brazil Eastern (BET)' },
					{
						name: 'Canada Newfoundland (CNT)',
						value: 'Canada Newfoundland (CNT)',
					},
					{ name: 'Central (CST)', value: 'Central (CST)' },
					{ name: 'Central African (CAT)', value: 'Central African (CAT)' },
					{ name: 'China Taiwan (CTT)', value: 'China Taiwan (CTT)' },
					{ name: 'Eastern (EST)', value: 'Eastern (EST)' },
					{ name: 'Eastern African (EAT)', value: 'Eastern African (EAT)' },
					{
						name: 'Eastern European (EET)',
						value: 'Eastern European (EET)',
					},
					{
						name: 'European Central (ECT)',
						value: 'European Central (ECT)',
					},
					{ name: 'Greenwich Mean (GMT)', value: 'Greenwich Mean (GMT)' },
					{ name: 'Hawaii (HST)', value: 'Hawaii (HST)' },
					{ name: 'India (IST)', value: 'India (IST)' },
					{ name: 'Indiana Eastern (IET)', value: 'Indiana Eastern (IET)' },
					{ name: 'Japan (JST)', value: 'Japan (JST)' },
					{ name: 'Middle East (MET)', value: 'Middle East (MET)' },
					{ name: 'Midway Islands (MIT)', value: 'Midway Islands (MIT)' },
					{ name: 'Mountain (MST)', value: 'Mountain (MST)' },
					{ name: 'Near East (NET)', value: 'Near East (NET)' },
					{ name: 'New Zealand (NST)', value: 'New Zealand (NST)' },
					{ name: 'Pacific (PST)', value: 'Pacific (PST)' },
					{
						name: 'Pakistan Lahore (PLT)',
						value: 'Pakistan Lahore (PLT)',
					},
					{
						name: 'Puerto Rico and US Virgin Islands (PRT)',
						value: 'Puerto Rico and US Virgin Islands (PRT)',
					},
					{ name: 'Solomon (SST)', value: 'Solomon (SST)' },
					{ name: 'Vietnam (VST)', value: 'Vietnam (VST)' },
				],
			},
			{
				displayName: 'Titles Exact Match',
				name: 'titlesExactMatch',
				type: 'boolean',
				default: false,
				description:
					'Whether Job Title must match exactly. Defaults to false (relevance matching).',
			},
			{
				displayName: 'Zip Codes Radius',
				name: 'zipCodesRadius',
				type: 'options',
				default: '25',
				description:
					'Widen Contact Zip Code to everything within this radius in miles',
				options: [
					{ name: '100 Miles', value: '100' },
					{ name: '25 Miles', value: '25' },
					{ name: '250 Miles', value: '250' },
					{ name: '50 Miles', value: '50' },
				],
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
		displayName: 'List IDs',
		name: 'listIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123,456',
		description:
			'Comma-separated IDs of contact lists to add each newly saved contact to (max 50). Contacts that were already researched are not re-saved; add those to a list with the Update operation instead.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['research'] },
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
	// ------ Update ------
	{
		displayName: 'Contact IDs',
		name: 'contactIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123,456',
		description:
			'Comma-separated IDs of the saved contacts to update (max 500). IDs come from Get Many (or the contactId of an already saved search result).',
		displayOptions: {
			show: { resource: ['contact'], operation: ['update'] },
		},
	},
	{
		displayName: 'List IDs',
		name: 'listIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123,456',
		description:
			'Comma-separated IDs of the lists to apply (max 50). May be empty only with List Action "Replace", which clears every list off the contacts.',
		displayOptions: {
			show: { resource: ['contact'], operation: ['update'] },
		},
	},
	{
		displayName: 'List Action',
		name: 'listAction',
		type: 'options',
		default: 'add',
		description:
			'How List IDs is applied. "Add" leaves the contacts in any lists they are already in.',
		options: [
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Replace', value: 'replace' },
		],
		displayOptions: {
			show: { resource: ['contact'], operation: ['update'] },
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
		default: 50,
		description: 'Max number of results to return',
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
