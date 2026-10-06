<script lang="ts">
	import '../lib/styles/index.css';
	import Grain from '../lib/components/Grain.svelte';
	import Notices from '../lib/components/Notices.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head><title>Sol · Design</title></svelte:head>

{@render children()}
<Notices />
<Grain />
