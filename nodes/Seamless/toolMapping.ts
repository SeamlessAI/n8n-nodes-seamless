/**
 * Maps n8n resource/operation pairs to MCP tool names.
 * Used at runtime by seamlessMcpCall and by the GitHub Action sync
 * workflow to validate that every MCP tool in the catalog has a
 * corresponding n8n resource/operation.
 */
export const TOOL_MAP: Record<string, Record<string, string>> = {
	contact: {
		search: 'search_contacts',
		research: 'research_contacts',
		getMany: 'get_my_contacts',
		pollResearch: 'poll_contact_research',
	},
	company: {
		search: 'search_companies',
		research: 'research_companies',
		getMany: 'get_my_companies',
		pollResearch: 'poll_company_research',
	},
	list: {
		create: 'create_list',
		get: 'get_lists',
		getMany: 'get_lists',
		update: 'update_list',
		delete: 'delete_list',
	},
	credits: {
		getCredits: 'get_credits',
	},
	campaign: {
		create: 'create_campaign',
		get: 'list_campaigns',
		getMany: 'list_campaigns',
		update: 'update_campaign',
		delete: 'delete_campaign',
		executeAction: 'execute_campaign_action',
		clone: 'clone_campaign',
		addContacts: 'add_contacts_to_campaign',
		removeContacts: 'remove_contacts_from_campaign',
		getContacts: 'list_campaign_contacts',
		getMetrics: 'get_campaign_metrics',
	},
	campaignStep: {
		create: 'create_campaign_step',
		getMany: 'list_campaign_steps',
		update: 'update_campaign_step',
		delete: 'delete_campaign_step',
		executeAction: 'execute_campaign_step_action',
	},
	savedSearch: {
		create: 'create_saved_search',
		get: 'list_saved_searches',
		getMany: 'list_saved_searches',
		update: 'update_saved_search',
		delete: 'delete_saved_search',
	},
	template: {
		create: 'create_template',
		get: 'list_templates',
		getMany: 'list_templates',
		update: 'update_template',
		delete: 'delete_template',
	},
	email: {
		createDraft: 'create_email_draft',
		getDraft: 'get_email_draft',
		updateDraft: 'update_email_draft',
		sendDraft: 'send_email_draft',
		send: 'send_email',
		sendBulk: 'send_bulk_email',
		preview: 'send_email_preview',
	},
	task: {
		create: 'create_task',
		get: 'list_tasks',
		getMany: 'list_tasks',
		update: 'update_task',
		delete: 'delete_task',
		executeAction: 'execute_task_action',
	},
	call: {
		log: 'log_call',
		getDispositions: 'list_call_dispositions',
		getSentiments: 'list_call_sentiments',
	},
	activity: {
		getMany: 'get_activity_feed',
	},
	emailAccount: {
		getMany: 'list_email_accounts',
	},
	emailFooter: {
		getMany: 'list_email_footers',
	},
};

/**
 * Look up the MCP tool name for a given n8n resource/operation pair.
 * Throws if no mapping exists.
 */
export function getToolName(resource: string, operation: string): string {
	const tool = TOOL_MAP[resource]?.[operation];
	if (!tool) throw new Error(`No MCP tool for ${resource}/${operation}`);
	return tool;
}

/**
 * Returns a flat set of all MCP tool names referenced by the node.
 * Duplicates (e.g. get + getMany mapping to the same tool) are deduplicated.
 */
export function getAllMcpToolNames(): Set<string> {
	const names = new Set<string>();
	for (const ops of Object.values(TOOL_MAP)) {
		for (const toolName of Object.values(ops)) {
			names.add(toolName);
		}
	}
	return names;
}
