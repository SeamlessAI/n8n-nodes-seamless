import { DynamicStructuredTool } from '@langchain/core/tools';
import { StructuredToolkit } from 'n8n-core';
import {
	type IDataObject,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';
import { z } from 'zod';

interface McpTool {
	name: string;
	description?: string;
	inputSchema?: IDataObject;
}

/**
 * Converts a JSON Schema object to a Zod schema, matching n8n's internal
 * pattern for MCP tools. Handles nested objects, arrays, and primitives.
 */
function jsonSchemaPropertyToZod(prop: IDataObject): z.ZodTypeAny {
	const type = prop.type as string | undefined;
	const description = prop.description as string | undefined;

	let schema: z.ZodTypeAny;

	switch (type) {
		case 'string':
			if (prop.enum && Array.isArray(prop.enum)) {
				const values = prop.enum as [string, ...string[]];
				schema = z.enum(values);
			} else {
				schema = z.string();
			}
			break;
		case 'number':
		case 'integer':
			schema = z.number();
			break;
		case 'boolean':
			schema = z.boolean();
			break;
		case 'array':
			if (prop.items && typeof prop.items === 'object') {
				schema = z.array(
					jsonSchemaPropertyToZod(prop.items as IDataObject)
				);
			} else {
				schema = z.array(z.any());
			}
			break;
		case 'object':
			schema = jsonSchemaToZodObject(prop);
			break;
		default:
			schema = z.any();
	}

	if (description) {
		schema = schema.describe(description);
	}

	return schema;
}

function jsonSchemaToZodObject(schema: IDataObject): z.ZodObject<z.ZodRawShape> {
	const properties = (schema.properties ?? {}) as Record<string, IDataObject>;
	const required = (schema.required ?? []) as string[];

	const shape: z.ZodRawShape = {};
	for (const [key, value] of Object.entries(properties)) {
		let field = jsonSchemaPropertyToZod(value);
		if (!required.includes(key)) {
			field = field.optional();
		}
		shape[key] = field;
	}

	return z.object(shape);
}

async function mcpRequest(
	helpers: ISupplyDataFunctions['helpers'],
	baseUrl: string,
	headers: Record<string, string>,
	method: string,
	params: IDataObject = {}
): Promise<IDataObject> {
	const body: IDataObject = {
		jsonrpc: '2.0',
		id: Date.now(),
		method,
		params,
	};

	const response = (await helpers.httpRequest({
		method: 'POST',
		url: baseUrl,
		body,
		headers: {
			'content-type': 'application/json',
			accept: 'application/json, text/event-stream',
			...headers,
		},
		timeout: 30_000,
	})) as IDataObject;

	if (response?.error) {
		const errorObj = response.error as IDataObject;
		throw new Error((errorObj.message as string) ?? 'Unknown MCP error');
	}

	return (response?.result ?? {}) as IDataObject;
}

async function listTools(
	helpers: ISupplyDataFunctions['helpers'] | ILoadOptionsFunctions['helpers'],
	baseUrl: string,
	headers: Record<string, string>
): Promise<McpTool[]> {
	const result = await mcpRequest(
		helpers as ISupplyDataFunctions['helpers'],
		baseUrl,
		headers,
		'tools/list'
	);
	const tools = result.tools as McpTool[] | undefined;
	return Array.isArray(tools) ? tools : [];
}

function resolveCredentials(credentials: IDataObject): {
	baseUrl: string;
	headers: Record<string, string>;
} {
	const baseUrl = String(
		credentials.baseUrl || 'https://mcp.seamless.ai/mcp'
	);
	const headers: Record<string, string> = {};
	if (credentials.apiKey) {
		headers.Token = String(credentials.apiKey);
	}
	return { baseUrl, headers };
}

function buildToolDescription(tool: McpTool): string {
	let desc = tool.description || tool.name;
	if (tool.inputSchema?.properties) {
		const props = tool.inputSchema.properties as Record<
			string,
			IDataObject
		>;
		const required = (tool.inputSchema.required as string[]) || [];
		const paramLines = Object.entries(props).map(([key, val]) => {
			const req = required.includes(key) ? ' (required)' : '';
			const type = val.type ? ` [${val.type}]` : '';
			const paramDesc = val.description ? `: ${val.description}` : '';
			return `  - ${key}${type}${req}${paramDesc}`;
		});
		desc += `\n\nInput (JSON object):\n${paramLines.join('\n')}`;
	}
	return desc;
}

function filterTools(
	tools: McpTool[],
	mode: string,
	includeTools: string[],
	excludeTools: string[]
): McpTool[] {
	if (mode === 'selected') {
		return tools.filter((t) => includeTools.includes(t.name));
	}
	if (mode === 'except') {
		return tools.filter((t) => !excludeTools.includes(t.name));
	}
	return tools;
}

export class SeamlessMcp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Seamless MCP',
		name: 'seamlessMcp',
		icon: 'file:seamless.svg',
		group: ['transform'],
		version: 1,
		description: 'Expose Seamless.ai MCP tools to an AI Agent',
		defaults: {
			name: 'Seamless MCP',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Tools'],
				Tools: ['Recommended Tools'],
			},
			resources: {
				primaryDocumentation: [{ url: 'https://docs.seamless.ai' }],
			},
		},
		inputs: [],
		outputs: [
			{
				type: NodeConnectionTypes.AiTool,
				displayName: 'Tools',
			},
		],
		credentials: [
			{
				name: 'seamlessApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Tools to Include',
				name: 'include',
				type: 'options',
				description:
					'Select which Seamless tools to expose to the AI Agent',
				default: 'all',
				options: [
					{
						name: 'All',
						value: 'all',
						description: 'Include all tools from the MCP server',
					},
					{
						name: 'Selected',
						value: 'selected',
						description: 'Only include the tools listed below',
					},
					{
						name: 'All Except',
						value: 'except',
						description:
							'Include all tools except those listed below',
					},
				],
			},
			{
				displayName: 'Tools to Include',
				name: 'includeTools',
				type: 'multiOptions',
				default: [],
				description: 'Choose which tools to expose to the AI Agent',
				typeOptions: {
					loadOptionsMethod: 'getTools',
				},
				displayOptions: {
					show: {
						include: ['selected'],
					},
				},
			},
			{
				displayName: 'Tools to Exclude',
				name: 'excludeTools',
				type: 'multiOptions',
				default: [],
				description: 'Choose which tools to hide from the AI Agent',
				typeOptions: {
					loadOptionsMethod: 'getTools',
				},
				displayOptions: {
					show: {
						include: ['except'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			async getTools(
				this: ILoadOptionsFunctions
			): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('seamlessApi');
				const { baseUrl, headers } = resolveCredentials(credentials);

				try {
					const tools = await listTools(
						this.helpers,
						baseUrl,
						headers
					);
					return tools.map((tool) => ({
						name: tool.description
							? `${tool.name} — ${tool.description}`
							: tool.name,
						value: tool.name,
						description: tool.description || '',
					}));
				} catch (error) {
					throw new NodeOperationError(
						this.getNode(),
						`Failed to load tools: ${(error as Error).message}`
					);
				}
			},
		},
	};

	async supplyData(
		this: ISupplyDataFunctions,
		itemIndex: number
	): Promise<SupplyData> {
		const credentials = await this.getCredentials('seamlessApi');
		const { baseUrl, headers } = resolveCredentials(credentials);

		const mode = this.getNodeParameter('include', itemIndex) as string;
		const includeTools = this.getNodeParameter(
			'includeTools',
			itemIndex,
			[]
		) as string[];
		const excludeTools = this.getNodeParameter(
			'excludeTools',
			itemIndex,
			[]
		) as string[];

		const allTools = await listTools(this.helpers, baseUrl, headers);
		const selectedTools = filterTools(
			allTools,
			mode,
			includeTools,
			excludeTools
		);

		if (!selectedTools.length) {
			throw new NodeOperationError(
				this.getNode(),
				'No tools available after filtering',
				{
					itemIndex,
					description:
						'Connected to the Seamless MCP server but no tools matched your selection.',
				}
			);
		}

		const dynamicTools = selectedTools.map((tool) => {
			const description = buildToolDescription(tool);
			const rawSchema = tool.inputSchema ?? {
				type: 'object',
				properties: {},
			};
			const zodSchema = jsonSchemaToZodObject(rawSchema as IDataObject);

			return new DynamicStructuredTool({
				name: tool.name,
				description,
				schema: zodSchema,
				func: async (args: IDataObject) => {
					const result = await mcpRequest(
						this.helpers,
						baseUrl,
						headers,
						'tools/call',
						{ name: tool.name, arguments: args }
					);

					const { content } = result;
					if (Array.isArray(content)) {
						return (content as IDataObject[])
							.map((c) =>
								c.type === 'text'
									? String(c.text)
									: JSON.stringify(c)
							)
							.join('\n');
					}

					return JSON.stringify(
						content ?? result.structuredContent ?? result
					);
				},
			});
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const toolkit = new StructuredToolkit(dynamicTools as any);

		return { response: toolkit };
	}
}
