import { type INodeProperties } from 'n8n-workflow';

import { companyFields } from './CompanyDescription';
import { contactFields } from './ContactDescription';
import { retargetSearchFilterFields } from './searchShared';

export const AUTOPILOT_MAX_CONTACT_RESULTS = 10_000;
export const AUTOPILOT_MAX_COMPANY_RESULTS = 5_000;
export const AUTOPILOT_NAME_MAX_LENGTH = 200;
export const AUTOPILOT_MAX_LIST_IDS = 50;

const autopilotOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['autopilot'] } },
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				action: 'Cancel an autopilot',
				description:
					'Cancel a running Autopilot. Irreversible; the current batch may finish before the run stops. Already-researched records are kept and unused credits are restored within a few minutes.',
			},
			{
				name: 'Get Results URL',
				value: 'getResultsUrl',
				action: 'Get autopilot result download links',
				description:
					'Get presigned download URLs for the result CSV files of an Autopilot run. URLs expire in 300 seconds; call again for fresh links. File content is never streamed.',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get autopilot status',
				description:
					'Get status and progress for an Autopilot (automated search) run. Poll until isTerminal is true, then use Get Results URL to download the files.',
			},
			{
				name: 'Start',
				value: 'start',
				action: 'Start an autopilot',
				description:
					`Start a contact or company Autopilot: a long-running automated search that researches every matching record in the background. Consumes credits upfront for every requested result; unused credits are restored when the run finishes or is cancelled. Takes the same filters as Contact/Company Search (or a Saved Search ID); the total from that search is the ceiling for Results to Research (caps ${AUTOPILOT_MAX_CONTACT_RESULTS.toLocaleString('en-US')} contacts / ${AUTOPILOT_MAX_COMPANY_RESULTS.toLocaleString('en-US')} companies). One Autopilot per type runs at a time. Returns taskId and automatedSearchId immediately; poll with Get Status and download with Get Results URL.`,
			},
		],
		default: 'start',
	},
];

const autopilotRunIdField = (operations: string[]): INodeProperties => ({
	displayName: 'Autopilot Run ID',
	name: 'automatedSearchId',
	type: 'number',
	default: 0,
	required: true,
	typeOptions: { minValue: 1 },
	description:
		'The automatedSearchId returned by Start (also shown as the Autopilot ID in the Seamless app)',
	displayOptions: {
		show: { resource: ['autopilot'], operation: operations },
	},
});

const autopilotFields: INodeProperties[] = [
	// ------ Start ------
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: 'contact',
		required: true,
		description:
			'Autopilot run type. Only filters valid for the chosen type are accepted.',
		options: [
			{ name: 'Company', value: 'company' },
			{ name: 'Contact', value: 'contact' },
		],
		displayOptions: {
			show: { resource: ['autopilot'], operation: ['start'] },
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. VP Sales - SaaS - Texas',
		description: `Unique name for this Autopilot run (max ${AUTOPILOT_NAME_MAX_LENGTH} characters)`,
		displayOptions: {
			show: { resource: ['autopilot'], operation: ['start'] },
		},
	},
	{
		displayName: 'Results to Research',
		name: 'numResultsExpected',
		type: 'number',
		default: 100,
		required: true,
		typeOptions: { minValue: 1, maxValue: AUTOPILOT_MAX_CONTACT_RESULTS },
		description: `Number of contacts to research. Credits for this many results are consumed upfront; use the total from the matching Contact Search as the ceiling. Max ${AUTOPILOT_MAX_CONTACT_RESULTS.toLocaleString('en-US')}.`,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['start'],
				type: ['contact'],
			},
		},
	},
	{
		displayName: 'Results to Research',
		name: 'numResultsExpected',
		type: 'number',
		default: 100,
		required: true,
		typeOptions: { minValue: 1, maxValue: AUTOPILOT_MAX_COMPANY_RESULTS },
		description: `Number of companies to research. Credits for this many results are consumed upfront; use the total from the matching Company Search as the ceiling. Max ${AUTOPILOT_MAX_COMPANY_RESULTS.toLocaleString('en-US')}.`,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['start'],
				type: ['company'],
			},
		},
	},
	{
		displayName: 'List IDs',
		name: 'listIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123,456',
		description: `Comma-separated IDs of lists (tags) to add researched records to (max ${AUTOPILOT_MAX_LIST_IDS}). IDs come from List > Get Many.`,
		displayOptions: {
			show: { resource: ['autopilot'], operation: ['start'] },
		},
	},
	{
		displayName: 'Auto Import to CRM',
		name: 'autoImportToCrm',
		type: 'boolean',
		default: false,
		description:
			'Whether to auto-import researched records to a connected CRM. Leave off unless a CRM is connected to the account.',
		displayOptions: {
			show: { resource: ['autopilot'], operation: ['start'] },
		},
	},
	// Same filters as Contact Search / Company Search, minus paging; which set
	// shows depends on Type. Set Saved Search ID (in Additional Fields) to run
	// a saved search instead of inline filters.
	...retargetSearchFilterFields(contactFields, {
		resource: ['autopilot'],
		operation: ['start'],
		type: ['contact'],
	}),
	...retargetSearchFilterFields(companyFields, {
		resource: ['autopilot'],
		operation: ['start'],
		type: ['company'],
	}),
	// ------ Get Status / Get Results URL / Cancel ------
	autopilotRunIdField(['getStatus', 'getResultsUrl', 'cancel']),
	{
		displayName: 'File Version',
		name: 'fileVersion',
		type: 'options',
		default: 'clean',
		description:
			'Which result files to link: clean (researched records) or raw',
		options: [
			{ name: 'Clean', value: 'clean' },
			{ name: 'Raw', value: 'raw' },
		],
		displayOptions: {
			show: { resource: ['autopilot'], operation: ['getResultsUrl'] },
		},
	},
];

export { autopilotOperations, autopilotFields };
