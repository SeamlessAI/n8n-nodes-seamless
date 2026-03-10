import tseslint from 'typescript-eslint';
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
	{ ignores: ['dist/**', 'node_modules/**'] },
	...tseslint.configs.recommended,
	{
		files: ['**/*.ts'],
		plugins: { 'n8n-nodes-base': n8nNodesBase },
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_' },
			],
		},
	},
];
