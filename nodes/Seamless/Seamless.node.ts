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
	intentOperations,
	intentFields,
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

// ─── Contact ────────────────────────────────────────────────────────────────

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

		const companyName = this.getNodeParameter(
			'companyName',
			i,
			''
		) as string;
		if (companyName) body.companyName = companyName;

		const jobTitle = this.getNodeParameter('jobTitle', i, '') as string;
		if (jobTitle) body.jobTitle = jobTitle;

		const seniority = this.getNodeParameter('seniority', i, []) as string[];
		if (seniority.length) body.seniority = seniority;

		const department = this.getNodeParameter(
			'department',
			i,
			[]
		) as string[];
		if (department.length) body.department = department;

		const companyDomain = this.getNodeParameter(
			'companyDomain',
			i,
			''
		) as string;
		if (companyDomain) body.companyDomain = companyDomain;

		const industry = this.getNodeParameter('industry', i, '') as string;
		if (industry) body.industry = industry;

		const fullName = this.getNodeParameter('fullName', i, '') as string;
		if (fullName) body.fullName = fullName;

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		Object.assign(body, cleanObj(additionalFields));

		if (body.technologies) {
			body.technologies = (body.technologies as string)
				.split(',')
				.map((s) => s.trim());
		}

		return seamlessApiSearchAllItems.call(
			this,
			'/search/contacts',
			body,
			limit
		);
	}

	if (operation === 'research') {
		const body: IDataObject = {};
		const ids = this.getNodeParameter('searchResultIds', i, '') as string;
		if (ids) body.searchResultIds = ids.split(',').map((s) => s.trim());

		const contacts = this.getNodeParameter('contacts', i, '[]') as string;
		const parsed = JSON.parse(contacts);
		if (Array.isArray(parsed) && parsed.length) body.contacts = parsed;

		const isJobChange = this.getNodeParameter(
			'isJobChange',
			i,
			false
		) as boolean;
		if (isJobChange) body.isJobChange = true;

		return seamlessApiRequest.call(
			this,
			'POST',
			'/contacts/research',
			body
		);
	}

	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const startDate = this.getNodeParameter('startDate', i) as string;
		const endDate = this.getNodeParameter('endDate', i) as string;
		const qs: IDataObject = { startDate, endDate };

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
		return seamlessApiRequest.call(
			this,
			'GET',
			'/contacts/research/poll',
			undefined,
			{
				requestIds,
			}
		);
	}

	return {};
}

// ─── Company ────────────────────────────────────────────────────────────────

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

		const companyName = this.getNodeParameter(
			'companyName',
			i,
			''
		) as string;
		if (companyName) body.companyName = companyName;

		const companyDomain = this.getNodeParameter(
			'companyDomain',
			i,
			''
		) as string;
		if (companyDomain) body.companyDomain = companyDomain;

		const industry = this.getNodeParameter('industry', i, '') as string;
		if (industry) body.industry = industry;

		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		Object.assign(body, cleanObj(additionalFields));

		if (body.technologies) {
			body.technologies = (body.technologies as string)
				.split(',')
				.map((s) => s.trim());
		}

		return seamlessApiSearchAllItems.call(
			this,
			'/search/companies',
			body,
			limit
		);
	}

	if (operation === 'research') {
		const body: IDataObject = {};
		const ids = this.getNodeParameter('searchResultIds', i, '') as string;
		if (ids) body.searchResultIds = ids.split(',').map((s) => s.trim());

		const companies = this.getNodeParameter('companies', i, '[]') as string;
		const parsed = JSON.parse(companies);
		if (Array.isArray(parsed) && parsed.length) body.companies = parsed;

		return seamlessApiRequest.call(
			this,
			'POST',
			'/companies/research',
			body
		);
	}

	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const startDate = this.getNodeParameter('startDate', i) as string;
		const endDate = this.getNodeParameter('endDate', i) as string;
		const qs: IDataObject = { startDate, endDate };

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
		return seamlessApiRequest.call(
			this,
			'GET',
			'/companies/research/poll',
			undefined,
			{
				requestIds,
			}
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
		return seamlessApiRequest.call(this, 'POST', '/campaigns', { name });
	}
	if (operation === 'get') {
		const id = this.getNodeParameter('campaignId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/campaigns/${id}`);
	}
	if (operation === 'getMany') {
		const qs: IDataObject = {};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) qs.searchText = searchText;
		const limit = this.getNodeParameter('limit', i, 50) as number;
		qs.limit = limit;
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
			body.emailAccountIds = (updateFields.emailAccountIds as string)
				.split(',')
				.map((s) => Number(s.trim()));
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
		const contactIds = (this.getNodeParameter('contactIds', i) as string)
			.split(',')
			.map((s) => Number(s.trim()));
		return seamlessApiRequest.call(
			this,
			'POST',
			`/campaigns/${id}/contacts`,
			{ contactIds }
		);
	}
	if (operation === 'removeContacts') {
		const id = this.getNodeParameter('campaignId', i) as number;
		const contactIds = (this.getNodeParameter('contactIds', i) as string)
			.split(',')
			.map((s) => Number(s.trim()));
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
			const batchSize = 100;
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
		qs.limit = this.getNodeParameter('limit', i) as number;
		qs.offset = 0;
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
		Object.assign(body, cleanObj(additionalFields));
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
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		return seamlessApiRequest.call(
			this,
			'PUT',
			`/campaigns/${campaignId}/steps/${stepId}`,
			cleanObj(updateFields)
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
		Object.assign(body, cleanObj(additionalFields));
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
		Object.assign(body, cleanObj(additionalFields));
		return seamlessApiRequest.call(this, 'POST', '/templates', body);
	}
	if (operation === 'get') {
		const id = this.getNodeParameter('templateId', i) as number;
		return seamlessApiRequest.call(this, 'GET', `/templates/${id}`);
	}
	if (operation === 'getMany') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const qs: IDataObject = {};
		const searchText = this.getNodeParameter('searchText', i, '') as string;
		if (searchText) qs.searchText = searchText;
		const type = this.getNodeParameter('type', i, '') as string;
		if (type) qs.type = type;

		if (returnAll) {
			return seamlessApiRequestAllItems.call(
				this,
				'GET',
				'/templates',
				undefined,
				qs
			);
		}
		qs.limit = this.getNodeParameter('limit', i) as number;
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
		const updateFields = this.getNodeParameter(
			'updateFields',
			i,
			{}
		) as IDataObject;
		return seamlessApiRequest.call(
			this,
			'PUT',
			`/templates/${id}`,
			cleanObj(updateFields)
		);
	}
	if (operation === 'delete') {
		const id = this.getNodeParameter('templateId', i) as number;
		await seamlessApiRequest.call(this, 'DELETE', `/templates/${id}`);
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
		Object.assign(body, cleanObj(additionalFields));
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
		Object.assign(body, cleanObj(additionalFields));
		return seamlessApiRequest.call(this, 'POST', '/emails/send', body);
	}
	if (operation === 'sendBulk') {
		const body: IDataObject = {
			from: this.getNodeParameter('from', i) as string,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		Object.assign(body, cleanObj(additionalFields));
		const filters = this.getNodeParameter('filters', i, '{}') as string;
		if (filters && filters !== '{}') body.filters = JSON.parse(filters);
		return seamlessApiRequest.call(this, 'POST', '/emails/send-bulk', body);
	}
	if (operation === 'preview') {
		const body: IDataObject = {
			to: this.getNodeParameter('to', i) as string,
		};
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			i,
			{}
		) as IDataObject;
		Object.assign(body, cleanObj(additionalFields));
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
		Object.assign(body, cleanObj(additionalFields));
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
			const batchSize = 100;
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
		qs.limit = this.getNodeParameter('limit', i) as number;
		qs.offset = 0;
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

// ─── Intent ─────────────────────────────────────────────────────────────────

async function executeIntent(
	this: IExecuteFunctions,
	operation: string,
	i: number
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getCategories') {
		return seamlessApiRequest.call(this, 'GET', '/intent/categories');
	}
	if (operation === 'searchTopics') {
		const qs: IDataObject = {};
		const category = this.getNodeParameter('category', i, '') as string;
		if (category) qs.category = category;
		const q = this.getNodeParameter('q', i, '') as string;
		if (q) qs.q = q;
		return seamlessApiRequest.call(
			this,
			'GET',
			'/intent/topics',
			undefined,
			qs
		);
	}
	if (operation === 'searchCompanies') {
		const topics = (this.getNodeParameter('topics', i) as string)
			.split(',')
			.map((s) => s.trim());
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		if (returnAll) {
			const allItems: IDataObject[] = [];
			let page = 1;
			const batchSize = 100;
			let hasMore = true;
			while (hasMore) {
				const body: IDataObject = { topics, page, limit: batchSize };
				const resp = await seamlessApiRequest.call(
					this,
					'POST',
					'/intent/search',
					body
				);
				const items = (resp.data || resp) as IDataObject[];
				if (Array.isArray(items) && items.length > 0) {
					allItems.push(...items);
					page++;
					hasMore = items.length === batchSize;
				} else {
					hasMore = false;
				}
			}
			return allItems;
		}

		const body: IDataObject = {
			topics,
			limit: this.getNodeParameter('limit', i) as number,
		};
		return seamlessApiRequest.call(this, 'POST', '/intent/search', body);
	}
	if (operation === 'getScore') {
		const domain = this.getNodeParameter('domain', i) as string;
		const topics = (this.getNodeParameter('topics', i) as string)
			.split(',')
			.map((s) => s.trim());
		return seamlessApiRequest.call(this, 'POST', '/intent/score', {
			domain,
			topics,
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
			const limit = 100;
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
		qs.limit = this.getNodeParameter('limit', i) as number;
		qs.offset = 0;
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
		qs.limit = this.getNodeParameter('limit', i) as number;
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
					{ name: 'Intent', value: 'intent' },
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
			...intentOperations,
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
			...intentFields,
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
				} else if (resource === 'intent') {
					responseData = await executeIntent.call(this, operation, i);
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
					responseData = await seamlessApiRequest.call(
						this,
						'GET',
						'/email-footers'
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
