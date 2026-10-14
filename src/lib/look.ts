import { flavours, names, type FlavourData } from './look.gen.js';
import { table } from './worlds.gen.js';

/*
 * The Yozora look's rules that need a script, as sol-quick's Theme.qml has
 * them: which flavour a world wears, its name in Japanese, which still a
 * page stands on, when words are set in capitals, in outline capitals or
 * as a caption, and when Japanese is long. The colours are CSS
 * (`tokens.css`, `data-flavour`); `look.gen.ts` is written from Theme.qml.
 */

export { flavours, type FlavourData };

/** The planet a world belongs to: its own id for a planet. Moons share their planet's stills. */
export function planetOf(id: string): string {
	return table[id]?.parent ?? id;
}

/** A world's flavour: its own (a moon may have one: Luna's evening), else its planet's, else Saturn's (Sol's own). */
export function flavourOf(id: string): FlavourData {
	return flavours[id] ?? flavours[planetOf(id)] ?? flavours.saturn;
}

/** A world's name in Japanese, a moon's too: "タイタン". */
export function jpOf(id: string): string {
	return names[id] ?? flavourOf(id).jp;
}

/** Whether `s` has Japanese in it (kana or kanji): it is never set in capitals or tracked. */
export function hasJp(s: string): boolean {
	return /[぀-ヿ㐀-鿿ｦ-ﾟ]/.test(s);
}

/**
 * Whether `s` is set in capitals: a label of one to three words with no
 * Japanese, or a HUD line of such labels joined by " · " ("7 DUE · 0 NEW").
 * Anything longer is set as written, in the sans.
 */
export function capsFor(s: string): boolean {
	return !hasJp(s) && s.split(' · ').every((part) => part.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length <= 3);
}

/**
 * The still a page of `world` stands on, from the pictures there are (any
 * addresses whose file is named `<world>-ground-<n>.<ext>`, as the apps name
 * them in `~/.local/share/sol-yozora/`): a moon's own when it has any, else
 * its planet's (Sol's are Saturn's, whose dusk it wears), one per section in turn (`section` counts from 0). "" when
 * there is none: the flavour's drawn sky.
 */
export function stillFor(world: string, stills: string[], section = 0): string {
	const named = (id: string) =>
		stills.filter((s) => new RegExp(`(^|/)${id}-ground-\\d+\\.\\w+$`).test(s)).sort((a, b) => order(a) - order(b));
	const own = named(world);
	// Else the planet's flavour's: Titan stands on Saturn's, Sol on Saturn's dusk too.
	const list = own.length ? own : named(flavourOf(planetOf(world)).id);
	return list.length ? list[((section % list.length) + list.length) % list.length] : '';
}

/** A still's number (`saturn-ground-2.jpg` is 2), so ten comes after nine. */
function order(s: string): number {
	return Number(/-ground-(\d+)\.\w+$/.exec(s)?.[1] ?? 0);
}

/** Whether `s` is set as an outline title in `f`: the flavour has them and it has no Japanese (the title face keeps that). */
export function outlined(s: string, f: FlavourData): boolean {
	return f.outline && s.trim() !== '' && !hasJp(s);
}

/** Whether Japanese `s` is long enough to be set in the light mincho: more than eight characters. */
export function longJp(s: string): boolean {
	return hasJp(s) && s.length > 8;
}

/**
 * A world's tag at the head of a caption: its flavour's own `tag` ("terra_days"),
 * else its id and the first part of its role: "neptune_music", "titan_what_to_watch", "sol_hub".
 */
export function tagOf(id: string): string {
	const own = flavours[id];
	if (own?.tag) return own.tag;
	const word = (table[id]?.role ?? '').split(',')[0].trim().toLowerCase().replace(/\s+/g, '_');
	return id + (word ? `_${word}` : '');
}

/**
 * A HUD line as a caption: its parts (" · " apart) in lowercase, words
 * joined by underscores, a count "03 / 14" as "03_of_14", the parts " / "
 * apart, after the world's tag when given: "neptune_music / albums".
 */
export function caption(line: string, tag = ''): string {
	const parts = line
		.split(' · ')
		.map((p) =>
			p
				.trim()
				.toLowerCase()
				.replace(/(\d+)\s*\/\s*(\d+)/g, '$1_of_$2')
				.replace(/\s+/g, '_')
		)
		.filter(Boolean);
	return [...(tag ? [tag] : []), ...parts].join(' / ');
}
