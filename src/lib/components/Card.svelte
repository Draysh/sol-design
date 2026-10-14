<!--
	A group, on glass: what is behind it blurred under the flavour's tint, a
	hairline round it, its top-right corner cut at 45° and the cut and the
	top edge catching the light. Headed by a HUD label (the flavour's mark,
	the title in HUD capitals, its Japanese tag) over a hairline from edge to
	edge. Brackets in the light lock onto two corners under the pointer, and
	stay on a `lead` card, the one the page is about. It settles into place
	as it appears.

	<Card title="In orbit" jp="軌道" href="/worlds" external={false}>…</Card>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { jpOf } from '../look.js';
	import HudLabel from './HudLabel.svelte';

	interface Props {
		title?: string;
		/** The title's Japanese tag: "軌道". A world's card takes the world's name in Japanese. */
		jp?: string;
		/** The world it is about: its name in Japanese is the tag unless `jp` says otherwise. */
		world?: string;
		/** The page's lead card: its brackets stay on. */
		lead?: boolean;
		/** Adds an "Open" link to the header. */
		href?: string;
		/** Cross-app links reload the page; keep false for links inside the same app. */
		external?: boolean;
		class?: string;
		children: Snippet;
	}

	let { title, jp, world, lead = false, href, external = true, class: className = '', children }: Props = $props();
	const tag = $derived(jp ?? (world ? jpOf(world) : ''));
</script>

<section class="card sol-brackets {className}" class:lead>
	<span class="sol-glass" aria-hidden="true"></span>
	{#if title || href}
		<header>
			{#if title}<HudLabel text={title} jp={tag} level={2} />{/if}
			{#if href}
				<a class="open sol-ticks" {href} data-sveltekit-reload={external ? '' : undefined}>
					Open <span class="sol-visually-hidden">{title}</span>
					<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
						<path d="M3 9l6-6M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.1"></path>
					</svg>
				</a>
			{/if}
		</header>
	{/if}
	{@render children()}
</section>

<style>
	.card {
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		min-width: 0;
		padding: 16px 20px 20px;
	}

	/* The brackets: off until the pointer comes, on for the lead. */
	.card::before,
	.card::after {
		opacity: 0;
	}

	.card::before {
		translate: 4px 4px;
	}

	.card::after {
		translate: -4px -4px;
	}

	.card:hover::before,
	.card:hover::after,
	.lead::before,
	.lead::after {
		opacity: 1;
		translate: 0 0;
	}

	/* Under the title, a hairline from edge to edge: the head, then the body. */
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		min-height: 24px;
		margin: 0 -20px;
		padding: 0 calc(20px + var(--hud-cut) / 2) 13px 20px;
		border-bottom: 1px solid var(--line);
	}

	header :global(.hud) {
		min-width: 0;
	}

	.open {
		--tick-out: 2px;
		--tick-arm: 6px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		min-height: var(--target);
		margin: -10px -8px -10px 0;
		padding: 0 8px;
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
		text-decoration: none;
		color: var(--hud-quiet);
		transition: color var(--fade) var(--ease);
	}

	.open svg {
		transition: transform var(--settle) var(--spring);
	}

	.open:hover,
	.open:focus-visible {
		color: var(--accent-text);
	}

	.open:hover svg {
		transform: translate(1px, -1px);
	}
</style>
