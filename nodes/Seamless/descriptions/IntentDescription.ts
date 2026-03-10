import { type INodeProperties } from 'n8n-workflow';

const intentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['intent'] } },
		options: [
			{
				name: 'Get Categories',
				value: 'getCategories',
				action: 'Get intent categories',
				description: 'Retrieve all available buyer intent categories',
			},
			{
				name: 'Get Score',
				value: 'getScore',
				action: 'Get intent score',
				description:
					'Get the buyer intent score for a company on specific topics',
			},
			{
				name: 'Search Companies',
				value: 'searchCompanies',
				action: 'Search companies by intent',
				description:
					'Find companies showing buying intent for specific topics',
			},
			{
				name: 'Search Topics',
				value: 'searchTopics',
				action: 'Search intent topics',
				description:
					'Find available topics, optionally filtered by category',
			},
		],
		default: 'getCategories',
	},
];

const intentFields: INodeProperties[] = [
	// ------ Search Topics ------
	{
		displayName: 'Category',
		name: 'category',
		type: 'string',
		default: '',
		description: 'Filter topics by category',
		displayOptions: {
			show: { resource: ['intent'], operation: ['searchTopics'] },
		},
	},
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		default: '',
		description: 'Search query for topics',
		displayOptions: {
			show: { resource: ['intent'], operation: ['searchTopics'] },
		},
	},
	// ------ Search Companies ------
	{
		displayName: 'Topics',
		name: 'topics',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated list of topic names to search for',
		displayOptions: {
			show: {
				resource: ['intent'],
				operation: ['searchCompanies', 'getScore'],
			},
		},
	},
	// ------ Get Score ------
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		default: '',
		required: true,
		description: 'The company domain to score (e.g. example.com)',
		displayOptions: {
			show: { resource: ['intent'], operation: ['getScore'] },
		},
	},
	// ------ Search Companies Pagination ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['intent'], operation: ['searchCompanies'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 25,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: {
				resource: ['intent'],
				operation: ['searchCompanies'],
				returnAll: [false],
			},
		},
	},
];

export { intentOperations, intentFields };
