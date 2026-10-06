export interface Notice {
	id: number;
	/** The world it comes from, for its glyph. */
	world: string;
	title: string;
	body?: string;
	tone?: 'info' | 'error';
}

const LINGER_MS = 6000;

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
