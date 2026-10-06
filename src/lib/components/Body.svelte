<!--
	A world, lit from one side. The SVG box is the disc itself (radius 100 in
	its own units); the glow paints outside it, so give the parent room.
-->
<script lang="ts">
	import { world as worldFor } from '../worlds.js';

	interface Props {
		world: string;
		/** Where the light comes from, degrees clockwise from the top. */
		light?: number;
		/** 0 is new, 1 is full. */
		phase?: number;
		/** Accessible name; pass an empty string when the body is decoration. */
		label?: string;
		class?: string;
	}

	let { world: id, light, phase, label, class: className = '' }: Props = $props();

	const uid = $props.id();
	const w = $derived(worldFor(id));
	const lit = $derived(light ?? w.hero.light);
	const amount = $derived(Math.min(1, Math.max(0, phase ?? w.hero.phase)));

	// The shadow sits opposite the light; the further it slides, the more is lit.
	const away = $derived({
		x: -Math.sin((lit * Math.PI) / 180),
		y: Math.cos((lit * Math.PI) / 180)
	});
	const reach = $derived(amount * 200);
	const occluder = $derived({ x: away.x * reach, y: away.y * reach });
	const shade = $derived({ x: away.x * (reach * 1.1 + 5), y: away.y * (reach * 1.1 + 5) });
	const name = $derived(label ?? w.name);
	const photoHeight = 200 * (774 / 1600);
</script>

<svg
	class="body {className}"
	viewBox="-170 -170 340 340"
	role={name ? 'img' : undefined}
	aria-label={name || undefined}
	aria-hidden={name ? undefined : 'true'}
>
	<defs>
		<filter id="{uid}-halo" x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur stdDeviation="2"></feGaussianBlur>
		</filter>
		<filter id="{uid}-soft" x="-40%" y="-40%" width="180%" height="180%">
			<feGaussianBlur stdDeviation="4.5"></feGaussianBlur>
		</filter>
		<filter id="{uid}-rim" x="-10%" y="-10%" width="120%" height="120%">
			<feGaussianBlur stdDeviation="0.8"></feGaussianBlur>
		</filter>
		<filter id="{uid}-tint" color-interpolation-filters="sRGB">
			<feColorMatrix
				type="matrix"
				values="0.75 0.45 0.1 0 0.06 0.32 0.32 0.06 0 0.01 0.06 0.06 0.03 0 0 0 0 0 1 0"
			></feColorMatrix>
		</filter>
		<radialGradient id="{uid}-corona" cx="0" cy="0" r="170" gradientUnits="userSpaceOnUse">
			<stop offset="0.55" stop-color={w.color} stop-opacity="0.55"></stop>
			<stop offset="0.75" stop-color="#b8401a" stop-opacity="0.16"></stop>
			<stop offset="1" stop-color="#000" stop-opacity="0"></stop>
		</radialGradient>
		<radialGradient id="{uid}-limb" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
			<stop offset="0.55" stop-color="#000" stop-opacity="0"></stop>
			<stop offset="0.88" stop-color="#2a0800" stop-opacity="0.5"></stop>
			<stop offset="1" stop-color="#000" stop-opacity="0.85"></stop>
		</radialGradient>
		<linearGradient
			id="{uid}-shade"
			gradientUnits="userSpaceOnUse"
			x1={away.x * 100}
			y1={away.y * 100}
			x2={-away.x * 100}
			y2={-away.y * 100}
		>
			<stop offset="0" stop-color="#000" stop-opacity="0.92"></stop>
			<stop offset="0.5" stop-color="#000" stop-opacity="0.4"></stop>
			<stop offset="1" stop-color="#000" stop-opacity="0"></stop>
		</linearGradient>
		<clipPath id="{uid}-disc"><circle r="100"></circle></clipPath>
		<!-- Glow only on the lit limb: a mask, so nothing black is painted outside the disc. -->
		<mask id="{uid}-lit" maskUnits="userSpaceOnUse" x="-130" y="-130" width="260" height="260">
			<rect x="-130" y="-130" width="260" height="260" fill="#fff"></rect>
			<circle cx={shade.x} cy={shade.y} r="108" fill="#000" filter="url(#{uid}-soft)"></circle>
		</mask>
	</defs>

	{#if w.render === 'photo'}
		<image
			href={w.image}
			x="-100"
			y={-photoHeight / 2}
			width="200"
			height={photoHeight}
			preserveAspectRatio="xMidYMid meet"
		></image>
	{:else if w.render === 'star'}
		<circle r="170" fill="url(#{uid}-corona)"></circle>
		<g clip-path="url(#{uid}-disc)">
			<image href={w.image} x="-100" y="-100" width="200" height="200" filter="url(#{uid}-tint)"></image>
			<circle r="100" fill="url(#{uid}-limb)"></circle>
			{#if amount < 1}
				<rect x="-100" y="-100" width="200" height="200" fill="url(#{uid}-shade)"></rect>
			{/if}
		</g>
	{:else}
		<g mask="url(#{uid}-lit)">
			{#if w.effect === 'haze'}
				<circle r="104" fill="none" stroke={w.color} stroke-width="5" opacity="0.7" filter="url(#{uid}-halo)"></circle>
				<circle r="104" fill="none" stroke="#e8a060" stroke-width="1.5" opacity="0.3"></circle>
			{:else}
				<circle r="100.4" fill="none" stroke={w.color} stroke-width="2.4" opacity="0.8" filter="url(#{uid}-halo)"></circle>
			{/if}
			{#if w.effect === 'split-rim'}
				<circle cx="-1.6" cy="1" r="101" fill="none" stroke="#ff4a3a" stroke-width="1.4" opacity="0.8" filter="url(#{uid}-rim)"></circle>
				<circle cx="1.6" cy="-1" r="101" fill="none" stroke="#3a7bff" stroke-width="1.4" opacity="0.8" filter="url(#{uid}-rim)"></circle>
			{/if}
		</g>
		<g clip-path="url(#{uid}-disc)">
			{#if w.image}
				<image href={w.image} x="-100" y="-100" width="200" height="200"></image>
			{:else}
				<circle r="100" fill="#1a1a1a"></circle>
			{/if}
			{#if amount < 1}
				<circle cx={occluder.x} cy={occluder.y} r="100" fill="#000" filter="url(#{uid}-soft)"></circle>
			{/if}
		</g>
	{/if}
</svg>

<style>
	/* The drawing reaches past the disc (the glow, to r = 170 of the disc's
	   100), and WebKitGTK clips an SVG to its box whatever its overflow says.
	   So the box holds all of it, and negative margins keep the element's
	   layout size equal to the disc. */
	.body {
		display: block;
		width: 170%;
		max-width: none;
		height: auto;
		margin: -35%;
		aspect-ratio: 1;
		animation: rise var(--fade, 240ms) var(--ease, ease) both;
		animation-duration: calc(var(--fade, 240ms) * 4);
	}

	@keyframes rise {
		from {
			opacity: 0;
		}
	}
</style>
