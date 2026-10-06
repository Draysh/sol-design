import type { SolSchemas } from './api.js';

export type SolEvent = SolSchemas['schemas']['Envelope'];
type Handler = (event: SolEvent) => void;

/** `terra.habit.*` matches every `terra.habit.` type; `*` matches all. */
export function matches(pattern: string, type: string) {
	return pattern.endsWith('*') ? type.startsWith(pattern.slice(0, -1)) : pattern === type;
}

/** The sentence the app wrote for people, or the bare type. */
export function describe(event: SolEvent): string {
	return event.summary ?? event.type;
}

/**
 * One live connection to Sol's event stream per page. The browser's
 * EventSource reconnects by itself and sends `Last-Event-ID`, so Sol replays
 * whatever was missed.
 */
class Events {
	connected = $state(false);
	feed = $state<SolEvent[]>([]);
	#source: EventSource | null = null;
	#handlers = new Set<{ pattern: string; fn: Handler }>();

	start() {
		if (this.#source) return;
		const source = new EventSource('/api/sol/events');
		source.onopen = () => (this.connected = true);
		source.onerror = () => (this.connected = false);
		source.onmessage = (message) => {
			const event = JSON.parse(message.data) as SolEvent;
			this.#push(event);
			for (const handler of this.#handlers) {
				if (matches(handler.pattern, event.type)) handler.fn(event);
			}
		};
		this.#source = source;
	}

	stop() {
		this.#source?.close();
		this.#source = null;
		this.connected = false;
	}

	/** Seeds the feed with history without firing handlers. */
	seed(history: SolEvent[]) {
		for (const event of [...history].reverse()) this.#push(event);
	}

	on(pattern: string, fn: Handler) {
		const handler = { pattern, fn };
		this.#handlers.add(handler);
		return () => void this.#handlers.delete(handler);
	}

	#push(event: SolEvent) {
		if (this.feed.some((e) => e.id === event.id)) return;
		this.feed = [event, ...this.feed].slice(0, 30);
	}
}

export const events = new Events();
