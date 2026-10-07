/**
 * Counts a display figure up (or down) to its value as it appears, over the
 * rise, so a number arrives rather than being there. The element's text is
 * whatever `format` makes of the value; by default the rounded number.
 *
 *     <span class="big" use:count={{ value: stats.ticks }}>…</span>
 *     <span use:count={{ value: minutes, format: hours }}>…</span>
 *
 * Follows later values the same way. With reduced motion the figure is set
 * at once.
 */
import type { Action } from 'svelte/action';

export interface Count {
	value: number;
	format?: (value: number) => string;
	/** Milliseconds; defaults to the rise token (900 ms). */
	duration?: number;
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export const count: Action<HTMLElement, Count> = (node, params) => {
	let shown = 0;
	let frame = 0;
	let first = true;

	function run({ value, format = (v) => String(Math.round(v)), duration }: Count) {
		cancelAnimationFrame(frame);
		const from = first ? 0 : shown;
		first = false;
		const still =
			typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ms = still ? 0 : (duration ?? tokenMs(node, '--rise', 900));
		if (!ms || from === value) {
			shown = value;
			node.textContent = format(value);
			return;
		}
		const start = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / ms);
			shown = from + (value - from) * ease(t);
			node.textContent = format(t === 1 ? value : shown);
			if (t < 1) frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
	}

	run(params);
	return {
		update: run,
		destroy: () => cancelAnimationFrame(frame)
	};
};

/** A duration token, as milliseconds. */
function tokenMs(node: Element, name: string, fallback: number): number {
	const raw = getComputedStyle(node).getPropertyValue(name).trim();
	if (!raw) return fallback;
	const n = parseFloat(raw);
	if (Number.isNaN(n)) return fallback;
	return raw.endsWith('ms') ? n : n * 1000;
}
