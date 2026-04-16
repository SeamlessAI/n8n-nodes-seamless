import {
	type ICredentialTestFunctions,
	type ICredentialsDecrypted,
	type IDataObject,
	type IExecuteFunctions,
	type INodeCredentialTestResult,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import {
	seamlessApiRequest,
	seamlessApiRequestAllItems,
	seamlessApiSearchAllItems,
	testSeamlessApiCredential,
} from './GenericFunctions';

import {
	activityOperations,
	activityFields,
	callOperations,
	callFields,
	campaignOperations,
	campaignFields,
	campaignStepOperations,
	campaignStepFields,
	companyOperations,
	companyFields,
	contactOperations,
	contactFields,
	creditsOperations,
	creditsFields,
	emailOperations,
	emailFields,
	emailAccountOperations,
	emailAccountFields,
	emailFooterOperations,
	emailFooterFields,
	listOperations,
	listFields,
	savedSearchOperations,
	savedSearchFields,
	taskOperations,
	taskFields,
	templateOperations,
	templateFields,
} from './descriptions';

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanObj(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== '' && value !== undefined && value !== null) {
			if (Array.isArray(value) && value.length === 0) continue;
			cleaned[key] = value;
		}
	}
	return cleaned;
}

/**
 * Split a comma-separated string into a trimmed, non-empty array of strings.
 * Returns an empty array for falsy/empty inputs.
 */
function csvToStringArray(value: unknown): string[] {
	if (!value) return [];
	return String(value)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

/**
 * Split a comma-separated string into an array of numbers, dropping non-numeric values.
 */
function csvToNumberArray(value: unknown): number[] {
	return csvToStringArray(value)
		.map((s) => Number(s))
		.filter((n) => !Number.isNaN(n));
}

/**
 * If `value` is truthy, sets `key` on `target` to the trimmed array; otherwise no-op.
 */
function setStringArray(
	target: IDataObject,
	key: string,
	value: unknown
): void {
	const arr = csvToStringArray(value);
	if (arr.length) target[key] = arr;
}

/**
 * Convert CSV-shaped filter fields in `filters` (as defined by the MCP
 * send_bulk_email schema) into arrays for the REST request.
 */
const BULK_FILTER_STRING_ARRAY_KEYS = [
	'industryFilters',
	'companyFilters',
	'seniorities',
	'departments',
	'prospectStatuses',
	'engagementStatuses',
	'employeeSizeFilters',
	'revenueFilters',
	'technologies',
];
const BULK_FILTER_NUMBER_ARRAY_KEYS = ['contactIds', 'lists', 'campaignIds'];

function normalizeBulkFilters(raw: IDataObject): IDataObject {
	const out: IDataObject = {};
	for (const [key, value] of Object.entries(raw)) {
		if (value === undefined || value === null || value === '') continue;
		if (BULK_FILTER_STRING_ARRAY_KEYS.includes(key)) {
			const arr = csvToStringArray(value);
			if (arr.length) out[key] = arr;
		} else if (BULK_FILTER_NUMBER_ARRAY_KEYS.includes(key)) {
			const arr = csvToNumberArray(value);
			if (arr.length) out[key] = arr;
		} else {
			out[key] = value;
		}
	}
	return out;
}

/**
 * Extract templateData from an n8n fixedCollection parameter shape
 * (`{ value: { subject, template } }`), returning the inner object or undefined.
 */
function unwrapTemplateData(raw: unknown): IDataObject | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const outer = raw as IDataObject;
	const inner = outer.value as IDataObject | undefined;
	if (!inner) return undefined;
	const cleaned = cleanObj(inner);
	return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/**
 * n8n `number` fields default to 0 when unset. For optional ID-like fields,
 * drop the 0 so we never send an invalid ID to the REST API.
 */
function dropZeroIds(obj: IDataObject, keys: string[]): void {
	for (const k of keys) {
		if (obj[k] === 0) delete obj[k];
	}
}

// ─── Contact ────────────────────────────────────────────────────────────────

/** Keys on the Contact search `additionalFields` that must be sent as string[]. */
const CONTACT_SEARCH_CSV_KEYS = [
	'contactCountry',
	'contactState',
	'contactZipCode',
	'contactKeyword',
	'technologies',
];

async function executeContact(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'search') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const limit = returnAll
			? undefined
			: (this.getNodeParameter('limit', i) as number);
		const body: IDataObject = {};

		setStringArray(
			body,
			'companyName',
			this.getNodeParameter('companyName', i, '')
		);
		setStringArray(
			body,
			'jobTitle',
			this.getNodeParameter('jobTitle', i, '')
		);
		setStringArray(
			body,
			'companyDomain',
			this.getNodeParameter('companyDomain', i, '')
		);
		setStringArray(
			body,
			'industry',
			this.getNodeParameter('industry', i, '')
		);
		setStringArray(
			body,
			'fullname',
			this.getNodeParameter('fullname', i, '')
		);

		const seniority = this.getNodeParameter('seniority', i, []) as string[];
		if (seniority.length) body.seniority = seniority;

		const department = this.getNodeParameter(
			'department',
			i,
			[]
		) as string[];
		if (department.length) body.department = department;

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		for (const key of CONTACT_SEARCH_CSV_KEYS) {
			if (cleaned[key] !== undefined) {
				setStringArray(body, key, cleaned[key]);
				delete cleaned[key];
			}
		}
		Object.assign(body, cleaned);

		return seamlessApiSearchAllItems.call(
			this,
			'/search/contacts',
			body,
			limit
		);
	}

	if (operation === 'research') {
		const body: IDataObject = {};
		setStringArray(
			body,
			'searchResultIds',
			this.getNodeParameter('searchResultIds', i, '')
		);

		const contacts = this.getNodeParameter('contacts', i, '[]') as string;
		const parsed = JSON.parse(contacts);
		if (Array.isArray(parsed) && parsed.length) body.contacts = parsed;

		const isJobChange = this.getNodeParameter(
			'isJobChange',
			i,
			false
		) as boolean;
		if (isJobChange) body.isJobChange = true;

		const waitForResults = this.getNodeParameter(
			'waitForResults',
			i,
			false
		) as boolean;
		if (waitForResults) body.waitForResults = true;

		return seamlessApiRequest.call(
			this,
			'POST',
			'/contacts/research',
			body
		);
	}

	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const startDate = this.getNodeParameter('startDate', i, '') as string;
		const endDate = this.getNodeParameter('endDate', i, '') as string;
		const qs: IDataObject = {};
		if (startDate) qs.startDate = startDate;
		if (endDate) qs.endDate = endDate;

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		if (cleaned.orgIds !== undefined) {
			const arr = csvToStringArray(cleaned.orgIds);
			if (arr.length) qs.orgIds = arr.join(',');
			delete cleaned.orgIds;
		}
		Object.assign(qs, cleaned);

		if (returnAll) {
			return seamlessApiRequestAllItems.call(
				this,
				'GET',
				'/contacts',
				undefined,
				qs
			);
		}
		qs.limit = this.getNodeParameter('limit', i) as number;
		const response = await seamlessApiRequest.call(
			this,
			'GET',
			'/contacts',
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}

	if (operation === 'pollResearch') {
		const requestIds = this.getNodeParameter('requestIds', i) as string;
		const ids = csvToStringArray(requestIds);
		return seamlessApiRequest.call(
			this,
			'GET',
			'/contacts/research/poll',
			undefined,
			{ requestIds: ids.join(',') }
		);
	}

	return {};
}

// ─── Company ────────────────────────────────────────────────────────────────

/** Keys on the Company search `additionalFields` that must be sent as string[]. */
const COMPANY_SEARCH_CSV_KEYS = [
	'companyCountry',
	'companyState',
	'companyZipCode',
	'companyKeyword',
	'technologies',
];

async function executeCompany(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'search') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const limit = returnAll
			? undefined
			: (this.getNodeParameter('limit', i) as number);
		const body: IDataObject = {};

		setStringArray(
			body,
			'companyName',
			this.getNodeParameter('companyName', i, '')
		);
		setStringArray(
			body,
			'companyDomain',
			this.getNodeParameter('companyDomain', i, '')
		);
		setStringArray(
			body,
			'industry',
			this.getNodeParameter('industry', i, '')
		);

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		for (const key of COMPANY_SEARCH_CSV_KEYS) {
			if (cleaned[key] !== undefined) {
				setStringArray(body, key, cleaned[key]);
				delete cleaned[key];
			}
		}
		Object.assign(body, cleaned);

		return seamlessApiSearchAllItems.call(
			this,
			'/search/companies',
			body,
			limit
		);
	}

	if (operation === 'research') {
		const body: IDataObject = {};
		setStringArray(
			body,
			'searchResultIds',
			this.getNodeParameter('searchResultIds', i, '')
		);

		const companies = this.getNodeParameter('companies', i, '[]') as string;
		const parsed = JSON.parse(companies);
		if (Array.isArray(parsed) && parsed.length) body.companies = parsed;

		const waitForResults = this.getNodeParameter(
			'waitForResults',
			i,
			false
		) as boolean;
		if (waitForResults) body.waitForResults = true;

		return seamlessApiRequest.call(
			this,
			'POST',
			'/companies/research',
			body
		);
	}

	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const startDate = this.getNodeParameter('startDate', i, '') as string;
		const endDate = this.getNodeParameter('endDate', i, '') as string;
		const qs: IDataObject = {};
		if (startDate) qs.startDate = startDate;
		if (endDate) qs.endDate = endDate;

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		if (cleaned.orgIds !== undefined) {
			const arr = csvToStringArray(cleaned.orgIds);
			if (arr.length) qs.orgIds = arr.join(',');
			delete cleaned.orgIds;
		}
		Object.assign(qs, cleaned);

		if (returnAll) {
			return seamlessApiRequestAllItems.call(
				this,
				'GET',
				'/companies',
				undefined,
				qs
			);
		}
		qs.limit = this.getNodeParameter('limit', i) as number;
		const response = await seamlessApiRequest.call(
			this,
			'GET',
			'/companies',
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}

	if (operation === 'pollResearch') {
		const requestIds = this.getNodeParameter('requestIds', i) as string;
		const ids = csvToStringArray(requestIds);
		return seamlessApiRequest.call(
			this,
			'GET',
			'/companies/research/poll',
			undefined,
			{ requestIds: ids.join(',') }
		);
	}

	return {};
}

// ─── List ───────────────────────────────────────────────────────────────────

async function executeList(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const name = this.getNodeParameter('name', i) as string;
		return seamlessApiRequest.call(this, 'POST', '/lists', { name });
	}
	if (operation === 'get') {
		const id = this.getNodeParameter('listId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/lists/${id}`);
	}
	if (operation === 'getMany') {
		return seamlessApiRequest.call(this, 'GET', '/lists');
	}
	if (operation === 'update') {
		const id = this.getNodeParameter('listId', i) as number;
		const name = this.getNodeParameter('name', i) as string;
		return seamlessApiRequest.call(this, 'PUT', `/lists/${id}`, { name });
	}
	if (operation === 'delete') {
		const id = this.getNodeParameter('listId', i) as number;
		await seamlessApiRequest.call(this, 'DELETE', `/lists/${id}`);
		return { deleted: true };
	}
	return {};
}

// ─── Campaign ───────────────────────────────────────────────────────────────

async function executeCampaign(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const name = this.getNodeParameter('name', i) as string;
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const body: IDataObject = { name };
		if (additionalFields.emailAccountIds) {
			const ids = csvToNumberArray(additionalFields.emailAccountIds);
			if (ids.length) body.emailAccountIds = ids;
		}
		return seamlessApiRequest.call(this, 'POST', '/campaigns', body);
	}
	if (operation === 'get') {
		const id = this.getNodeParameter('campaignId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/campaigns/${id}`);
	}
	if (operation === 'getMany') {
		const qs: IDataObject = {};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) qs.searchText = searchText;
		qs.limit = this.getNodeParameter('limit', i, 10) as number;
		return seamlessApiRequest.call(
			this,
			'GET',
			'/campaigns',
			undefined,
			qs
		);
	}
	if (operation === 'update') {
		const id = this.getNodeParameter('campaignId', i) as number;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		const body: IDataObject = {};
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.isPublic !== undefined)
			body.isPublic = updateFields.isPublic;
		if (updateFields.emailAccountIds) {
			const ids = csvToNumberArray(updateFields.emailAccountIds);
			if (ids.length) body.emailAccountIds = ids;
		}
		return seamlessApiRequest.call(this, 'PUT', `/campaigns/${id}`, body);
	}
	if (operation === 'delete') {
		const id = this.getNodeParameter('campaignId', i) as number;
		await seamlessApiRequest.call(this, 'DELETE', `/campaigns/${id}`);
		return { deleted: true };
	}
	if (operation === 'executeAction') {
		const id = this.getNodeParameter('campaignId', i) as number;
		const action = this.getNodeParameter('action', i) as string;
		return seamlessApiRequest.call(
			this,
			'POST',
			`/campaigns/${id}/actions`,
			{ action }
		);
	}
	if (operation === 'clone') {
		const id = this.getNodeParameter('campaignId', i) as number;
		const name = this.getNodeParameter('name', i) as string;
		return seamlessApiRequest.call(this, 'POST', `/campaigns/${id}/clone`, {
			name,
		});
	}
	if (operation === 'addContacts') {
		const id = this.getNodeParameter('campaignId', i) as number;
		const contactIds = csvToNumberArray(
			this.getNodeParameter('contactIds', i)
		);
		return seamlessApiRequest.call(
			this,
			'POST',
			`/campaigns/${id}/contacts`,
			{ contactIds }
		);
	}
	if (operation === 'removeContacts') {
		const id = this.getNodeParameter('campaignId', i) as number;
		const contactIds = csvToNumberArray(
			this.getNodeParameter('contactIds', i)
		);
		return seamlessApiRequest.call(
			this,
			'DELETE',
			`/campaigns/${id}/contacts`,
			{ contactIds }
		);
	}
	if (operation === 'getContacts') {
		const id = this.getNodeParameter('campaignId', i) as number;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const qs: IDataObject = {};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) qs.searchText = searchText;

		if (returnAll) {
			const allItems: IDataObject[] = [];
			let offset = 0;
			const batchSize = 50;
			let hasMore = true;
			while (hasMore) {
				qs.limit = batchSize;
				qs.offset = offset;
				const resp = await seamlessApiRequest.call(
					this,
					'GET',
					`/campaigns/${id}/contacts`,
					undefined,
					qs
				);
				const items = (resp.data || resp) as IDataObject[];
				if (Array.isArray(items) && items.length > 0) {
					allItems.push(...items);
					offset += items.length;
					hasMore = items.length === batchSize;
				} else {
					hasMore = false;
				}
			}
			return allItems;
		}
		qs.limit = this.getNodeParameter('limit', i, 25) as number;
		qs.offset = this.getNodeParameter('offset', i, 0) as number;
		const response = await seamlessApiRequest.call(
			this,
			'GET',
			`/campaigns/${id}/contacts`,
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}
	if (operation === 'getMetrics') {
		const id = this.getNodeParameter('campaignId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/campaigns/${id}/metrics`);
	}
	return {};
}

// ─── Campaign Step ──────────────────────────────────────────────────────────

async function executeCampaignStep(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	const campaignId = this.getNodeParameter('campaignId', i) as number;

	if (operation === 'create') {
		const body: IDataObject = {
			type: this.getNodeParameter('type', i) as string,
			name: this.getNodeParameter('name', i) as string,
			dueDay: this.getNodeParameter('dueDay', i) as number,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		const templateData = unwrapTemplateData(cleaned.templateData);
		delete cleaned.templateData;
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		if (templateData) body.templateData = templateData;
		return seamlessApiRequest.call(
			this,
			'POST',
			`/campaigns/${campaignId}/steps`,
			body
		);
	}
	if (operation === 'getMany') {
		return seamlessApiRequest.call(
			this,
			'GET',
			`/campaigns/${campaignId}/steps`
		);
	}
	if (operation === 'update') {
		const stepId = this.getNodeParameter('stepId', i) as number;
		const dueDay = this.getNodeParameter('dueDay', i) as number;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(updateFields);
		const templateData = unwrapTemplateData(cleaned.templateData);
		delete cleaned.templateData;
		dropZeroIds(cleaned, ['templateId', 'stepNumber']);
		const body: IDataObject = { dueDay, ...cleaned };
		if (templateData) body.templateData = templateData;
		return seamlessApiRequest.call(
			this,
			'PUT',
			`/campaigns/${campaignId}/steps/${stepId}`,
			body
		);
	}
	if (operation === 'delete') {
		const stepId = this.getNodeParameter('stepId', i) as number;
		await seamlessApiRequest.call(
			this,
			'DELETE',
			`/campaigns/${campaignId}/steps/${stepId}`
		);
		return { deleted: true };
	}
	if (operation === 'executeAction') {
		const stepId = this.getNodeParameter('stepId', i) as number;
		const action = this.getNodeParameter('action', i) as string;
		return seamlessApiRequest.call(
			this,
			'POST',
			`/campaigns/${campaignId}/steps/${stepId}/actions`,
			{ action }
		);
	}
	return {};
}

// ─── Saved Search ───────────────────────────────────────────────────────────

async function executeSavedSearch(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const body: IDataObject = {
			name: this.getNodeParameter('name', i) as string,
			type: this.getNodeParameter('type', i) as string,
			values: JSON.parse(
				this.getNodeParameter('values', i, '{}') as string
			),
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		if (cleaned.tagIds !== undefined) {
			const arr = csvToStringArray(cleaned.tagIds);
			if (arr.length) body.tagIds = arr;
			delete cleaned.tagIds;
		}
		Object.assign(body, cleaned);
		return seamlessApiRequest.call(this, 'POST', '/saved-searches', body);
	}
	if (operation === 'get') {
		const id = this.getNodeParameter('savedSearchId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/saved-searches/${id}`);
	}
	if (operation === 'getMany') {
		const qs: IDataObject = {};
		const type = this.getNodeParameter('type', i, '') as string;
		if (type) qs.type = type;
		return seamlessApiRequest.call(
			this,
			'GET',
			'/saved-searches',
			undefined,
			qs
		);
	}
	if (operation === 'update') {
		const id = this.getNodeParameter('savedSearchId', i) as number;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		const body: IDataObject = {};
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.sortColumn) body.sortColumn = updateFields.sortColumn;
		if (updateFields.sortOrder) body.sortOrder = updateFields.sortOrder;
		if (updateFields.numResultsApproved !== undefined)
			body.numResultsApproved = updateFields.numResultsApproved;
		if (updateFields.values)
			body.values = JSON.parse(updateFields.values as string);
		if (updateFields.tagIds !== undefined) {
			const arr = csvToStringArray(updateFields.tagIds);
			if (arr.length) body.tagIds = arr;
		}
		return seamlessApiRequest.call(
			this,
			'PUT',
			`/saved-searches/${id}`,
			body
		);
	}
	if (operation === 'delete') {
		const id = this.getNodeParameter('savedSearchId', i) as number;
		await seamlessApiRequest.call(this, 'DELETE', `/saved-searches/${id}`);
		return { deleted: true };
	}
	return {};
}

// ─── Template ───────────────────────────────────────────────────────────────

async function executeTemplate(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const body: IDataObject = {
			name: this.getNodeParameter('name', i) as string,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['emailFooterId', 'emailSignatureId']);
		Object.assign(body, cleaned);
		if (!body.type) body.type = 'email';
		return seamlessApiRequest.call(this, 'POST', '/templates', body);
	}
	if (operation === 'get') {
		const id = this.getNodeParameter('templateId', i) as number;
		const type = this.getNodeParameter('type', i, 'email') as string;
		return seamlessApiRequest.call(
			this,
			'GET',
			`/templates/${id}`,
			undefined,
			{ type }
		);
	}
	if (operation === 'getMany') {
		const qs: IDataObject = {
			page: this.getNodeParameter('page', i, 1) as number,
			limit: this.getNodeParameter('limit', i, 15) as number,
		};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) qs.searchText = searchText;
		const type = this.getNodeParameter('type', i, '') as string;
		if (type) qs.type = type;
		const includeStats = this.getNodeParameter(
			'includeStats',
			i,
			false
		) as boolean;
		if (includeStats) qs.includeStats = true;

		const response = await seamlessApiRequest.call(
			this,
			'GET',
			'/templates',
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}
	if (operation === 'update') {
		const id = this.getNodeParameter('templateId', i) as number;
		const type = this.getNodeParameter('type', i, 'email') as string;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		const body: IDataObject = { type, ...cleanObj(updateFields) };
		return seamlessApiRequest.call(
			this,
			'PUT',
			`/templates/${id}`,
			body
		);
	}
	if (operation === 'delete') {
		const id = this.getNodeParameter('templateId', i) as number;
		const type = this.getNodeParameter('type', i, 'email') as string;
		await seamlessApiRequest.call(
			this,
			'DELETE',
			`/templates/${id}`,
			undefined,
			{ type }
		);
		return { deleted: true };
	}
	return {};
}

// ─── Email ──────────────────────────────────────────────────────────────────

async function executeEmail(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject> {
	if (operation === 'createDraft') {
		const body: IDataObject = {
			contactId: this.getNodeParameter('contactId', i) as number,
			from: this.getNodeParameter('from', i) as string,
			to: this.getNodeParameter('to', i) as string,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessApiRequest.call(this, 'POST', '/emails', body);
	}
	if (operation === 'getDraft') {
		const id = this.getNodeParameter('emailId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/emails/${id}`);
	}
	if (operation === 'updateDraft') {
		const id = this.getNodeParameter('emailId', i) as number;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		return seamlessApiRequest.call(
			this,
			'PUT',
			`/emails/${id}`,
			cleanObj(updateFields)
		);
	}
	if (operation === 'sendDraft') {
		const id = this.getNodeParameter('emailId', i) as number;
		const body: IDataObject = {};
		const from = this.getNodeParameter('from', i, '') as string;
		if (from) body.from = from;
		return seamlessApiRequest.call(
			this,
			'POST',
			`/emails/${id}/send`,
			body
		);
	}
	if (operation === 'send') {
		const body: IDataObject = {
			contactId: this.getNodeParameter('contactId', i) as number,
			from: this.getNodeParameter('from', i) as string,
			to: this.getNodeParameter('to', i) as string,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessApiRequest.call(this, 'POST', '/emails/send', body);
	}
	if (operation === 'sendBulk') {
		const body: IDataObject = {
			from: this.getNodeParameter('from', i) as string,
		};
		const bulkFields = this.getNodeParameter(
			'bulkFields',
			i,
			{}
		) as IDataObject;
		const cleanedBulk = cleanObj(bulkFields);
		dropZeroIds(cleanedBulk, ['templateId']);
		Object.assign(body, cleanedBulk);

		const filtersRaw = this.getNodeParameter(
			'filters',
			i,
			{}
		) as IDataObject;
		const normalized = normalizeBulkFilters(filtersRaw);
		if (Object.keys(normalized).length > 0) body.filters = normalized;
		return seamlessApiRequest.call(this, 'POST', '/emails/send-bulk', body);
	}
	if (operation === 'preview') {
		const body: IDataObject = {
			to: this.getNodeParameter('to', i) as string,
			subject: this.getNodeParameter('subject', i) as string,
			body: this.getNodeParameter('body', i) as string,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessApiRequest.call(this, 'POST', '/emails/preview', body);
	}
	return {};
}

// ─── Task ───────────────────────────────────────────────────────────────────

async function executeTask(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'create') {
		const body: IDataObject = {
			name: this.getNodeParameter('name', i) as string,
			taskType: this.getNodeParameter('taskType', i) as string,
			contactId: this.getNodeParameter('contactId', i) as number,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessApiRequest.call(this, 'POST', '/tasks', body);
	}
	if (operation === 'get') {
		const id = this.getNodeParameter('taskId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/tasks/${id}`);
	}
	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const qs: IDataObject = {};
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		Object.assign(qs, cleanObj(filters));

		if (returnAll) {
			const allItems: IDataObject[] = [];
			let offset = 0;
			const batchSize = 50;
			let hasMore = true;
			while (hasMore) {
				qs.limit = batchSize;
				qs.offset = offset;
				const resp = await seamlessApiRequest.call(
					this,
					'GET',
					'/tasks',
					undefined,
					qs
				);
				const items = (resp.data || resp) as IDataObject[];
				if (Array.isArray(items) && items.length > 0) {
					allItems.push(...items);
					offset += items.length;
					hasMore = items.length === batchSize;
				} else {
					hasMore = false;
				}
			}
			return allItems;
		}
		qs.limit = this.getNodeParameter('limit', i, 25) as number;
		if (qs.offset === undefined) qs.offset = 0;
		const response = await seamlessApiRequest.call(
			this,
			'GET',
			'/tasks',
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}
	if (operation === 'update') {
		const id = this.getNodeParameter('taskId', i) as number;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		return seamlessApiRequest.call(
			this,
			'PUT',
			`/tasks/${id}`,
			cleanObj(updateFields)
		);
	}
	if (operation === 'delete') {
		const id = this.getNodeParameter('taskId', i) as number;
		await seamlessApiRequest.call(this, 'DELETE', `/tasks/${id}`);
		return { deleted: true };
	}
	if (operation === 'executeAction') {
		const id = this.getNodeParameter('taskId', i) as number;
		const action = this.getNodeParameter('action', i) as string;
		return seamlessApiRequest.call(this, 'POST', `/tasks/${id}/actions`, {
			action,
		});
	}
	return {};
}

// ─── Call ────────────────────────────────────────────────────────────────────

async function executeCall(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject> {
	if (operation === 'log') {
		const body: IDataObject = {
			contactId: this.getNodeParameter('contactId', i) as number,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		Object.assign(body, cleanObj(additionalFields));
		return seamlessApiRequest.call(this, 'POST', '/calls/log', body);
	}
	if (operation === 'getDispositions') {
		return seamlessApiRequest.call(this, 'GET', '/calls/dispositions');
	}
	if (operation === 'getSentiments') {
		return seamlessApiRequest.call(this, 'GET', '/calls/sentiments');
	}
	return {};
}

// ─── Activity ───────────────────────────────────────────────────────────────

async function executeActivity(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const qs: IDataObject = {};
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		Object.assign(qs, cleanObj(filters));

		if (returnAll) {
			const allItems: IDataObject[] = [];
			let offset = 0;
			const limit = 50;
			let hasMore = true;
			while (hasMore) {
				qs.limit = limit;
				qs.offset = offset;
				const response = await seamlessApiRequest.call(
					this,
					'GET',
					'/activity',
					undefined,
					qs
				);
				const items = (response.data || response) as IDataObject[];
				if (Array.isArray(items) && items.length > 0) {
					allItems.push(...items);
					offset += items.length;
					hasMore = items.length === limit;
				} else {
					hasMore = false;
				}
			}
			return allItems;
		}
		qs.limit = this.getNodeParameter('limit', i, 25) as number;
		if (qs.offset === undefined) qs.offset = 0;
		const response = await seamlessApiRequest.call(
			this,
			'GET',
			'/activity',
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}
	return {};
}

// ─── Email Account ──────────────────────────────────────────────────────────

async function executeEmailAccount(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const qs: IDataObject = {};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) qs.searchText = searchText;

		if (returnAll) {
			return seamlessApiRequestAllItems.call(
				this,
				'GET',
				'/email-accounts',
				undefined,
				qs
			);
		}
		qs.limit = this.getNodeParameter('limit', i, 25) as number;
		qs.page = this.getNodeParameter('page', i, 1) as number;
		const response = await seamlessApiRequest.call(
			this,
			'GET',
			'/email-accounts',
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}
	return {};
}

// ─── Email Footer ───────────────────────────────────────────────────────────

async function executeEmailFooter(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getMany') {
		const qs: IDataObject = {
			limit: this.getNodeParameter('limit', i, 25) as number,
			page: this.getNodeParameter('page', i, 1) as number,
		};
		const response = await seamlessApiRequest.call(
			this,
			'GET',
			'/email-footers',
			undefined,
			qs
		);
		return (response.data || response) as IDataObject[];
	}
	return {};
}

class Seamless implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Seamless',
		name: 'seamless',
		icon: 'file:seamless.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Seamless.ai',
		subtitle:
			'={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		defaults: { name: 'Seamless' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'seamlessApi',
				required: true,
				testedBy: 'testSeamlessApi',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'contact',
				options: [
					{ name: 'Activity', value: 'activity' },
					{ name: 'Call', value: 'call' },
					{ name: 'Campaign', value: 'campaign' },
					{ name: 'Campaign Step', value: 'campaignStep' },
					{ name: 'Company', value: 'company' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Credits', value: 'credits' },
					{ name: 'Email', value: 'email' },
					{ name: 'Email Account', value: 'emailAccount' },
				{ name: 'Email Footer', value: 'emailFooter' },
				{ name: 'List', value: 'list' },
					{ name: 'Saved Search', value: 'savedSearch' },
					{ name: 'Task', value: 'task' },
					{ name: 'Template', value: 'template' },
				],
			},
			// Operations
			...contactOperations,
			...companyOperations,
			...listOperations,
			...creditsOperations,
			...campaignOperations,
			...campaignStepOperations,
			...savedSearchOperations,
			...templateOperations,
			...emailOperations,
			...taskOperations,
			...callOperations,
			...activityOperations,
			...emailAccountOperations,
			...emailFooterOperations,
			// Fields
			...contactFields,
			...companyFields,
			...listFields,
			...creditsFields,
			...campaignFields,
			...campaignStepFields,
			...savedSearchFields,
			...templateFields,
			...emailFields,
			...taskFields,
			...callFields,
			...activityFields,
			...emailAccountFields,
			...emailFooterFields,
		],
	};

	methods = {
		credentialTest: {
			async testSeamlessApi(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted
			): Promise<INodeCredentialTestResult> {
				return testSeamlessApiCredential.call(this, credential);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				if (resource === 'contact') {
					responseData = await executeContact.call(
						this,
						operation,
						i
					);
				} else if (resource === 'company') {
					responseData = await executeCompany.call(
						this,
						operation,
						i
					);
				} else if (resource === 'list') {
					responseData = await executeList.call(this, operation, i);
				} else if (resource === 'credits') {
					responseData = await seamlessApiRequest.call(
						this,
						'GET',
						'/credits'
					);
				} else if (resource === 'campaign') {
					responseData = await executeCampaign.call(
						this,
						operation,
						i
					);
				} else if (resource === 'campaignStep') {
					responseData = await executeCampaignStep.call(
						this,
						operation,
						i
					);
				} else if (resource === 'savedSearch') {
					responseData = await executeSavedSearch.call(
						this,
						operation,
						i
					);
				} else if (resource === 'template') {
					responseData = await executeTemplate.call(
						this,
						operation,
						i
					);
				} else if (resource === 'email') {
					responseData = await executeEmail.call(this, operation, i);
				} else if (resource === 'task') {
					responseData = await executeTask.call(this, operation, i);
				} else if (resource === 'call') {
					responseData = await executeCall.call(this, operation, i);
				} else if (resource === 'activity') {
					responseData = await executeActivity.call(
						this,
						operation,
						i
					);
				} else if (resource === 'emailAccount') {
					responseData = await executeEmailAccount.call(
						this,
						operation,
						i
					);
				} else if (resource === 'emailFooter') {
					responseData = await executeEmailFooter.call(
						this,
						operation,
						i
					);
				}

				const results = Array.isArray(responseData)
					? responseData
					: [responseData];
				for (const item of results) {
					returnData.push({ json: item, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(
					this.getNode(),
					(error as Error).message,
					{
						itemIndex: i,
					}
				);
			}
		}

		return [returnData];
	}
}

export { Seamless };
