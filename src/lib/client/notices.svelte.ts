export interface Notice {
	id: number;
	/** The world it comes from, for its glyph. */
	world: string;
	title: string;
	body?: string;
	tone?: 'info' | 'error';
	/** Said before the body, in Japanese: a failure as a person would say it. */
	jp?: string;
	/** The raw words of a failure, folded away behind "Details". */
	detail?: string;
}

/**
 * Known failures and how they are said, Japanese then English, the first
 * whose pattern matches the raw words: the apps' own lines (sol-quick's
 * `Notices.kitLines`), and the browser's for Sol out of reach. Each is
 * short, plain and kind: what happened and what to do.
 */
export const lines: { pattern: RegExp; jp: string; line: string }[] = [
	{ pattern: /failed to fetch|networkerror|load failed|network request failed/i, jp: 'ソルに届かない…', line: 'Can’t reach Sol. Is it running, and is this computer online?' },
	{ pattern: /timed? ?out|deadline/i, jp: '返事がない…少し待ってみて。', line: 'No answer in time. Try again in a moment.' },
	{ pattern: /connection refused|couldn.t connect|error sending request|dns|failed to lookup|network is unreachable|no route to host|connection reset/i, jp: 'つながらない…', line: 'Can’t reach it. Check the connection.' },
	{ pattern: /\b401\b|\b403\b|unauthori[sz]ed|forbidden|wrong (password|key)|invalid (token|key|credentials)|not signed in/i, jp: '鍵が合わないみたい。', line: 'The key or password wasn’t accepted.' },
	{ pattern: /\b5\d\d\b|internal server error|bad gateway|service unavailable/i, jp: '向こうの調子が悪いみたい。', line: 'The other side is having trouble. Try again later.' },
	{ pattern: /no space left|read-only file system|permission denied|disk full/i, jp: 'ここに書けない…', line: 'Couldn’t write it down.' }
];

/** How `raw` is said, `{ jp, line }`, or null when no line knows it. */
export function lineFor(raw: string): { jp: string; line: string } | null {
	const l = lines.find((l) => l.pattern.test(raw));
	return l ? { jp: l.jp, line: l.line } : null;
}

/** Whether `raw` is a machine's words (a chain of causes, codes, paths) rather than a short plain reason. */
export function technical(raw: string): boolean {
	return raw.length > 120 || /::|os error|errno|0x[0-9a-f]{4,}|[{}<>]|\.rs\b|panicked|\bat line\b|[a-z]+_[a-z_]+\(|: [a-z ]*error\b/i.test(raw) || /^[A-Z][a-zA-Z]*Error\b/.test(raw);
}

/**
 * A failure said as a person would: a known one in its line (Japanese, then
 * English), a machine's words as "Something went wrong", both with the raw
 * words behind "Details"; a short plain reason (Sol's own, "That name is
 * taken") as it is.
 */
export function said(body: string): { jp?: string; body: string; detail?: string } {
	const known = lineFor(body);
	if (known) return { jp: known.jp, body: known.line, detail: body };
	if (technical(body)) return { jp: 'うまくいかなかった…', body: 'Something went wrong on the way.', detail: body };
	return { body };
}

/** How long a notice stays, unless held. */
export const LINGER_MS = 6000;

/** In-app notices: they rise in at the bottom right and leave after six seconds unless hovered. */
class Notices {
	list = $state<Notice[]>([]);
	#next = 1;
	#timers = new Map<number, ReturnType<typeof setTimeout>>();

	/** Shows a notice; a failure's body (`tone: 'error'`) is said as a person would (`said`). */
	show(notice: Omit<Notice, 'id'>) {
		const id = this.#next++;
		const words = notice.tone === 'error' && notice.body && !notice.jp && !notice.detail ? said(notice.body) : {};
		this.list = [...this.list, { ...notice, ...words, id }].slice(-4);
		this.linger(id);
		return id;
	}

	/** Keeps a notice up while it is hovered or focused. */
	hold(id: number) {
		clearTimeout(this.#timers.get(id));
		this.#timers.delete(id);
	}

	linger(id: number) {
		this.hold(id);
		this.#timers.set(
			id,
			setTimeout(() => this.dismiss(id), LINGER_MS)
		);
	}

	dismiss(id: number) {
		this.hold(id);
		this.list = this.list.filter((n) => n.id !== id);
	}
}

export const notices = new Notices();

/**
 * Failures nobody caught (a screen's load that rejected, a command that
 * threw outside a handler) become a notice instead of silence, so a blank
 * card always says why. Call once from the app's layout; returns the way
 * to stop.
 */
export function watchUnhandled(world: string): () => void {
	if (typeof window === 'undefined') return () => {};
	const seen = new Map<string, number>();
	const on = (event: PromiseRejectionEvent) => {
		const reason = event.reason;
		// A page transition the browser skipped (a page left while it started) is no failure.
		if (reason instanceof DOMException && reason.name === 'AbortError') return;
		const body = reason instanceof Error ? reason.message : String(reason ?? 'Something went wrong');
		// The same failure in a loop (a poll) says so once a minute, not every time.
		const now = Date.now();
		if ((seen.get(body) ?? 0) > now - 60_000) return;
		seen.set(body, now);
		notices.show({ world, title: 'Couldn’t load that', body, tone: 'error' });
		event.preventDefault();
	};
	window.addEventListener('unhandledrejection', on);
	return () => window.removeEventListener('unhandledrejection', on);
}
