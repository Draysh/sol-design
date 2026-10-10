<!--
	A tiny crescent in the world's colour, for navigation and lists: a disc
	for the star, a lit crescent for the rest, hollow while an app isn't
	answering. By day the colour is deepened to a mid-tone, so a white moon
	still shows on the pale sky.
-->
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

<svg class="glyph sol-mark" style:--c={w.color} width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
	{#if w.kind === 'star'}
		<circle cx="6" cy="6" r="5" fill={hollow ? 'none' : 'var(--mark)'} stroke="var(--mark)"></circle>
	{:else if hollow}
		<circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--mark)" stroke-width="1"></circle>
	{:else}
		<!-- The disc less a disc shifted towards the dark side: the lit crescent alone. -->
		<path d="M4.8 1.146A5 5 0 1 1 4.8 10.854A5 5 0 0 0 4.8 1.146z" fill="var(--mark)"></path>
	{/if}
</svg>

<style>
	.glyph {
		flex: none;
	}
</style>
