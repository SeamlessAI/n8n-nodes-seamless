import { type INodeProperties } from 'n8n-workflow';

export const SEARCH_LOCATIONS_MAX = 10;

/**
 * Repeatable Locations filter shared by Contact and Company Search. Location
 * tags contain commas ("Austin, Texas"), so this is a fixedCollection rather
 * than a comma-separated string. Runtime shape:
 * `{ location: [{ value: 'Austin, Texas' }, ...] }`.
 */
export const searchLocationsField: INodeProperties = {
	displayName: 'Locations',
	name: 'locations',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true },
	placeholder: 'Add Location',
	default: {},
	description: `Filter by free-form location tags — city, state/region, or country, and the only way to filter by city. One location per entry, max ${SEARCH_LOCATIONS_MAX}. Prefix a value with "-" to exclude it (e.g. "-Dallas, Texas").`,
	options: [
		{
			displayName: 'Location',
			name: 'location',
			values: [
				{
					displayName: 'Location',
					name: 'value',
					type: 'string',
					default: '',
					placeholder: 'e.g. Austin, Texas',
					description:
						'A single location tag, exactly as returned by Location → Lookup',
				},
			],
		},
	],
};
