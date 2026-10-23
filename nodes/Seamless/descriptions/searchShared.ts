import {
	type IDisplayOptions,
	type INodeProperties,
} from 'n8n-workflow';

export const SEARCH_LOCATIONS_MAX = 10;

/** Result-shaping controls that are not search filters. */
const SEARCH_RESULT_CONTROL_FIELDS = new Set(['returnAll', 'limit', 'simplify']);

/** Paging args the MCP Autopilot schema strips from the search filters. */
const SEARCH_PAGING_FIELDS = new Set(['nextToken', 'page', 'limit']);

/**
 * Reuse a resource's Search filter fields under another resource/operation
 * (Autopilot Start takes the same filters as `search_contacts` /
 * `search_companies`). Drops result controls and paging options so the
 * filters stay identical to the MCP `omitPagingKeys` shape; field names are
 * unchanged so the same body builders work at runtime.
 */
export function retargetSearchFilterFields(
	fields: INodeProperties[],
	show: IDisplayOptions['show'],
): INodeProperties[] {
	return fields.reduce<INodeProperties[]>((acc, field) => {
		const operations = field.displayOptions?.show?.operation ?? [];
		if (
			!operations.includes('search') ||
			SEARCH_RESULT_CONTROL_FIELDS.has(field.name)
		) {
			return acc;
		}
		const retargeted: INodeProperties = {
			...field,
			displayOptions: { show },
		};
		if (field.type === 'collection' && Array.isArray(field.options)) {
			retargeted.options = (field.options as INodeProperties[]).filter(
				(option) => !SEARCH_PAGING_FIELDS.has(option.name),
			);
		}
		acc.push(retargeted);
		return acc;
	}, []);
}

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
