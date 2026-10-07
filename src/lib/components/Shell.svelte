<!--
	The frame around every screen: a sidebar on the left (the world, its
	sections, its status at the bottom) and a pane on the right that scrolls
	on its own. The window itself never scrolls, so the chrome stays put like
	an app's, not a website's. Ctrl (or ⌘) + 1…9 jumps to a section.

	The world's light marks the current section and glides to the next one
	when it changes; each screen settles into the pane as it opens.

	<Shell world="sol" path={page.url.pathname} links={[{ href: '/', label: 'Overview', current: true }]}>
		{#snippet actions()}<Button variant="quiet">Sign out</Button>{/snippet}
		{#snippet footer()}<Transport />{/snippet}
		…
	</Shell>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../styles/index.css';
	import type { ShellLink } from '../types.js';
	import { world as worldFor } from '../worlds.js';
	import Body from './Body.svelte';
	import Grain from './Grain.svelte';
	import Notices from './Notices.svelte';
	import WorldGlyph from './WorldGlyph.svelte';

	interface Props {
		/** The world this app is; its colour becomes `--world`. */
		world: string;
		links?: ShellLink[];
		/** Where the wordmark leads. */
		home?: string;
		/** The current page's path; the pane scrolls back to the top when it changes. */
		path?: string;
		/** The bottom of the sidebar: status, the time, sign out. */
		actions?: Snippet;
		/** A bar along the bottom of the pane, e.g. a player's transport. */
		footer?: Snippet;
		children: Snippet;
	}

	let { world: id, links = [], home = '/', path, actions, footer, children }: Props = $props();
	const w = $derived(worldFor(id));
	let nav = $state<HTMLElement>();
	let list = $state<HTMLElement>();
	let pane = $state<HTMLElement>();

	$effect(() => {
		path;
		pane?.scrollTo({ top: 0 });
	});

	// The light: one element that moves to the current section instead of
	// a mark on each, so the change is seen as movement. It appears in place
	// the first time and glides from then on.
	let light = $state({ y: 0, h: 0, on: false, moved: false });
	let lit = false;
	$effect(() => {
		links;
		if (!list) return;
		const place = () => {
			const a = list?.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
			if (!a || !list) {
				light = { y: 0, h: 0, on: false, moved: lit };
				return;
			}
			// Layout positions, not rects: the sections are still settling in,
			// and a section mid-animation is an offset parent of its own.
			let y = 0;
			for (let el: HTMLElement | null = a; el && el !== list; el = el.offsetParent as HTMLElement | null) y += el.offsetTop;
			light = { y, h: a.offsetHeight, on: true, moved: lit };
			lit = true;
		};
		place();
		const ro = new ResizeObserver(place);
		ro.observe(list);
		return () => ro.disconnect();
	});

	function shortcut(e: KeyboardEvent) {
		if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
		const n = Number(e.key);
		if (!Number.isInteger(n) || n < 1 || n > 9) return;
		const section = nav?.querySelectorAll<HTMLAnchorElement>('a[data-section]')[n - 1];
		if (section) {
			e.preventDefault();
			section.click();
		}
	}
</script>

<svelte:window onkeydown={shortcut} />

<div class="shell" style:--world={w.color}>
	<nav class="side sol-chrome" aria-label="Main" bind:this={nav}>
		<a class="brand" href={home}>
			<span class="disc" aria-hidden="true"><Body world={id} label="" /></span>
			<span class="brand-name">{w.name}</span>
		</a>
		{#if links.length}
			<ul bind:this={list}>
				<li
					class="light"
					class:on={light.on}
					class:moved={light.moved}
					style:transform="translateY({light.y}px)"
					style:height="{light.h}px"
					aria-hidden="true"
				></li>
				{#each links as link, i (link.href)}
					<li class="section" style:--i={i}>
						<a
							href={link.href}
							data-section
							aria-current={link.current ? 'page' : undefined}
							title={i < 9 ? `Ctrl+${i + 1}` : undefined}
						>
							{#if link.world}
								<WorldGlyph world={link.world} size={10} />
							{:else}
								<span class="mark" aria-hidden="true"></span>
							{/if}
							<span class="label">{link.label}</span>
							{#if link.badge}
								{#key link.badge}
									<span class="badge" aria-label="{link.badge} waiting">{link.badge}</span>
								{/key}
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
		{#if actions}<div class="actions">{@render actions()}</div>{/if}
	</nav>
	<div class="pane">
		<main bind:this={pane}>
			{#key path}
				<div class="screen">
					{@render children()}
				</div>
			{/key}
		</main>
		{#if footer}<footer class="foot">{@render footer()}</footer>{/if}
	</div>
	<Notices />
	<Grain />
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: var(--sidebar) minmax(0, 1fr);
		height: 100dvh;
		overflow: hidden;
	}

	.side {
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: var(--s-2) 0 var(--s-3);
		border-right: 1px solid var(--line);
		background: var(--space);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: none;
		height: var(--nav-height);
		padding: 0 var(--s-3) 0 20px;
		color: var(--text-bright);
		font-size: var(--text-s);
		font-weight: var(--weight-label);
		letter-spacing: 0.28em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.disc {
		display: block;
		width: 22px;
		flex: none;
		transition: transform var(--settle) var(--ease-out);
	}

	.brand:hover .disc {
		transform: scale(1.08);
	}

	ul {
		position: relative;
		display: grid;
		align-content: start;
		gap: 2px;
		flex: 1;
		min-height: 0;
		margin: var(--s-2) 0 0;
		padding: 0 var(--s-2);
		overflow-y: auto;
		list-style: none;
	}

	.section {
		animation: sol-settle var(--settle) var(--ease-out) both;
		animation-delay: calc(var(--i, 0) * var(--stagger));
	}

	/* The current section carries the world's light. */
	.light {
		position: absolute;
		left: 0;
		top: 0;
		width: 2px;
		margin: 9px 0;
		height: calc(var(--control) - 18px);
		background: var(--world);
		box-shadow: 0 0 8px var(--world);
		opacity: 0;
		pointer-events: none;
	}

	.light.on {
		opacity: 1;
	}

	.light.moved {
		transition:
			transform var(--settle) var(--ease-out),
			opacity var(--fade) var(--ease);
	}

	ul a {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		height: var(--control);
		padding: 0 12px;
		color: var(--text-quiet);
		font-size: var(--text-s);
		text-decoration: none;
		white-space: nowrap;
		transition:
			color var(--fade) var(--ease),
			background var(--fade) var(--ease);
	}

	ul a:hover {
		color: var(--text-bright);
		background: var(--surface);
	}

	ul a[aria-current='page'] {
		color: var(--text-bright);
		background: var(--surface-hover);
	}

	.mark {
		width: 6px;
		height: 6px;
		flex: none;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		transition:
			background var(--lock) var(--ease),
			border-color var(--lock) var(--ease),
			transform var(--settle) var(--ease-out);
	}

	ul a:hover .mark {
		border-color: var(--text-bright);
		transform: scale(1.2);
	}

	ul a[aria-current='page'] .mark {
		border-color: var(--text-bright);
		background: var(--text-bright);
		transform: none;
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		transition: transform var(--settle) var(--ease-out);
	}

	ul a:hover .label {
		transform: translateX(2px);
	}

	.badge {
		display: inline-grid;
		place-items: center;
		min-width: 18px;
		height: 18px;
		margin-left: auto;
		padding: 0 5px;
		border-radius: 9px;
		background: var(--world);
		color: var(--space);
		font-size: 10px;
		font-weight: var(--weight-label);
		letter-spacing: 0;
		animation: sol-pop var(--settle) var(--ease-out) both;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-2);
		flex: none;
		margin-top: var(--s-3);
		padding: var(--s-3) var(--s-3) 0 20px;
		border-top: 1px solid var(--line);
		font-size: var(--text-xs);
	}

	.pane {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	main {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	/* A screen settles into the pane as it opens. */
	.screen {
		animation: sol-settle var(--settle) var(--ease-out) both;
	}

	.foot {
		flex: none;
		background: var(--space);
	}

	@media (max-width: 760px) {
		.shell {
			grid-template-columns: var(--rail) minmax(0, 1fr);
		}

		.brand {
			justify-content: center;
			padding: 0;
		}

		.brand-name,
		.label,
		.badge,
		.actions {
			display: none;
		}

		ul {
			padding: 0 var(--s-1);
		}

		ul a {
			justify-content: center;
			padding: 0;
		}
	}
</style>
