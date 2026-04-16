import { type INodeProperties } from 'n8n-workflow';

const callOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['call'] } },
		options: [
			{
				name: 'Get Dispositions',
				value: 'getDispositions',
				action: 'Get call dispositions',
				description: 'Retrieve available call disposition options',
			},
			{
				name: 'Get Sentiments',
				value: 'getSentiments',
				action: 'Get call sentiments',
				description: 'Retrieve available call sentiment options',
			},
			{
				name: 'Log',
				value: 'log',
				action: 'Log call',
				description: 'Log a completed call for a contact',
			},
		],
		default: 'log',
	},
];

const callFields: INodeProperties[] = [
	// ------ Log ------
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		default: 0,
		required: true,
		description: 'The contact the call was made to',
		displayOptions: { show: { resource: ['call'], operation: ['log'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['call'], operation: ['log'] } },
		options: [
			{
				displayName: 'Call Disposition ID',
				name: 'callDispositionId',
				type: 'number',
				default: 0,
				description:
					'The disposition ID (use Get Dispositions to find valid IDs)',
			},
			{
				displayName: 'Call Script',
				name: 'callScript',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Call Sentiment ID',
				name: 'callSentimentId',
				type: 'number',
				default: 0,
				description:
					'The sentiment ID (use Get Sentiments to find valid IDs)',
			},
			{
				displayName: 'Called At',
				name: 'calledAt',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Duration (ms)',
				name: 'durationMs',
				type: 'number',
				default: 0,
				description: 'Call duration in milliseconds',
			},
			{
				displayName: 'From Number',
				name: 'fromNumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'To Number',
				name: 'toNumber',
				type: 'string',
				default: '',
			},
		],
	},
];

export { callOperations, callFields };
