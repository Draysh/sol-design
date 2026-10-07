<!--
	The top of a working page: a slim toolbar that stays put while the page
	scrolls under it. The title in the name style, a quiet line beside it,
	and the page's main action on the right.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** A quiet label before the title, e.g. the world it belongs to. */
		eyebrow?: string;
		lead?: string;
		actions?: Snippet;
	}

	let { title, eyebrow, lead, actions }: Props = $props();
</script>

<header class="head sol-chrome">
	<div class="text">
		{#if eyebrow}<span class="sol-quiet">{eyebrow}</span>{/if}
		<h1>{title}</h1>
		{#if lead}<span class="lead">{lead}</span>{/if}
	</div>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</header>

<style>
	.head {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-2) var(--s-4);
		min-height: var(--nav-height);
		padding: var(--s-2) var(--margin);
		border-bottom: 1px solid var(--line);
		background: color-mix(in srgb, var(--space) 86%, transparent);
		backdrop-filter: blur(14px);
	}

	.text {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--s-2) var(--s-3);
		min-width: 0;
	}

	h1 {
		font-size: var(--text-m);
		letter-spacing: var(--track-caps);
	}

	.lead {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}
</style>
