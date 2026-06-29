import {
	type IDataObject,
	type IExecuteFunctions,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodeListSearchResult,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionTypes,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import {
	seamlessMcpCall,
	seamlessMcpCallAllPages,
	seamlessMcpCallAllOffsets,
	seamlessMcpSearchAll,
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

function extractRlId(
	ctx: IExecuteFunctions,
	paramName: string,
	itemIndex: number
): number {
	const raw = ctx.getNodeParameter(paramName, itemIndex) as
		| number
		| { value: number | string };
	if (typeof raw === 'object' && raw !== null && 'value' in raw) {
		return Number(raw.value);
	}
	return Number(raw);
}

/**
 * Resolve campaignId or campaignIdentifier from a resource locator parameter.
 */
function extractCampaignTarget(
	ctx: IExecuteFunctions,
	paramName: string,
	itemIndex: number
): IDataObject {
	const raw = ctx.getNodeParameter(paramName, itemIndex) as
		| number
		| { mode?: string; value: number | string };
	if (typeof raw === 'object' && raw !== null && 'value' in raw) {
		if (raw.mode === 'identifier') {
			return { campaignIdentifier: String(raw.value) };
		}
		return { campaignId: Number(raw.value) };
	}
	return { campaignId: Number(raw) };
}

const CAMPAIGN_SIMPLIFIED_KEYS = [
	'id',
	'name',
	'status',
	'type',
	'isPublic',
	'contactCount',
	'stepCount',
	'createdAt',
	'updatedAt',
];
const TASK_SIMPLIFIED_KEYS = [
	'id',
	'name',
	'type',
	'status',
	'contactId',
	'campaignId',
	'dueDate',
	'createdAt',
	'updatedAt',
];
const TEMPLATE_SIMPLIFIED_KEYS = [
	'id',
	'name',
	'type',
	'subject',
	'createdAt',
	'updatedAt',
];
const SAVED_SEARCH_SIMPLIFIED_KEYS = [
	'id',
	'name',
	'type',
	'resultCount',
	'createdAt',
	'updatedAt',
];
const EMAIL_SIMPLIFIED_KEYS = [
	'id',
	'contactId',
	'from',
	'to',
	'subject',
	'status',
	'scheduledAt',
	'createdAt',
	'updatedAt',
];

function simplifyItem(item: IDataObject, keys: string[]): IDataObject {
	const out: IDataObject = {};
	for (const key of keys) {
		if (item[key] !== undefined) out[key] = item[key];
	}
	return out;
}

function simplifyResults(
	data: IDataObject | IDataObject[],
	keys: string[],
	shouldSimplify: boolean
): IDataObject | IDataObject[] {
	if (!shouldSimplify) return data;
	if (Array.isArray(data)) return data.map((item) => simplifyItem(item, keys));
	return simplifyItem(data, keys);
}

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

function buildCampaignStepPayload(fields: IDataObject): IDataObject {
	const body: IDataObject = {
		type: fields.type,
		name: fields.name,
		dueDay: fields.dueDay,
	};
	const optional = cleanObj({ ...fields });
	delete optional.type;
	delete optional.name;
	delete optional.dueDay;
	const templateData = unwrapTemplateData(optional.templateData);
	delete optional.templateData;
	dropZeroIds(optional, ['templateId']);
	Object.assign(body, optional);
	if (templateData) body.templateData = templateData;
	return body;
}

function parseInlineCampaignSteps(raw: unknown): IDataObject[] {
	if (!raw || typeof raw !== 'object') return [];
	const collection = raw as IDataObject;
	const steps = collection.step;
	if (!Array.isArray(steps) || !steps.length) return [];
	return steps.map((step) => buildCampaignStepPayload(step as IDataObject));
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

		return seamlessMcpSearchAll.call(
			this,
			'search_contacts',
			body,
			limit,
		);
	}

	if (operation === 'research') {
		const body: IDataObject = {};
		setStringArray(
			body,
			'searchResultIds',
			this.getNodeParameter('searchResultIds', i, ''),
		);

		const contacts = this.getNodeParameter('contacts', i, '[]') as string;
		const parsed = JSON.parse(contacts);
		if (Array.isArray(parsed) && parsed.length) body.contacts = parsed;

		const isJobChange = this.getNodeParameter(
			'isJobChange',
			i,
			false,
		) as boolean;
		if (isJobChange) body.isJobChange = true;

		const waitForResults = this.getNodeParameter(
			'waitForResults',
			i,
			false,
		) as boolean;
		if (waitForResults) body.waitForResults = true;

		return seamlessMcpCall.call(this, 'research_contacts', body);
	}

	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const startDate = this.getNodeParameter('startDate', i, '') as string;
		const endDate = this.getNodeParameter('endDate', i, '') as string;
		const args: IDataObject = {};
		if (startDate) args.startDate = startDate;
		if (endDate) args.endDate = endDate;

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		if (cleaned.orgIds !== undefined) {
			const arr = csvToStringArray(cleaned.orgIds);
			if (arr.length) args.orgIds = arr.join(',');
			delete cleaned.orgIds;
		}
		Object.assign(args, cleaned);

		if (returnAll) {
			return seamlessMcpCallAllPages.call(
				this,
				'get_my_contacts',
				args,
			);
		}
		args.limit = this.getNodeParameter('limit', i) as number;
		const response = await seamlessMcpCall.call(
			this,
			'get_my_contacts',
			args,
		);
		return (response.data || response) as IDataObject[];
	}

	if (operation === 'pollResearch') {
		const requestIds = this.getNodeParameter('requestIds', i) as string;
		const ids = csvToStringArray(requestIds);
		return seamlessMcpCall.call(
			this,
			'poll_contact_research',
			{ requestIds: ids },
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

		return seamlessMcpSearchAll.call(
			this,
			'search_companies',
			body,
			limit,
		);
	}

	if (operation === 'research') {
		const body: IDataObject = {};
		setStringArray(
			body,
			'searchResultIds',
			this.getNodeParameter('searchResultIds', i, ''),
		);

		const companies = this.getNodeParameter('companies', i, '[]') as string;
		const parsed = JSON.parse(companies);
		if (Array.isArray(parsed) && parsed.length) body.companies = parsed;

		const waitForResults = this.getNodeParameter(
			'waitForResults',
			i,
			false,
		) as boolean;
		if (waitForResults) body.waitForResults = true;

		return seamlessMcpCall.call(this, 'research_companies', body);
	}

	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const startDate = this.getNodeParameter('startDate', i, '') as string;
		const endDate = this.getNodeParameter('endDate', i, '') as string;
		const args: IDataObject = {};
		if (startDate) args.startDate = startDate;
		if (endDate) args.endDate = endDate;

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		if (cleaned.orgIds !== undefined) {
			const arr = csvToStringArray(cleaned.orgIds);
			if (arr.length) args.orgIds = arr.join(',');
			delete cleaned.orgIds;
		}
		Object.assign(args, cleaned);

		if (returnAll) {
			return seamlessMcpCallAllPages.call(
				this,
				'get_my_companies',
				args,
			);
		}
		args.limit = this.getNodeParameter('limit', i) as number;
		const response = await seamlessMcpCall.call(
			this,
			'get_my_companies',
			args,
		);
		return (response.data || response) as IDataObject[];
	}

	if (operation === 'pollResearch') {
		const requestIds = this.getNodeParameter('requestIds', i) as string;
		const ids = csvToStringArray(requestIds);
		return seamlessMcpCall.call(
			this,
			'poll_company_research',
			{ requestIds: ids },
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
		return seamlessMcpCall.call(this, 'create_list', { name });
	}
	if (operation === 'get') {
		const id = extractRlId(this, 'listId', i);
		return seamlessMcpCall.call(this, 'get_lists', { listId: id });
	}
	if (operation === 'getMany') {
		return seamlessMcpCall.call(this, 'get_lists');
	}
	if (operation === 'update') {
		const id = extractRlId(this, 'listId', i);
		const name = this.getNodeParameter('name', i) as string;
		return seamlessMcpCall.call(this, 'update_list', { id, name });
	}
	if (operation === 'delete') {
		const id = extractRlId(this, 'listId', i);
		await seamlessMcpCall.call(this, 'delete_list', { id });
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
			{},
		) as IDataObject;
		const body: IDataObject = { name };
		if (additionalFields.emailAccountIds) {
			const ids = csvToNumberArray(additionalFields.emailAccountIds);
			if (ids.length) body.emailAccountIds = ids;
		}
		if (additionalFields.contactIds) {
			const ids = csvToNumberArray(additionalFields.contactIds);
			if (ids.length) body.contactIds = ids;
		}
		const steps = parseInlineCampaignSteps(
			this.getNodeParameter('steps', i, {}),
		);
		if (steps.length) body.steps = steps;
		return seamlessMcpCall.call(this, 'create_campaign', body);
	}
	if (operation === 'get') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const result = await seamlessMcpCall.call(this, 'list_campaigns', target);
		return simplifyResults(result, CAMPAIGN_SIMPLIFIED_KEYS, simplify) as IDataObject;
	}
	if (operation === 'getMany') {
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const args: IDataObject = {};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) args.searchText = searchText;
		args.limit = this.getNodeParameter('limit', i, 10) as number;
		const result = await seamlessMcpCall.call(this, 'list_campaigns', args);
		return simplifyResults(result, CAMPAIGN_SIMPLIFIED_KEYS, simplify);
	}
	if (operation === 'update') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{},
		) as IDataObject;
		const body: IDataObject = { ...target };
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.isPublic !== undefined)
			body.isPublic = updateFields.isPublic;
		if (updateFields.emailAccountIds) {
			const ids = csvToNumberArray(updateFields.emailAccountIds);
			if (ids.length) body.emailAccountIds = ids;
		}
		return seamlessMcpCall.call(this, 'update_campaign', body);
	}
	if (operation === 'delete') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		await seamlessMcpCall.call(this, 'delete_campaign', target);
		return { deleted: true };
	}
	if (operation === 'executeAction') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		const action = this.getNodeParameter('action', i) as string;
		return seamlessMcpCall.call(
			this,
			'execute_campaign_action',
			{ ...target, action },
		);
	}
	if (operation === 'clone') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		const name = this.getNodeParameter('name', i) as string;
		return seamlessMcpCall.call(this, 'clone_campaign', {
			...target,
			name,
		});
	}
	if (operation === 'addContacts') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		const contactIds = csvToNumberArray(
			this.getNodeParameter('contactIds', i),
		);
		return seamlessMcpCall.call(
			this,
			'add_contacts_to_campaign',
			{ ...target, contactIds },
		);
	}
	if (operation === 'removeContacts') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		const contactIds = csvToNumberArray(
			this.getNodeParameter('contactIds', i),
		);
		return seamlessMcpCall.call(
			this,
			'remove_contacts_from_campaign',
			{ ...target, contactIds },
		);
	}
	if (operation === 'getContacts') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const args: IDataObject = { ...target };
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) args.searchText = searchText;

		if (returnAll) {
			return seamlessMcpCallAllOffsets.call(
				this,
				'list_campaign_contacts',
				args,
				50,
			);
		}
		args.limit = this.getNodeParameter('limit', i, 25) as number;
		args.offset = this.getNodeParameter('offset', i, 0) as number;
		const response = await seamlessMcpCall.call(
			this,
			'list_campaign_contacts',
			args,
		);
		return (response.data || response) as IDataObject[];
	}
	if (operation === 'getMetrics') {
		const target = extractCampaignTarget(this, 'campaignId', i);
		return seamlessMcpCall.call(this, 'get_campaign_metrics', target);
	}
	return {};
}

// ─── Campaign Step ──────────────────────────────────────────────────────────

async function executeCampaignStep(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	const campaignTarget = extractCampaignTarget(this, 'campaignId', i);

	if (operation === 'create') {
		const body = buildCampaignStepPayload({
			type: this.getNodeParameter('type', i) as string,
			name: this.getNodeParameter('name', i) as string,
			dueDay: this.getNodeParameter('dueDay', i) as number,
			...(this.getNodeParameter('additionalFields', i, {}) as IDataObject),
		});
		return seamlessMcpCall.call(this, 'create_campaign_step', {
			...campaignTarget,
			...body,
		});
	}
	if (operation === 'getMany') {
		return seamlessMcpCall.call(
			this,
			'list_campaign_steps',
			campaignTarget,
		);
	}
	if (operation === 'update') {
		const stepId = this.getNodeParameter('stepId', i) as number;
		const dueDay = this.getNodeParameter('dueDay', i) as number;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{},
		) as IDataObject;
		const cleaned = cleanObj(updateFields);
		const templateData = unwrapTemplateData(cleaned.templateData);
		delete cleaned.templateData;
		dropZeroIds(cleaned, ['templateId', 'stepNumber']);
		const body: IDataObject = { campaignStepId: stepId, dueDay, ...cleaned };
		if (templateData) body.templateData = templateData;
		return seamlessMcpCall.call(this, 'update_campaign_step', body);
	}
	if (operation === 'delete') {
		const stepId = this.getNodeParameter('stepId', i) as number;
		await seamlessMcpCall.call(
			this,
			'delete_campaign_step',
			{ campaignStepId: stepId, ...campaignTarget },
		);
		return { deleted: true };
	}
	if (operation === 'executeAction') {
		const stepId = this.getNodeParameter('stepId', i) as number;
		const action = this.getNodeParameter('action', i) as string;
		return seamlessMcpCall.call(
			this,
			'execute_campaign_step_action',
			{ campaignStepId: stepId, action },
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
				this.getNodeParameter('values', i, '{}') as string,
			),
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		if (cleaned.tagIds !== undefined) {
			const arr = csvToStringArray(cleaned.tagIds);
			if (arr.length) body.tagIds = arr;
			delete cleaned.tagIds;
		}
		Object.assign(body, cleaned);
		return seamlessMcpCall.call(this, 'create_saved_search', body);
	}
	if (operation === 'get') {
		const id = extractRlId(this, 'savedSearchId', i);
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const result = await seamlessMcpCall.call(this, 'list_saved_searches', { id });
		return simplifyResults(result, SAVED_SEARCH_SIMPLIFIED_KEYS, simplify) as IDataObject;
	}
	if (operation === 'getMany') {
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const args: IDataObject = {};
		const type = this.getNodeParameter('type', i, '') as string;
		if (type) args.type = type;
		const result = await seamlessMcpCall.call(
			this,
			'list_saved_searches',
			args,
		);
		return simplifyResults(result, SAVED_SEARCH_SIMPLIFIED_KEYS, simplify);
	}
	if (operation === 'update') {
		const id = extractRlId(this, 'savedSearchId', i);
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{},
		) as IDataObject;
		const body: IDataObject = { id };
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
		return seamlessMcpCall.call(this, 'update_saved_search', body);
	}
	if (operation === 'delete') {
		const id = extractRlId(this, 'savedSearchId', i);
		await seamlessMcpCall.call(this, 'delete_saved_search', { id });
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
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['emailFooterId', 'emailSignatureId']);
		Object.assign(body, cleaned);
		if (!body.type) body.type = 'email';
		return seamlessMcpCall.call(this, 'create_template', body);
	}
	if (operation === 'get') {
		const id = extractRlId(this, 'templateId', i);
		const type = this.getNodeParameter('type', i, 'email') as string;
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const result = await seamlessMcpCall.call(
			this,
			'list_templates',
			{ templateId: id, type },
		);
		return simplifyResults(result, TEMPLATE_SIMPLIFIED_KEYS, simplify) as IDataObject;
	}
	if (operation === 'getMany') {
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const args: IDataObject = {
			page: this.getNodeParameter('page', i, 1) as number,
			limit: this.getNodeParameter('limit', i, 15) as number,
		};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) args.searchText = searchText;
		const type = this.getNodeParameter('type', i, '') as string;
		if (type) args.type = type;
		const includeStats = this.getNodeParameter(
			'includeStats',
			i,
			false,
		) as boolean;
		if (includeStats) args.includeStats = true;

		const response = await seamlessMcpCall.call(
			this,
			'list_templates',
			args,
		);
		const items = (response.data || response) as IDataObject[];
		return simplifyResults(items, TEMPLATE_SIMPLIFIED_KEYS, simplify) as IDataObject[];
	}
	if (operation === 'update') {
		const id = extractRlId(this, 'templateId', i);
		const type = this.getNodeParameter('type', i, 'email') as string;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{},
		) as IDataObject;
		const body: IDataObject = { templateId: id, type, ...cleanObj(updateFields) };
		return seamlessMcpCall.call(this, 'update_template', body);
	}
	if (operation === 'delete') {
		const id = extractRlId(this, 'templateId', i);
		const type = this.getNodeParameter('type', i, 'email') as string;
		await seamlessMcpCall.call(
			this,
			'delete_template',
			{ templateId: id, type },
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
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessMcpCall.call(this, 'create_email_draft', body);
	}
	if (operation === 'getDraft') {
		const id = this.getNodeParameter('emailId', i) as number;
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const result = await seamlessMcpCall.call(this, 'get_email_draft', { emailId: id });
		return simplifyResults(result, EMAIL_SIMPLIFIED_KEYS, simplify) as IDataObject;
	}
	if (operation === 'updateDraft') {
		const id = this.getNodeParameter('emailId', i) as number;
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{},
		) as IDataObject;
		return seamlessMcpCall.call(
			this,
			'update_email_draft',
			{ emailId: id, ...cleanObj(updateFields) },
		);
	}
	if (operation === 'sendDraft') {
		const id = this.getNodeParameter('emailId', i) as number;
		const body: IDataObject = { emailId: id };
		const from = this.getNodeParameter('from', i, '') as string;
		if (from) body.from = from;
		return seamlessMcpCall.call(this, 'send_email_draft', body);
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
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessMcpCall.call(this, 'send_email', body);
	}
	if (operation === 'sendBulk') {
		const body: IDataObject = {
			from: this.getNodeParameter('from', i) as string,
		};
		const bulkFields = this.getNodeParameter(
			'bulkFields',
			i,
			{},
		) as IDataObject;
		const cleanedBulk = cleanObj(bulkFields);
		dropZeroIds(cleanedBulk, ['templateId']);
		Object.assign(body, cleanedBulk);

		const filtersRaw = this.getNodeParameter(
			'filters',
			i,
			{},
		) as IDataObject;
		const normalized = normalizeBulkFilters(filtersRaw);
		if (Object.keys(normalized).length > 0) body.filters = normalized;
		return seamlessMcpCall.call(this, 'send_bulk_email', body);
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
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessMcpCall.call(this, 'send_email_preview', body);
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
			{},
		) as IDataObject;
		const cleaned = cleanObj(additionalFields);
		dropZeroIds(cleaned, ['templateId']);
		Object.assign(body, cleaned);
		return seamlessMcpCall.call(this, 'create_task', body);
	}
	if (operation === 'get') {
		const id = extractRlId(this, 'taskId', i);
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const result = await seamlessMcpCall.call(this, 'list_tasks', { taskId: id });
		return simplifyResults(result, TASK_SIMPLIFIED_KEYS, simplify) as IDataObject;
	}
	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const simplify = this.getNodeParameter('simplify', i, true) as boolean;
		const args: IDataObject = {};
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		Object.assign(args, cleanObj(filters));

		if (returnAll) {
			const allItems = await seamlessMcpCallAllOffsets.call(
				this,
				'list_tasks',
				args,
				50,
			);
			return simplifyResults(allItems, TASK_SIMPLIFIED_KEYS, simplify) as IDataObject[];
		}
		args.limit = this.getNodeParameter('limit', i, 25) as number;
		if (args.offset === undefined) args.offset = 0;
		const response = await seamlessMcpCall.call(this, 'list_tasks', args);
		const items = (response.data || response) as IDataObject[];
		return simplifyResults(items, TASK_SIMPLIFIED_KEYS, simplify) as IDataObject[];
	}
	if (operation === 'update') {
		const id = extractRlId(this, 'taskId', i);
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{},
		) as IDataObject;
		return seamlessMcpCall.call(
			this,
			'update_task',
			{ taskId: id, ...cleanObj(updateFields) },
		);
	}
	if (operation === 'delete') {
		const id = extractRlId(this, 'taskId', i);
		await seamlessMcpCall.call(this, 'delete_task', { taskId: id });
		return { deleted: true };
	}
	if (operation === 'executeAction') {
		const id = extractRlId(this, 'taskId', i);
		const action = this.getNodeParameter('action', i) as string;
		return seamlessMcpCall.call(this, 'execute_task_action', {
			taskId: id,
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
			{},
		) as IDataObject;
		Object.assign(body, cleanObj(additionalFields));
		return seamlessMcpCall.call(this, 'log_call', body);
	}
	if (operation === 'getDispositions') {
		return seamlessMcpCall.call(this, 'list_call_dispositions');
	}
	if (operation === 'getSentiments') {
		return seamlessMcpCall.call(this, 'list_call_sentiments');
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
		const args: IDataObject = {};
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		Object.assign(args, cleanObj(filters));

		if (returnAll) {
			return seamlessMcpCallAllOffsets.call(
				this,
				'get_activity_feed',
				args,
				50,
			);
		}
		args.limit = this.getNodeParameter('limit', i, 25) as number;
		if (args.offset === undefined) args.offset = 0;
		const response = await seamlessMcpCall.call(
			this,
			'get_activity_feed',
			args,
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
		const args: IDataObject = {};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) args.searchText = searchText;

		if (returnAll) {
			return seamlessMcpCallAllPages.call(
				this,
				'list_email_accounts',
				args,
			);
		}
		args.limit = this.getNodeParameter('limit', i, 25) as number;
		args.page = this.getNodeParameter('page', i, 1) as number;
		const response = await seamlessMcpCall.call(
			this,
			'list_email_accounts',
			args,
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
		const args: IDataObject = {
			limit: this.getNodeParameter('limit', i, 25) as number,
			page: this.getNodeParameter('page', i, 1) as number,
		};
		const response = await seamlessMcpCall.call(
			this,
			'list_email_footers',
			args,
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
				displayOptions: { show: { authentication: ['apiKey'] } },
			},
			{
				name: 'seamlessOAuth2Api',
				required: true,
				displayOptions: { show: { authentication: ['oAuth2'] } },
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'OAuth2', value: 'oAuth2' },
					{ name: 'API Key', value: 'apiKey' },
				],
				default: 'oAuth2',
			},
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
					{ name: 'Credit', value: 'credits' },
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
		listSearch: {
			async searchLists(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const response = await seamlessMcpCall.call(this, 'get_lists');
				const items = (response.data || response) as IDataObject[];
				const results = (Array.isArray(items) ? items : [])
					.filter(
						(item) =>
							!filter ||
							String(item.name || '')
								.toLowerCase()
								.includes(filter.toLowerCase()),
					)
					.map((item) => ({
						name: String(item.name || item.id),
						value: item.id as number,
					}));
				return { results };
			},
			async searchCampaigns(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const response = await seamlessMcpCall.call(
					this,
					'list_campaigns',
					{ limit: 25 },
				);
				const items = (response.data || response) as IDataObject[];
				const results = (Array.isArray(items) ? items : [])
					.filter(
						(item) =>
							!filter ||
							String(item.name || '')
								.toLowerCase()
								.includes(filter.toLowerCase()),
					)
					.map((item) => ({
						name: String(item.name || item.id),
						value: item.id as number,
					}));
				return { results };
			},
			async searchTemplates(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const response = await seamlessMcpCall.call(
					this,
					'list_templates',
					{ limit: 50, type: 'email' },
				);
				const items = (response.data || response) as IDataObject[];
				const results = (Array.isArray(items) ? items : [])
					.filter(
						(item) =>
							!filter ||
							String(item.name || '')
								.toLowerCase()
								.includes(filter.toLowerCase()),
					)
					.map((item) => ({
						name: String(item.name || item.id),
						value: item.id as number,
					}));
				return { results };
			},
			async searchSavedSearches(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const response = await seamlessMcpCall.call(
					this,
					'list_saved_searches',
				);
				const items = (response.data || response) as IDataObject[];
				const results = (Array.isArray(items) ? items : [])
					.filter(
						(item) =>
							!filter ||
							String(item.name || '')
								.toLowerCase()
								.includes(filter.toLowerCase()),
					)
					.map((item) => ({
						name: String(item.name || item.id),
						value: item.id as number,
					}));
				return { results };
			},
			async searchTasks(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const response = await seamlessMcpCall.call(
					this,
					'list_tasks',
					{ limit: 50 },
				);
				const items = (response.data || response) as IDataObject[];
				const results = (Array.isArray(items) ? items : [])
					.filter(
						(item) =>
							!filter ||
							String(item.name || '')
								.toLowerCase()
								.includes(filter.toLowerCase()),
					)
					.map((item) => ({
						name: String(item.name || item.id),
						value: item.id as number,
					}));
				return { results };
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
					responseData = await seamlessMcpCall.call(
						this,
						'get_credits',
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
				if (error instanceof NodeApiError) throw error;
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
