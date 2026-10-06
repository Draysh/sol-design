/** One `Label: value` fact. */
export interface Row {
	label: string;
	value: string;
}

/** A link to a moon's app. */
export interface Moon {
	id: string;
	label: string;
	href: string;
}
