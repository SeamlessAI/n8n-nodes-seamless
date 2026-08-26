import { type INodeProperties } from 'n8n-workflow';

const locationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['location'] } },
		options: [
			{
				name: 'Lookup',
				value: 'lookup',
				action: 'Lookup locations',
				description:
					'Search the location vocabulary for the exact spellings a location filter will match',
			},
		],
		default: 'lookup',
	},
];

const locationFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. york',
		description:
			'Partial location name, matched at the start of any word — "york" finds "New York". Search one place name at a time.',
		displayOptions: {
			show: { resource: ['location'], operation: ['lookup'] },
		},
	},
	{
		displayName: 'Types',
		name: 'types',
		type: 'multiOptions',
		default: [],
		description:
			'Restrict to these tiers of the vocabulary. Omit for all. Use "State-Country" or "Country" for state/country filters, "City-State-Country" for a locations tag, and "Postcode" for zip code filters.',
		options: [
			{ name: 'City-Country', value: 'city-country' },
			{ name: 'City-State-Country', value: 'city-state-country' },
			{ name: 'Country', value: 'country' },
			{ name: 'Postcode', value: 'postcode' },
			{ name: 'State-Country', value: 'state-country' },
		],
		displayOptions: {
			show: { resource: ['location'], operation: ['lookup'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: { resource: ['location'], operation: ['lookup'] },
		},
	},
];

export { locationOperations, locationFields };
