/**
 * Night and day, as the apps have it (sol-quick's `Theme.mode`): "system"
 * (as the desktop asks, the default), "sun" (day from 07:00 to 19:00),
 * "night" or "day". The choice is kept in this browser (`sol.light` in
 * localStorage); what it comes to is set on the root as `data-light`, which
 * the tokens follow. Before any script runs the tokens follow the desktop.
 *
 *     light.mode = 'sun';
 *     if (light.day) …
 */

export type LightMode = 'system' | 'sun' | 'night' | 'day';

const KEY = 'sol.light';
const modes: LightMode[] = ['system', 'sun', 'night', 'day'];

/** The choices, as Settings offers them. */
export const lightModes: { value: LightMode; label: string }[] = [
	{ value: 'system', label: 'As the desktop is' },
	{ value: 'sun', label: 'With the sun' },
	{ value: 'night', label: 'Always night' },
	{ value: 'day', label: 'Always day' }
];

function stored(): LightMode {
	try {
		const value = globalThis.localStorage?.getItem(KEY);
		return modes.includes(value as LightMode) ? (value as LightMode) : 'system';
	} catch {
		return 'system';
	}
}

class Light {
	#mode = $state<LightMode>(stored());
	#desktopDay = $state(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches);
	#hour = $state(new Date().getHours());
	#started = false;

	/** What the person chose. */
	get mode(): LightMode {
		this.follow();
		return this.#mode;
	}

	set mode(value: LightMode) {
		this.#mode = value;
		try {
			globalThis.localStorage?.setItem(KEY, value);
		} catch {
			// A browser that keeps nothing still changes the light for now.
		}
		this.#apply();
	}

	/** Whether it is day now, by that choice. */
	get day(): boolean {
		this.follow();
		const m = this.#mode;
		return m === 'day' || (m === 'sun' && this.#hour >= 7 && this.#hour < 19) || (m === 'system' && this.#desktopDay);
	}

	/**
	 * Follows the desktop and the clock and sets `data-light`; once, the
	 * first time anyone asks (the Shell does at once).
	 */
	follow() {
		if (this.#started || typeof window === 'undefined') return;
		this.#started = true;
		const query = window.matchMedia('(prefers-color-scheme: light)');
		query.addEventListener('change', (e) => {
			this.#desktopDay = e.matches;
			this.#apply();
		});
		// The hour, for "sun"; a minute's precision is plenty.
		setInterval(() => {
			const hour = new Date().getHours();
			if (hour !== this.#hour) {
				this.#hour = hour;
				this.#apply();
			}
		}, 60_000);
		this.#apply();
	}

	#apply() {
		if (typeof document === 'undefined') return;
		document.documentElement.dataset.light = this.day ? 'day' : 'night';
	}
}

export const light = new Light();
