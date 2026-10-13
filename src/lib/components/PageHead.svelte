<!--
	The top of a working page, as the apps' PageHead: a glass band that stays
	put while the page scrolls under it. The page's Japanese in the title
	serif (`jp`, else its section's), then its HUD line (the section's number
	and the eyebrow) over the English title in HUD capitals, a quiet line
	beside them, and the page's main action on the right. On a page opened
	from another, the way back comes first (the Shell's).

	<PageHead title="Worlds" jp="世界" lead="Each world is an app of its own.">…</PageHead>
-->
<script lang="ts">
	import { getContext, onMount, type Snippet } from 'svelte';
	import { BACK, type BackContext } from '../back.js';
	import { HERE, type HereContext } from '../here.js';
	import Back from './Back.svelte';

	interface Props {
		title: string;
		/** The page's name in Japanese: "世界". Its section's when not given. */
		jp?: string;
		/** The word on the HUD line after the section's number; the app's world when not given. */
		eyebrow?: string;
		lead?: string;
		actions?: Snippet;
	}

	let { title, jp, eyebrow, lead, actions }: Props = $props();

	const nav = getContext<BackContext | undefined>(BACK);
	const here = getContext<HereContext | undefined>(HERE);
	onMount(() => nav?.claim());

	const section = $derived(here?.section ?? null);
	const name = $derived(jp ?? section?.jp ?? '');
	const hud = $derived(
		[section ? String(section.number).padStart(2, '0') : '', eyebrow ?? here?.name ?? ''].filter(Boolean).join(' · ')
	);
</script>

<header class="head sol-chrome">
	<span class="sol-glass" aria-hidden="true"></span>
	<div class="text">
		{#if nav?.back}<span class="back"><Back {...nav.back} /></span>{/if}
		{#if name}<span class="jp" lang="ja">{name}</span><span class="bar" aria-hidden="true"></span>{/if}
		<span class="names">
			<span class="hud">{hud}</span>
			<h1>{title}</h1>
		</span>
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
		isolation: isolate;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-2) var(--s-4);
		min-height: var(--nav-height);
		padding: var(--s-2) var(--margin);
		animation: arrive var(--turn) var(--ease-out) both;
	}

	/* The band is square, edge to edge, its glass the chrome's. */
	.head > :global(.sol-glass) {
		--cut: 0px;
		box-shadow: inset 0 -1px 0 var(--line);
	}

	/* The words slide in behind the page's turn. */
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateX(-12px);
		}
	}

	.text {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2) var(--s-3);
		min-width: 0;
	}

	.back {
		margin-right: var(--s-1);
	}

	.jp {
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-size: 28px;
		font-weight: 800;
		line-height: 1;
		color: var(--hud-text);
		white-space: nowrap;
	}

	.bar {
		align-self: stretch;
		width: 1px;
		margin: 6px 0;
		background: var(--line-mid);
	}

	.names {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.hud {
		font-family: var(--font-caps);
		font-size: 10px;
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
		color: var(--accent);
	}

	/* The English title: the subtitle, in the display face. */
	h1 {
		font-family: var(--font-display);
		font-size: var(--text-s);
		color: var(--hud-text);
	}

	.lead {
		max-width: 70ch;
		font-size: var(--text-s);
		color: var(--text-quiet);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	@media (prefers-reduced-motion: reduce) {
		.head {
			animation-name: sol-fade;
		}
	}

	@media (max-width: 700px) {
		.jp {
			font-size: 22px;
		}

		.lead {
			flex-basis: 100%;
		}
	}
</style>
