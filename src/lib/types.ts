/** One `Label: value` fact. */
export interface Row {
	label: string;
	value: string;
	/** Leave the value's case alone, for paths and addresses. */
	keepCase?: boolean;
}

/** A link to a moon's app. */
export interface Moon {
	id: string;
	label: string;
	href: string;
}

/** A section in the Shell's bar. */
export interface ShellLink {
	href: string;
	label: string;
	/** Shows the world's glyph before the label. */
	world?: string;
	/** A small count after the label, e.g. waiting requests. */
	badge?: number;
	current?: boolean;
}

/** A choice in a Select. */
export interface Option {
	value: string;
	label: string;
}
