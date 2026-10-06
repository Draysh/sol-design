<!-- A tiny crescent in the world's colour, for navigation and lists. -->
<script lang="ts">
	import { world as worldFor } from '../worlds.js';

	interface Props {
		world: string;
		size?: number;
		/** Draw it hollow, e.g. while the app isn't answering. */
		hollow?: boolean;
	}

	let { world: id, size = 10, hollow = false }: Props = $props();
	const w = $derived(worldFor(id));
</script>

<svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
	{#if w.kind === 'star'}
		<circle cx="6" cy="6" r="5" fill={hollow ? 'none' : w.color} stroke={w.color}></circle>
	{:else if hollow}
		<circle cx="6" cy="6" r="4.5" fill="none" stroke={w.color} stroke-width="1"></circle>
	{:else}
		<circle cx="6" cy="6" r="5" fill={w.color}></circle>
		<circle cx="3.6" cy="6" r="5" fill="var(--space, #000)"></circle>
	{/if}
</svg>
