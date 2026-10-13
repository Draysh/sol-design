import { getContext } from 'svelte';
import { flavourOf, type FlavourData } from './look.js';

/**
 * Where a component is: the Shell says which world's flavour the window
 * wears and which section is open, so a heading can carry the flavour's mark
 * and a PageHead the section's number. Outside a Shell (sign-in), Sol's own.
 */
export const HERE = Symbol('sol.here');

export interface HereContext {
	/** The world whose flavour the window wears. */
	readonly flavour: string;
	/** The app's world, by name: "Sol". */
	readonly name: string;
	/** The open section's number (1, 2 …), its name and its Japanese, or null on a page of no section. */
	readonly section: { number: number; label: string; jp?: string } | null;
}

/** The window's flavour, for a component inside a Shell (read it in a `$derived`). */
export function hereFlavour(): () => FlavourData {
	const here = getContext<HereContext | undefined>(HERE);
	return () => flavourOf(here?.flavour ?? 'sol');
}
