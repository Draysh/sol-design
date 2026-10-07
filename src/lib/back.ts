/**
 * The way back from a page you opened from another (a title from the
 * library, an album from the albums): the Shell works it out and offers it
 * to the page's PageHead, or floats it over the pane when there is none.
 */
export const BACK = Symbol('sol.back');

export interface BackTarget {
	/** Where it leads: the page it came from, e.g. `Library`. */
	label: string;
	go: () => void;
}

export interface BackContext {
	/** The way back, on a page that isn't a section of its own; `null` otherwise. */
	readonly back: BackTarget | null;
	/** A header shows the way back itself; call the returned function when it goes. */
	claim(): () => void;
}
