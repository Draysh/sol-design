<!--
	The top of a working page (not a world's first screen, which is a Sheet):
	a quiet label, the title in the name style, one line of lead, and room for
	the page's main action on the right.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** A quiet label above the title, e.g. the world it belongs to. */
		eyebrow?: string;
		lead?: string;
		actions?: Snippet;
	}

	let { title, eyebrow, lead, actions }: Props = $props();
</script>

<header class="head">
	<div class="text">
		{#if eyebrow}<p class="sol-quiet">{eyebrow}</p>{/if}
		<h1>{title}</h1>
		{#if lead}<p class="sol-prose lead">{lead}</p>{/if}
	</div>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</header>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-4);
		padding: var(--s-6) var(--margin) var(--s-5);
		border-bottom: 1px solid var(--line);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		min-width: 0;
	}

	h1 {
		font-size: clamp(26px, 3vw, var(--text-xl));
	}

	.lead {
		margin-top: var(--s-1);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
	}
</style>
