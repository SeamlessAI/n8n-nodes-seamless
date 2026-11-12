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
 * Exits 1 when anything is found.
 */

import { readFileSync } from 'node:fs';

const RULES = [
	{ name: 'Jira key', pattern: /\b(?:SEAM|SPR|TC)-\d+\b/g },
	{ name: 'Atlassian link', pattern: /\b[\w-]+\.atlassian\.net\b/gi },
	{ name: 'private repo name', pattern: /\bSeamlessAI\/seamless\b(?!-)/gi },
	{
		name: 'private repo path',
		pattern:
			/\b(?:modules\/(?:agents|configs|core|db|node-services|react-core|test-utils|types|ui)|packages\/(?:admin|client|contrib-network|docs|seamless-ai|seamless-bot|server-mcp))\//g,
	},
	{
		name: 'upstream commit SHA',
		pattern:
			/\b(?:seamless|upstream|source)\b[^\n]{0,60}?\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/gi,
	},
	{ name: 'internal server identifier', pattern: /\b(?:OrgApi|publicAPI)\.\w+/g },
];

function check(label, text) {
	const findings = [];
	text.split('\n').forEach((line, index) => {
		for (const { name, pattern } of RULES) {
			for (const match of line.matchAll(pattern)) {
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
