export interface Notice {
	id: number;
	/** The world it comes from, for its glyph. */
	world: string;
	title: string;
	body?: string;
	tone?: 'info' | 'error';
}

/** How long a notice stays, unless held. */
export const LINGER_MS = 6000;

/** In-app notices: they fade in at the top and leave after six seconds unless hovered. */
class Notices {
	list = $state<Notice[]>([]);
	#next = 1;
	#timers = new Map<number, ReturnType<typeof setTimeout>>();

	show(notice: Omit<Notice, 'id'>) {
		const id = this.#next++;
		this.list = [...this.list, { ...notice, id }].slice(-4);
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
