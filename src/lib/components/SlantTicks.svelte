<!--
	How far along, as a row of slanted ticks (leaning forward 20°): those
	done in the flavour's light, the rest faint; a part done lights the next
	tick part-way. Progress draws one; a page may use it on its own.

	<SlantTicks value={7 / 12} />
-->
<script lang="ts">
	interface Props {
		/** How far along, 0 to 1. */
		value: number;
		count?: number;
	}

	let { value, count = 10 }: Props = $props();
	const lit = (i: number) => Math.max(0, Math.min(1, value * count - i));
</script>

<span class="ticks" aria-hidden="true">
	{#each Array.from({ length: count }, (_, i) => i) as i (i)}
		<span class="tick" style:--lit="{lit(i) * 100}%"></span>
	{/each}
</span>

<style>
	.ticks {
		display: flex;
		gap: 4px;
		height: 8px;
		padding: 0 3px;
	}

	.tick {
		flex: 1;
		min-width: 0;
		transform: skewX(-20deg);
		background: linear-gradient(to right, var(--accent) var(--lit), rgb(var(--ink) / 0.16) var(--lit));
	}
</style>
