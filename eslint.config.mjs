import js from '@eslint/js';
import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';
import tseslint from 'typescript-eslint';

// Mirrors the config used by the n8n community node submission scanner, so lint
// failures here are the same ones that would block a release.
export default tseslint.config(
	{ ignores: ['dist/**', 'node_modules/**'] },
	{
		files: ['**/*.ts'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			n8nCommunityNodesPlugin.configs.recommended,
		],
		rules: { 'no-console': 'error' },
	},
	{ plugins: { 'n8n-nodes-base': n8nNodesBase } },
	{
		files: ['package.json'],
		extends: [n8nCommunityNodesPlugin.configs.recommended],
		rules: { ...n8nNodesBase.configs.community.rules },
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: { extraFileExtensions: ['.json'] },
		},
	},
	{
		files: ['credentials/**/*.ts'],
		rules: {
			...n8nNodesBase.configs.credentials.rules,
			// Not valid for community nodes
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
			// community-nodes/credential-password-field is more accurate
			'n8n-nodes-base/cred-class-field-type-options-password-missing': 'off',
		},
	},
	{
		files: ['nodes/**/*.ts'],
		rules: {
			...n8nNodesBase.configs.nodes.rules,
			// Inputs and outputs can be enums instead of the string "main"
			'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
			'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
			// The Seamless API does impose maximums, so maxValue is valid
			'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
		},
	}
);
