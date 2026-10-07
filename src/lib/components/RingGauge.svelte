<!-- Two rings like Saturn's: the outer for the whole, the inner for the part. The arcs draw themselves in. -->
<script lang="ts">
	interface Ring {
		value: number;
		max: number;
	}

	interface Props {
		outer: Ring;
		inner?: Ring;
		/** Short text in the middle, e.g. `E03`. */
		center?: string;
		label: string;
		size?: number;
	}

	let { outer, inner, center, label, size = 96 }: Props = $props();

	function arc(r: number, ring: Ring) {
		const t = ring.max > 0 ? Math.min(0.9999, Math.max(0, ring.value / ring.max)) : 0;
		const a = t * 2 * Math.PI - Math.PI / 2;
		const x = 48 + r * Math.cos(a);
		const y = 48 + r * Math.sin(a);
		return `M48 ${48 - r}A${r} ${r} 0 ${t > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
	}

	const outerArc = $derived(arc(44, outer));
	const innerArc = $derived(inner ? arc(34, inner) : '');
</script>

<svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={label}>
	<circle cx="48" cy="48" r="44" fill="none" stroke="rgb(255 255 255 / 0.14)" stroke-width="1"></circle>
	{#if outer.value > 0}
		{#key outerArc}
			<path class="arc" d={outerArc} pathLength="1" fill="none" stroke="var(--text)" stroke-width="1.5"></path>
		{/key}
	{/if}
	{#if inner}
		<circle cx="48" cy="48" r="34" fill="none" stroke="rgb(255 255 255 / 0.14)" stroke-width="1"></circle>
		{#if inner.value > 0}
			{#key innerArc}
				<path class="arc inner" d={innerArc} pathLength="1" fill="none" stroke="var(--world)" stroke-width="1.5"></path>
			{/key}
		{/if}
	{/if}
	{#if center}
		{#key center}
			<text
				class="sol-fade"
				x="48"
				y="54"
				text-anchor="middle"
				font-family="var(--font)"
				font-weight="200"
				font-size="18"
				fill="var(--text)">{center}</text
			>
		{/key}
	{/if}
</svg>

<style>
	.arc {
		stroke-dasharray: 1;
		animation: draw var(--rise) var(--ease-out) both;
	}

	.inner {
		animation-delay: calc(var(--rise) / 6);
	}

	@keyframes draw {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
