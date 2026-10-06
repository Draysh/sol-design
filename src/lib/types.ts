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

/** How a world's app was installed (orbit's `install::Here`). */
export type AppHere =
	| { state: 'dev' }
	| { state: 'loose'; path: string }
	| { state: 'installed'; kind: 'portable' | 'setup' | 'deb' | 'rpm'; path: string }
	| { state: 'unsupported' };

/** A newer version of a world's app, offered by Sol. */
export interface AppOffer {
	version: string;
	notes: string | null;
	published_at: string | null;
	file: string;
	size: number;
	download: string;
	signature: string;
}

/** Where a world's app stands with its updates (orbit's `updates::Status`). */
export type AppUpdateStatus = { current: string; here: AppHere; auto: boolean } & (
	| { state: 'unknown' }
	| { state: 'checking' }
	| { state: 'current'; latest: string | null; message: string | null; checked_at: string }
	| { state: 'available'; offer: AppOffer; installs_itself: boolean; checked_at: string }
	| { state: 'downloading'; version: string; done: number; total: number }
	| { state: 'ready'; version: string }
	| { state: 'failed'; error: string }
);
