<!--
	Two arcs and an axis at the world's real tilt, with whatever it frames in
	the middle (usually the world's name).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Axial tilt in degrees; the axis leans right at the top. */
		tilt?: number;
		/** Width of the reticle, any CSS length. */
		size?: string;
		children?: Snippet;
	}

	let { tilt = 0, size = '240px', children }: Props = $props();

	const R = 70;
	const point = (deg: number) => {
		const a = (deg * Math.PI) / 180;
		return `${(R * Math.cos(a)).toFixed(2)} ${(R * Math.sin(a)).toFixed(2)}`;
	};
	const arc = (from: number, to: number) => `M${point(from)}A${R} ${R} 0 0 1 ${point(to)}`;
	const arcs = [arc(-70, 40), arc(110, 220)];

	const axis = $derived.by(() => {
		const t = (tilt * Math.PI) / 180;
		const L = R * 1.41;
		return { x: L * Math.sin(t), y: -L * Math.cos(t) };
	});
</script>

<div class="reticle" style:--size={size}>
	<svg viewBox="-100 -100 200 200" aria-hidden="true">
		<g fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0.6">
			{#each arcs as d (d)}
				<path {d} vector-effect="non-scaling-stroke"></path>
			{/each}
		</g>
		<path
			d="M{-axis.x} {-axis.y}L{axis.x} {axis.y}"
			stroke="currentColor"
			stroke-width="1"
			vector-effect="non-scaling-stroke"
			opacity="0.65"
		></path>
		<circle cx={axis.x} cy={axis.y} r="2" fill="currentColor"></circle>
		<circle cx={-axis.x} cy={-axis.y} r="2" fill="currentColor"></circle>
	</svg>
	{#if children}
		<div class="inside">{@render children()}</div>
	{/if}
</div>

<style>
	.reticle {
		position: relative;
		display: grid;
		place-items: center;
		width: var(--size);
		aspect-ratio: 1;
		color: var(--text-bright, #fff);
	}

	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	/* Centred on the reticle even when it is wider, as a long name is. */
	.inside {
		position: absolute;
		left: 50%;
		top: 50%;
		translate: -50% -50%;
		text-align: center;
		white-space: nowrap;
	}
</style>
