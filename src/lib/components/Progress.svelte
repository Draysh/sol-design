<!-- How far along: slanted ticks in the flavour's light, with the two ends named under them when they mean something. -->
<script lang="ts">
	import SlantTicks from './SlantTicks.svelte';

	interface Props {
		value: number;
		max: number;
		label: string;
		start?: string;
		end?: string;
		/** How many ticks; ten by default. */
		count?: number;
	}

	let { value, max, label, start, end, count = 10 }: Props = $props();
	const share = $derived(max > 0 ? Math.min(1, Math.max(0, value / max)) : 0);
</script>

<div class="progress">
	<div role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax={max} aria-valuenow={value}>
		<SlantTicks value={share} {count} />
	</div>
	{#if start || end}
		<div class="ends"><span class="sol-quiet">{start}</span><span class="sol-quiet">{end}</span></div>
	{/if}
</div>

<style>
	.progress {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.ends {
		display: flex;
		justify-content: space-between;
	}
</style>
