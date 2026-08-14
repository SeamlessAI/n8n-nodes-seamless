#!/usr/bin/env node

/**
 * Runs the same rule set as `npx @n8n/scan-community-package` against the
 * working tree instead of a published npm release.
 *
 * The published scanner lints two legs: the provenance-attested source
 * checkout (`SOURCE_FILE_PATTERNS`) and the packed tarball (compiled `.js`
 * plus `package.json`). Both are reproduced here — the source leg reads the
 * repo directly, the tarball leg reads a fresh `npm pack`. Provenance itself
 * cannot be checked before publishing and is the only skipped step.
 *
 * Usage:
 *   node scripts/scan-community-package.mjs             build, pack, scan
 *   node scripts/scan-community-package.mjs --fix       autofix the source leg
 *   node scripts/scan-community-package.mjs --skip-build  reuse existing dist/
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import glob from 'fast-glob';

import {
	analyzePackage,
	buildScanConfig,
	SOURCE_FILE_PATTERNS,
} from '@n8n/scan-community-package/scanner/scanner.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const skipBuild = args.includes('--skip-build');

const run = (command, commandArgs, cwd) => {
	const result = spawnSync(command, commandArgs, { cwd, stdio: 'pipe', encoding: 'utf8' });
	if (result.status !== 0) {
		throw new Error(
			`${command} ${commandArgs.join(' ')} failed:\n${result.stderr || result.stdout}`,
		);
	}
	return result.stdout;
};

const fixSource = async () => {
	const eslint = new ESLint({
		cwd: repoRoot,
		allowInlineConfig: false,
		overrideConfigFile: true,
		overrideConfig: await buildScanConfig(),
		fix: true,
	});

	const files = glob.sync(SOURCE_FILE_PATTERNS, {
		cwd: repoRoot,
		absolute: true,
		ignore: ['node_modules/**', '**/package-lock.json'],
	});

	const results = await eslint.lintFiles(files);
	await ESLint.outputFixes(results);

	const fixed = results.filter((result) => result.output).length;
	console.log(`Applied autofixes to ${fixed} file(s).`);

	const remaining = results.reduce((total, result) => total + result.errorCount, 0);
	console.log(`${remaining} error(s) remain and need a manual fix.`);
	if (remaining > 0) {
		const formatter = await eslint.loadFormatter('stylish');
		console.log(await formatter.format(results));
	}
};

const packToTempDir = () => {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'n8n-scan-'));
	const tarball = run('npm', ['pack', '--silent', '--pack-destination', tempDir], repoRoot).trim();
	const extractDir = path.join(tempDir, 'package-root');
	fs.mkdirSync(extractDir, { recursive: true });
	run('tar', ['-xzf', tarball, '-C', extractDir, '--strip-components=1'], tempDir);
	return { tempDir, packageDir: extractDir };
};

const report = (label, result) => {
	if (result.passed) {
		console.log(`✅ ${label}: no violations`);
		return true;
	}
	console.log(`❌ ${label}: ${result.message}`);
	if (result.details) console.log(result.details);
	return false;
};

if (shouldFix) {
	await fixSource();
	process.exit(0);
}

if (!skipBuild) {
	console.log('Building package...');
	run('npm', ['run', 'build'], repoRoot);
}

const { tempDir, packageDir } = packToTempDir();
try {
	const sourcePassed = report('source', await analyzePackage(repoRoot, SOURCE_FILE_PATTERNS));
	const distPassed = report(
		'packed tarball',
		await analyzePackage(packageDir, ['**/*.js', 'package.json']),
	);

	if (!sourcePassed || !distPassed) {
		console.log('\nPackage would fail n8n community-package review.');
		process.exit(1);
	}

	console.log('\nPackage passes all n8n community-package checks (provenance excluded).');
} finally {
	fs.rmSync(tempDir, { recursive: true, force: true });
}
