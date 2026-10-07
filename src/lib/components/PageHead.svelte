<!--
	The top of a working page: a slim toolbar that stays put while the page
	scrolls under it. The title in the name style, a quiet line beside it,
	and the page's main action on the right. Solid black, with a short fade
	below it, so what scrolls under it is composited, never blurred.
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
		{#if lead}
			{#key lead}<span class="lead sol-fade">{lead}</span>{/key}
		{/if}
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
		background: var(--space);
	}

	/* What slides under the bar dims out over a few pixels first. */
	.head::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 100%;
		height: 12px;
		background: linear-gradient(to bottom, rgb(0 0 0 / 0.6), transparent);
		pointer-events: none;
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
