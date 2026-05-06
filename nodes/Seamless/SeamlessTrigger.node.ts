import {
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IPollFunctions,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { seamlessMcpCall } from './GenericFunctions';

export class SeamlessTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Seamless Trigger',
		name: 'seamlessTrigger',
		icon: 'file:seamless.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when Seamless events occur',
		subtitle: '={{$parameter["triggerOn"]}}',
		defaults: { name: 'Seamless Trigger' },
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
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
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				required: true,
				default: 'contactResearched',
				options: [
					{
						name: 'New Activity Event',
						value: 'activityEvent',
						description:
							'Triggers when new engagement activity occurs',
					},
					{
						name: 'New Company Researched',
						value: 'companyResearched',
						description:
							'Triggers when a new company is researched',
					},
					{
						name: 'New Contact Researched',
						value: 'contactResearched',
						description:
							'Triggers when a new contact is researched',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node');
		const triggerOn = this.getNodeParameter('triggerOn') as string;
		const now = new Date().toISOString();
		const isManual = this.getMode() === 'manual';

		let toolName = '';
		const args: IDataObject = {};

		if (triggerOn === 'contactResearched') {
			toolName = 'get_my_contacts';
			if (isManual) {
				args.startDate = new Date(
					Date.now() - 30 * 24 * 60 * 60 * 1000,
				).toISOString();
				args.endDate = now;
				args.limit = 1;
			} else {
				args.startDate = (webhookData.lastTimeChecked as string) || now;
				args.endDate = now;
			}
		} else if (triggerOn === 'companyResearched') {
			toolName = 'get_my_companies';
			if (isManual) {
				args.startDate = new Date(
					Date.now() - 30 * 24 * 60 * 60 * 1000,
				).toISOString();
				args.endDate = now;
				args.limit = 1;
			} else {
				args.startDate = (webhookData.lastTimeChecked as string) || now;
				args.endDate = now;
			}
		} else if (triggerOn === 'activityEvent') {
			toolName = 'get_activity_feed';
			if (isManual) {
				args.limit = 1;
				args.offset = 0;
			} else {
				args.limit = 50;
				args.offset = 0;
			}
		}

		const response = await seamlessMcpCall.call(this, toolName, args);

		webhookData.lastTimeChecked = now;

		const records = (response.data ||
			response.results ||
			response) as IDataObject[];

		if (
			triggerOn === 'activityEvent' &&
			!isManual &&
			Array.isArray(records)
		) {
			const lastId = webhookData.lastActivityId as number | undefined;
			const filtered = lastId
				? records.filter((r) => (r.id as number) > lastId)
				: records;

			if (filtered.length > 0) {
				webhookData.lastActivityId = Math.max(
					...filtered.map((r) => r.id as number)
				);
				return [this.helpers.returnJsonArray(filtered)];
			}
			return null;
		}

		if (Array.isArray(records) && records.length > 0) {
			return [this.helpers.returnJsonArray(records)];
		}

		return null;
	}
}
