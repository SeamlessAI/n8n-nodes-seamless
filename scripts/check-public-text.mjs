#!/usr/bin/env node

/**
 * Flags text that must not appear in this public repo: Jira keys and links,
 * private Seamless repo names and paths, private commit SHAs, and internal
 * server identifiers. Pattern-based, so it cannot catch everything; see
 * .cursor/skills/public-repo-text/SKILL.md for the full rules.
 *
 * Usage:
 *   node scripts/check-public-text.mjs <file>...   check files
 *   node scripts/check-public-text.mjs < text.md    check stdin
 *
 * Patterns that would leak private names if published here (private repo
 * name and paths, server identifiers) come from PUBLIC_TEXT_PATTERNS, one
 * regex per line.
 *
 * Exits 1 when anything is found.
 */

import { readFileSync } from 'node:fs';

const RULES = [
	{ name: 'Jira key', pattern: /\b(?:SEAM|SPR|TC)-\d+\b/g },
	{ name: 'Atlassian link', pattern: /\b[\w-]+\.atlassian\.net\b/gi },
	{
		name: 'upstream commit SHA',
		// Hyphen lookarounds skip public names like n8n-nodes-seamless and @seamless-oss.
		pattern:
			/(?<![\w-])(?:seamless|upstream|source)(?![\w-])[^\n]{0,60}?\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/gi,
		ignore: /\bgithub\.com\/SeamlessAI\/n8n-nodes-seamless\/\S*/gi,
	},
	...privateRules(process.env.PUBLIC_TEXT_PATTERNS),
];

function privateRules(source = '') {
	if (!source.trim()) {
		console.warn(
			'PUBLIC_TEXT_PATTERNS is not set; private name, path and identifier checks skipped.',
		);
		return [];
	}
	return source.split('\n').reduce((rules, line, index) => {
		const trimmed = line.trim();
		if (!trimmed) return rules;
		try {
			rules.push({ name: 'private pattern', pattern: new RegExp(trimmed, 'gi') });
		} catch {
			// CI logs are public, so never echo the pattern itself.
			console.error(`PUBLIC_TEXT_PATTERNS line ${index + 1} is not a valid regex.`);
			process.exit(2);
		}
		return rules;
	}, []);
}

function check(label, text) {
	const findings = [];
	text.split('\n').forEach((line, index) => {
		for (const { name, pattern, ignore } of RULES) {
			const target = ignore ? line.replace(ignore, ' ') : line;
			for (const match of target.matchAll(pattern)) {
				findings.push(`${label}:${index + 1}: ${name}: ${match[0]}`);
			}
		}
	});
	return findings;
}

const files = process.argv.slice(2);
const inputs = files.length
	? files.map((file) => [file, readFileSync(file, 'utf8')])
	: [['stdin', readFileSync(0, 'utf8')]];

const findings = inputs.flatMap(([label, text]) => check(label, text));

if (findings.length) {
	console.error(findings.join('\n'));
	console.error(
		`\n${findings.length} finding(s). This repo is public: remove private details before posting. See .cursor/skills/public-repo-text/SKILL.md.`,
	);
	process.exit(1);
}

console.log('No private details found.');
