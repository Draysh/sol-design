<!--
	A world, lit from one side, drawn on the GPU (body-gl.ts, the apps'
	body shader): the photograph on a sphere lit by a distant sun, a
	terminator opposite the light (soft where there is air), a night side
	nearly black (see-through by day), and, for a world with an atmosphere,
	a thin rim of it lit on the sunny limb. Sol is a star with a corona;
	Saturn is its photograph, laid on as light.

	The element is as wide as its parent and square: that is the disc. The
	glow paints outside it, so give the parent room. Without WebGL the
	photograph shows clipped to a circle.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, now, renderer, sideFor, type BodyLook } from '../body-gl.js';
	import { light as daylight } from '../light.svelte.js';
	import { skyOf, world as worldFor } from '../worlds.js';

	interface Props {
		world: string;
		/** Where the light comes from, degrees clockwise from the top: the real sky's for the worlds that follow it, else the world's own. */
		light?: number;
		/** 0 is new, 1 is full; as `light`. */
		phase?: number;
		/** Accessible name; pass an empty string when the body is decoration. */
		label?: string;
		/** Rises out of the dark as it appears. */
		animated?: boolean;
		class?: string;
	}

	let { world: id, light, phase, label, animated = true, class: className = '' }: Props = $props();

	const w = $derived(worldFor(id));
	const sky = $derived(skyOf(id));
	const name = $derived(label ?? w.name);

	let box = $state<HTMLElement>();
	let canvas = $state<HTMLCanvasElement>();
	/** The disc's diameter on screen. */
	let disc = $state(0);
	let seen = $state(false);
	let gl = $state<boolean | null>(null);

	const look = $derived.by((): BodyLook => {
		const lit = light ?? sky?.light ?? w.icon.light;
		const fit = w.fit ?? { x: 0.5, y: 0.5, r: 0.5 };
		return {
			image: w.image,
			mode: w.render === 'star' ? 1 : w.render === 'photo' ? 2 : 0,
			effect: w.effect === 'haze' ? 1 : 0,
			live: w.live === 'clouds' ? 1 : w.live === 'corona' ? 2 : 0,
			color: w.color,
			light: lit,
			// Small, a body keeps at least a crescent, so a new moon still shows.
			phase: Math.min(1, Math.max(disc < 48 ? 0.2 : 0, phase ?? sky?.phase ?? w.icon.phase)),
			fit: { x: fit.x, y: fit.y, r: fit.r, turn: fit.lit === undefined ? 0 : ((lit - fit.lit) * Math.PI) / 180 },
			air: w.air ?? 0,
			aspect: 774 / 1600,
			day: daylight.day,
			disc
		};
	});

	onMount(() => {
		gl = !!renderer();
		const sizes = new ResizeObserver(([entry]) => (disc = entry.contentRect.width));
		const shown = new IntersectionObserver(([entry]) => (seen = entry.isIntersecting), { rootMargin: '64px' });
		if (box) {
			sizes.observe(box);
			shown.observe(box);
		}
		return () => {
			sizes.disconnect();
			shown.disconnect();
		};
	});

	function draw(time: number) {
		const r = renderer();
		if (!r || !canvas || !disc || !look.image) return;
		const side = sideFor(disc * 1.7);
		if (canvas.width !== side) {
			canvas.width = side;
			canvas.height = side;
		}
		r.draw(canvas, look, time, () => draw(now()));
	}

	// Drawn again whenever what it looks like changes.
	$effect(() => {
		if (gl && seen) draw(now());
	});

	// Alive: clouds drift and a corona flickers on a body big enough to see
	// it, while it is on screen; a still one never asks for a frame.
	const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	$effect(() => {
		if (!gl || !seen || !look.live || disc < 120 || reduced) return;
		return animate((time) => draw(time));
	});
</script>

<div
	bind:this={box}
	class="body {className}"
	class:rise={animated}
	role={name ? 'img' : undefined}
	aria-label={name || undefined}
	aria-hidden={name ? undefined : 'true'}
>
	{#if gl === false && w.image}
		<img class="flat" class:photo={w.render === 'photo'} src={w.image} alt="" />
	{:else}
		<canvas bind:this={canvas}></canvas>
	{/if}
</div>

<style>
	.body {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
	}

	/* The drawing reaches past the disc, to 1.7 of its radius. */
	canvas {
		position: absolute;
		left: -35%;
		top: -35%;
		width: 170%;
		height: 170%;
	}

	.flat {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.flat.photo {
		border-radius: 0;
		object-fit: contain;
	}

	/* A body comes up out of the dark, a touch closer as it brightens. */
	.rise > * {
		animation: rise var(--rise, 900ms) var(--ease-out, ease) both;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: scale(0.97);
		}
	}
</style>
