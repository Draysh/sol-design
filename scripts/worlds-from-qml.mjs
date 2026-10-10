#!/usr/bin/env node
// Writes src/lib/worlds.gen.ts from sol-quick's qml/Worlds.qml, so the web
// kit and the Qt kit know the same worlds: names, roles, colours, tilts, where
// each body sits in the photograph and on a sheet. Run it by hand after
// changing Worlds.qml and commit what it writes:
//
//     node scripts/worlds-from-qml.mjs [path/to/Worlds.qml]
//
// It reads the `rising`, `lit` and `table` objects (plain JavaScript inside
// QML) and evaluates them with `image(name)` giving back the photograph's
// name; worlds.ts turns names into this package's own pictures.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(process.argv[2] ?? resolve(here, '../../quick/qml/Worlds.qml'));
const target = resolve(here, '../src/lib/worlds.gen.ts');
const qml = readFileSync(source, 'utf8');

/** The `({ … })` object after `readonly property var <name>:`, as text. */
function objectOf(name) {
	const start = qml.indexOf(`readonly property var ${name}: (`);
	if (start < 0) throw new Error(`no "${name}" in ${source}`);
	const open = qml.indexOf('(', start);
	let depth = 0;
	for (let i = open; i < qml.length; i++) {
		const c = qml[i];
		if (c === '(' || c === '{' || c === '[') depth++;
		else if (c === ')' || c === '}' || c === ']') depth--;
		if (depth === 0) return qml.slice(open, i + 1);
	}
	throw new Error(`"${name}" doesn't end in ${source}`);
}

const image = (name) => name;
const rising = new Function(`return ${objectOf('rising')}`)();
const lit = new Function(`return ${objectOf('lit')}`)();
const table = new Function('image', 'rising', 'lit', `return ${objectOf('table')}`)(image, rising, lit);

const out = `// Written by scripts/worlds-from-qml.mjs from sol-quick's qml/Worlds.qml; don't edit by hand.
// Photographs are by name (\`image\`): worlds.ts gives each its picture.
import type { WorldData, Placement, Light } from './worlds.js';

export const rising: Placement = ${JSON.stringify(rising)};

export const lit: Light = ${JSON.stringify(lit)};

export const table: Record<string, WorldData> = ${JSON.stringify(table, null, '\t')};
`;
writeFileSync(target, out);
console.log(`${target} (${Object.keys(table).length} worlds from ${source})`);
