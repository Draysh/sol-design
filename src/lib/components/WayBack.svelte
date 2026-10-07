<!--
	The way back, where the page itself puts it: a page whose top is its own
	(a cover and a title, say) places it there, and the Shell floats none.
	PageHead does this by itself.
-->
<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { BACK, type BackContext } from '../back.js';
	import Back from './Back.svelte';

	const nav = getContext<BackContext | undefined>(BACK);
	onMount(() => nav?.claim());
</script>

{#if nav?.back}
	<div class="way"><Back {...nav.back} /></div>
{/if}

<style>
	.way {
		display: flex;
	}
</style>
