#!/usr/bin/env node
// Writes the Yozora look from sol-quick's qml/Theme.qml into this kit, so the
// web app and the desktop apps wear the same flavours and never drift:
//
// - in src/lib/styles/tokens.css, between its two "look-from-qml" lines: the
//   scale (type sizes, weights, tracking, spacing, sizes, corners, motion) and
//   every flavour (`yozoraLooks`: each world's, a moon's own, the light one)
//   as custom properties on `[data-flavour='<id>']`, Saturn's on :root too;
// - src/lib/look.gen.ts: what a script needs of each flavour (its sky, stars,
//   motif, framing, Japanese name and kanji) and every world's name in Japanese.
//
// Run it by hand after changing Theme.qml and commit what it writes:
//
//     node scripts/look-from-qml.mjs [path/to/Theme.qml]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(process.argv[2] ?? resolve(here, '../../quick/qml/Theme.qml'));
const tokens = resolve(here, '../src/lib/styles/tokens.css');
const script = resolve(here, '../src/lib/look.gen.ts');
const qml = readFileSync(source, 'utf8');

/** The `({ … })` after `readonly property var <name>:`, as text. */
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

// Qt.rgba as a colour object, as QML has it.
const Qt = { rgba: (r, g, b, a) => ({ r, g, b, a }) };
const looks = new Function('Qt', `return ${objectOf('yozoraLooks')}`)(Qt);
const names = new Function(`return ${objectOf('yozoraNames')}`)();

/** A number of the scale: `readonly property int|real <name>: …`, the last number on its line (a picture's calm 0 is not the screen's). */
function scalar(name) {
	const m = new RegExp(`readonly property (?:int|real) ${name}: ([^\\n]*)`).exec(qml);
	if (!m) throw new Error(`no "${name}" in ${source}`);
	const numbers = m[1].match(/-?\d+(?:\.\d+)?/g);
	if (!numbers) throw new Error(`"${name}" has no number in ${source}`);
	return Number(numbers[numbers.length - 1]);
}

/** A curve: `readonly property easingCurve <name>`, as CSS. */
function curve(name) {
	const m = new RegExp(`readonly property easingCurve ${name}: ([^\\n]*)`).exec(qml);
	if (!m) throw new Error(`no "${name}" in ${source}`);
	const bezier = /bezierCurve: \[([^\]]*)\]/.exec(m[1]);
	if (bezier) return `cubic-bezier(${bezier[1].split(',').slice(0, 4).map((n) => Number(n)).join(', ')})`;
	// Qt's named curves the kit uses, as CSS draws them.
	if (/InOutSine/.test(m[1])) return 'cubic-bezier(0.37, 0, 0.63, 1)';
	throw new Error(`"${name}" is a curve this script doesn't know`);
}

const kebab = (s) => s.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();

// The scale, by unit.
const px = ['textXs', 'textS', 'textM', 'textL', 'textXl', 'text2xl', 'textHero', 'textLede', 'textFigure',
	's1', 's2', 's3', 's4', 's5', 's6', 's7', 'target', 'control', 'sidebar', 'rail', 'navHeight',
	'radiusS', 'radiusM', 'radius', 'radiusL', 'radiusSpeech', 'hudCut', 'hudBracket'];
const plain = ['weightDisplay', 'weightValue', 'weightName', 'weightLabel'];
const em = ['trackRows', 'trackName', 'trackDisplay', 'trackCaps', 'trackLabel', 'trackHud'];
// (`hold`, a beat's hold, is `--beat-hold`: a flavour's `--hold` is how much of its still the grade keeps.)
const ms = ['snap', 'flicker', 'lock', 'fade', 'settle', 'turn', 'count', 'rise', 'speak', 'wash', 'hit', 'hold',
	'sweep', 'drift', 'crossing', 'scene'];
const curves = ['ease', 'easeOut', 'spring', 'easeInOut', 'easeIn'];
const varName = (n) => (n === 'hold' ? 'beat-hold' : /^s\d$/.test(n) ? `s-${n.slice(1)}` : kebab(n));
/** A page turn's own beats, a share of `turn`: `readonly property int <name>: Math.round(turn * <share>)`. */
function share(name) {
	const m = new RegExp(`readonly property int ${name}: Math\\.round\\(turn \\* ([0-9.]+)\\)`).exec(qml);
	if (!m) throw new Error(`no "${name}" as a share of the turn in ${source}`);
	return Math.round(scalar('turn') * Number(m[1]));
}

/**
 * Each flavour's beat (`Theme.beat`), by its motif: how things arrive on its
 * pages and which way its page turns. Read from the `if (m === "<motif>")
 * return { … }` lines and the last `return { … }` (every other motif's).
 */
const beatText = (() => {
	const start = qml.indexOf('readonly property var beat: {');
	if (start < 0) throw new Error(`no "beat" in ${source}`);
	return qml.slice(start, qml.indexOf('\n    }', start));
})();
const ms0 = (n) => n;
function beatOf(motif) {
	const own = new RegExp(`if \\(m === "${motif}"\\) return (\\{[^\\n]*\\})`).exec(beatText);
	const rest = /\n\s*return (\{[^\n]*\})/.exec(beatText);
	const body = (own ?? rest)?.[1];
	if (!body) throw new Error(`no beat for "${motif}" in ${source}`);
	return new Function('ms', 'easeOut', 'spring', `return (${body})`)(ms0, 'easeOut', 'spring');
}
const scale = [
	...px.map((n) => `\t--${varName(n)}: ${scalar(n)}px;`),
	...plain.map((n) => `\t--${varName(n)}: ${scalar(n)};`),
	...em.map((n) => `\t--${varName(n)}: ${scalar(n)}em;`),
	...ms.map((n) => `\t--${varName(n)}: ${scalar(n)}ms;`),
	`\t--turn-cover: ${share('turnCover')}ms;`,
	`\t--turn-reveal: ${share('turnReveal')}ms;`,
	...curves.map((n) => `\t--${varName(n)}: ${curve(n)};`)
];

// ---- Colours ----------------------------------------------------------------
const hex = (s) => {
	const m = /^#([0-9a-f]{6})$/i.exec(s);
	if (!m) throw new Error(`"${s}" isn't a colour this script reads`);
	const n = parseInt(m[1], 16);
	return { r: (n >> 16) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 };
};
const colour = (c) => (typeof c === 'string' ? hex(c) : c);
const byte = (v) => Math.round(v * 255);
const round = (v) => Math.round(v * 1000) / 1000;
/** A colour as CSS: #rrggbb when whole, else rgb(r g b / a); with `alpha`, at that alpha. */
function css(c, alpha) {
	const k = colour(c);
	const a = alpha ?? k.a;
	if (a >= 1) return '#' + [k.r, k.g, k.b].map((v) => byte(v).toString(16).padStart(2, '0')).join('');
	return `rgb(${byte(k.r)} ${byte(k.g)} ${byte(k.b)} / ${round(a)})`;
}
const triple = (c) => [colour(c).r, colour(c).g, colour(c).b].map(byte).join(' ');
/** `over` laid on `under` at `alpha` (Qt.tint). */
function tint(under, over, alpha) {
	const u = colour(under);
	const o = colour(over);
	return { r: u.r + (o.r - u.r) * alpha, g: u.g + (o.g - u.g) * alpha, b: u.b + (o.b - u.b) * alpha, a: 1 };
}

/** One flavour's custom properties, worked out as Theme.qml works its tokens out. */
function flavour(f) {
	const light = !!f.light;
	const p = {
		'color-scheme': light ? 'light' : 'dark',
		ground: css(f.ground),
		glass: css(f.glass),
		edge: css(f.edge),
		accent: css(f.accent),
		second: css(f.second),
		seal: css(f.seal),
		bubble: css(f.bubble),
		primary: css(f.primary ?? f.accent),
		dim: css(f.dim ?? f.ground),
		// The chrome over a page (the rail, a band): the ground a little see-through, or a light flavour's frost.
		deep: light ? css(f.glass, 0.92) : css(f.ground, 0.86),
		// What glass blurred live lays over the page (a menu, a dialog): the ground, or the frost whole.
		frost: light ? css(f.glass, 1) : css(f.ground),
		ink: triple(light ? f.ground : '#ffffff'),
		text: css(f.text),
		'text-bright': css(light ? f.bright : '#ffffff'),
		'text-value': css(tint(f.quiet, f.text, 0.5)),
		'text-quiet': css(f.quiet),
		'text-faint': css(f.faint),
		'text-inverse': css(light ? '#ffffff' : f.ground),
		'hud-text': css(light ? f.bright : '#ffffff'),
		'hud-quiet': light ? css(f.quiet) : css('#ffffff', 0.72),
		'hud-faint': light ? css(f.faint) : css('#ffffff', 0.45),
		danger: light ? '#c8361f' : '#ff6b5a',
		'danger-text': light ? '#b3301b' : '#ff8a7a',
		ok: light ? '#1d7442' : '#8ee6b0',
		'art-text': light ? '#ffffff' : css(f.text),
		'art-quiet': light ? css('#ffffff', 0.86) : css(f.quiet),
		'art-faint': light ? css('#ffffff', 0.66) : css(f.faint),
		'art-accent': css(f.artAccent ?? f.accent),
		'art-second': css(f.artSecond ?? f.second),
		'art-line': light ? css('#ffffff', 0.3) : css(f.edge, 0.2),
		hold: f.hold ?? 0,
		shade: f.shade ?? 0,
		pool: f.pool ?? 0,
		haze: f.haze ? css(f.haze) : 'transparent',
		'frame-zoom': f.frame ? f.frame[0] : 1,
		'frame-across': f.frame ? f.frame[1] : 0.5,
		// Its beat: things arriving together come a stagger apart, each taking `arrive`.
		stagger: `${beatOf(f.motif).stagger}ms`,
		arrive: `${beatOf(f.motif).arrive}ms`
	};
	f.sky.forEach((c, i) => (p[`sky-${i}`] = css(c)));
	f.grade.forEach(([r, g, b, a], i) => (p[`grade-${i}`] = css({ r, g, b, a })));
	return Object.entries(p).map(([k, v]) => (k === 'color-scheme' ? `\t${k}: ${v};` : `\t--${k}: ${v};`));
}

const ids = Object.keys(looks);
const block = [
	'/* ---- look-from-qml: written by scripts/look-from-qml.mjs from sol-quick\'s qml/Theme.qml; don\'t edit by hand ---- */',
	'',
	'/* The scale: type, weights, tracking, spacing, sizes, corners and motion, as Theme.qml has them. */',
	':root {',
	...scale,
	'}',
	'',
	'/* The flavours (Theme.yozoraLooks): each world\'s, a moon\'s own; Saturn\'s is Sol\'s and the default. */',
	...ids.flatMap((id) => [
		`${id === 'saturn' ? ":root,\n" : ''}[data-flavour='${id}'] {`,
		...flavour(looks[id]),
		'}',
		''
	]),
	'/* ---- end of look-from-qml ---- */'
].join('\n');

const css0 = readFileSync(tokens, 'utf8');
const begin = css0.indexOf('/* ---- look-from-qml:');
const endMark = '/* ---- end of look-from-qml ---- */';
const end = css0.indexOf(endMark);
if (begin < 0 || end < 0) throw new Error(`tokens.css has no look-from-qml lines to write between`);
writeFileSync(tokens, css0.slice(0, begin) + block + css0.slice(end + endMark.length));

// ---- For scripts ------------------------------------------------------------
const pick = (f) => ({
	id: f.id,
	jp: f.jp,
	glyph: f.glyph,
	navigator: f.navigator,
	motif: f.motif,
	film: f.film,
	light: !!f.light,
	stars: !!f.stars,
	rain: f.rain ?? 0,
	sky: f.sky.map((c) => css(c)),
	frame: f.frame ?? null,
	turn: beatOf(f.motif).turn
});
const ts = `// Written by scripts/look-from-qml.mjs from sol-quick's qml/Theme.qml; don't edit by hand.
// The colours are in tokens.css; this is what a script needs of each flavour.

/** A flavour, as \`Theme.yozoraLooks\` has it. */
export interface FlavourData {
	id: string;
	/** Its name in Japanese, and the one kanji the rail's diamond shows. */
	jp: string;
	glyph: string;
	/** The character who says a page's line in the apps. */
	navigator: string;
	/** What its panels carry: "dusk", "shrine", "neon" or "summer". */
	motif: string;
	/** Whose stills it stands on. */
	film: string;
	/** Frosted glass with dark words (Terra's noon). */
	light: boolean;
	/** Stars on its drawn sky. */
	stars: boolean;
	/** Rain over its ground, 0 to 1. */
	rain: number;
	/** The drawn sky without a still, top to bottom. */
	sky: string[];
	/** How its stills are framed, \`[zoom, across]\`, or whole and centred. */
	frame: [number, number] | null;
	/** Which way its pages turn: "slice" (Neptune's glitch), "cut" (a film's), "ink" (Mercury's) or "sweep" (Terra's sunlight). */
	turn: 'slice' | 'cut' | 'ink' | 'sweep';
}

export const flavours: Record<string, FlavourData> = ${JSON.stringify(Object.fromEntries(ids.map((id) => [id, pick(looks[id])])), null, '\t')};

/** Every world's name in Japanese, a moon's too. */
export const names: Record<string, string> = ${JSON.stringify(names, null, '\t')};
`;
writeFileSync(script, ts);
console.log(`${tokens} and ${script} (${ids.length} flavours from ${source})`);
