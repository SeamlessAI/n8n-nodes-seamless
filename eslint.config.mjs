import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		// The submission review scanner runs a newer
		// @n8n/eslint-plugin-community-nodes than @n8n/node-cli bundles, and the
		// newer rule rejects `usableAsTool` on trigger nodes while the bundled one
		// demands it. Trigger nodes cannot be invoked as AI tools, so follow the
		// scanner and turn the outdated local rule off for triggers.
		files: ['**/*Trigger.node.ts'],
		rules: { '@n8n/community-nodes/node-usable-as-tool': 'off' },
	},
];
