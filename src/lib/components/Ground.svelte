<!--
	The window's ground, as the apps' DuskGround: a still from the world's
	film full-bleed under the flavour's grade, a shade down the left where
	titles stand and a soft vignette; without a still, the flavour's drawn
	sky (its stars at night, Terra's summer sun). Neptune's has rain drawn
	over it, still, and a red neon glow low on the right. A new still fades
	in over the last. Nothing on it moves while the page rests.

	The stills are the person's own and are never part of this package: the
	page passes an address it may show (Sol serves them to the person signed
	in), or nothing.

	<Ground world="saturn" still="/api/sol/look/saturn-ground-1.jpg" />
-->
<script lang="ts">
	import { flavourOf } from '../look.js';

	interface Props {
		/** The world whose flavour it wears (a moon's own, else its planet's). */
		world: string;
		/** The still's address, or "" for the drawn sky. */
		still?: string;
	}

	let { world, still = '' }: Props = $props();
	const f = $derived(flavourOf(world));

	// Two pictures, so the next fades in over the one on show once it has loaded.
	let shown = $state<string[]>(['', '']);
	let front = $state(0);
	let loaded = $state<boolean[]>([false, false]);
	$effect(() => {
		const want = still;
		if (shown[front] === want) return;
		const back = 1 - front;
		if (shown[back] === want && loaded[back]) {
			front = back;
			return;
		}
		loaded[back] = false;
		shown[back] = want;
	});
	function ready(i: number) {
		loaded[i] = true;
		if (shown[i] === still) front = i;
	}
	const lit = $derived(still !== '' && loaded[front] && shown[front] === still);

	/** A number from 0 to 1 for `i`, always the same one (as the apps' stars). */
	function noise(i: number) {
		const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
		return s - Math.floor(s);
	}
	const stars = Array.from({ length: 90 }, (_, i) => {
		const r1 = noise(i * 3 + 1);
		const r2 = noise(i * 3 + 2);
		const r3 = noise(i * 3 + 3);
		const y = Math.pow(r2, 1.6) * 62;
		return { x: r1 * 100, y, r: r3 > 0.92 ? 1.25 : r3 > 0.6 ? 0.75 : 0.5, o: (0.25 + r3 * 0.6) * (1 - y / 70) };
	});
	// Rain, drawn once: fine slanting strokes, faint and far, a few longer ones nearer.
	const rain = Array.from({ length: 220 }, (_, i) => {
		const near = i % 7 === 0;
		return { x: noise(i * 5 + 11) * 104 - 2, y: noise(i * 5 + 12) * 100, l: near ? 3 + noise(i * 5 + 13) * 3 : 0.8 + noise(i * 5 + 13) * 1.2, o: near ? 0.16 : 0.08 + noise(i * 5 + 14) * 0.08 };
	});
	const vignette = $derived(f.light ? 0.2 : f.motif === 'summer' ? 0.45 : 0.62);
</script>

<div class="ground" class:lit aria-hidden="true" style:--vignette={vignette}>
	<div class="sky"></div>
	{#if f.stars}
		<svg class="stars">
			{#each stars as s, i (i)}
				<circle cx="{s.x}%" cy="{s.y}%" r={s.r} fill="#fff" opacity={s.o} />
			{/each}
		</svg>
	{/if}
	{#if f.motif === 'summer' && f.light}<div class="sun"></div>{/if}
	{#each shown as src, i (i)}
		{#if src}
			<img
				class="still"
				class:front={i === front && loaded[i]}
				{src}
				alt=""
				decoding="async"
				style:--zoom={f.frame?.[0] ?? 1}
				style:--across={f.frame?.[1] ?? 0.5}
				onload={() => ready(i)}
			/>
		{/if}
	{/each}
	<div class="grade"></div>
	<div class="shade"></div>
	{#if f.rain > 0}
		<svg class="rain" style:opacity={f.rain}>
			{#each rain as r, i (i)}
				<line x1="{r.x}%" y1="{r.y}%" x2="{r.x - r.l * 0.12}%" y2="{r.y + r.l}%" stroke="#dff4ff" stroke-width="1" opacity={r.o} />
			{/each}
		</svg>
	{/if}
	<div class="haze"></div>
	<div class="vignette"></div>
</div>

<style>
	.ground {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		background: var(--ground);
		contain: strict;
	}

	.ground > * {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* The sky without a still: the flavour's own, top to bottom. */
	.sky {
		background: linear-gradient(
			to bottom,
			var(--sky-0) 0%,
			var(--sky-1) 42%,
			var(--sky-2) 70%,
			var(--sky-3) 88%,
			var(--sky-4) 100%
		);
	}

	.stars {
		height: 100%;
	}

	/* A day world's sun, high on the right. */
	.sun {
		background: radial-gradient(
			circle at 78% 16%,
			rgb(255 255 237 / 0.95) 0,
			rgb(255 250 204 / 0.7) 3%,
			rgb(255 242 166 / 0.16) 13%,
			rgb(255 242 166 / 0) 32%
		);
	}

	/* The still, a little closer and from one side where the flavour frames it so; it fades in. */
	.ground > .still {
		left: calc((1 - var(--zoom)) * 100% * var(--across));
		width: calc(var(--zoom) * 100%);
		height: calc(var(--zoom) * 100%);
		object-fit: cover;
		object-position: calc(var(--across) * 100%) top;
		opacity: 0;
		transition: opacity var(--rise) var(--ease-out);
	}

	.ground > .still.front {
		opacity: 1;
	}

	/* The grade: the still held down a little, then the flavour's light top to bottom; over the drawn sky a little less. */
	.grade {
		opacity: 0.8;
		background:
			linear-gradient(
				to bottom,
				var(--grade-0) 0%,
				var(--grade-1) 30%,
				var(--grade-2) 60%,
				var(--grade-3) 85%,
				var(--grade-4) 100%
			),
			color-mix(in srgb, var(--ground) calc(var(--hold) * 100%), transparent);
		transition: opacity var(--rise) var(--ease-out);
	}

	.lit .grade {
		opacity: 1;
	}

	/* Down the left, where titles stand; a bright still's deepens round the title, top left. */
	.shade {
		background:
			radial-gradient(
				ellipse 34% 36% at 26% 17%,
				color-mix(in srgb, var(--dim) calc(var(--pool) * 100%), transparent) 0%,
				color-mix(in srgb, var(--dim) calc(var(--pool) * 60%), transparent) 55%,
				transparent 100%
			),
			linear-gradient(
				to right,
				color-mix(in srgb, var(--dim) calc(var(--shade) * 100%), transparent) 0%,
				color-mix(in srgb, var(--dim) calc(var(--shade) * 64%), transparent) 40%,
				color-mix(in srgb, var(--dim) calc(var(--shade) * 20%), transparent) 60%,
				transparent 80%
			);
	}

	.rain {
		height: 100%;
	}

	/* A neon glow low on the right (Neptune's). */
	.haze {
		background: radial-gradient(
			circle at 86% 92%,
			color-mix(in srgb, var(--haze) 22%, transparent) 0,
			color-mix(in srgb, var(--haze) 7%, transparent) 21%,
			transparent 42%
		);
	}

	.vignette {
		background: radial-gradient(
			ellipse 78% 78% at 50% 45%,
			transparent 45%,
			color-mix(in srgb, var(--dim) calc(var(--vignette) * 100%), transparent) 100%
		);
	}
</style>
