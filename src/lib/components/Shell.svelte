<!--
	The frame around every screen: the bar (brand, the app's sections, its
	status on the right), notices at the top edge and the film grain. It knows
	nothing about sign-in or data; the app passes in what to show.

	<Shell world="sol" links={[{ href: '/', label: 'Home', current: true }]}>
		{#snippet actions()}<Button variant="quiet">Sign out</Button>{/snippet}
		…
	</Shell>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../styles/index.css';
	import type { ShellLink } from '../types.js';
	import { world as worldFor } from '../worlds.js';
	import Grain from './Grain.svelte';
	import Notices from './Notices.svelte';
	import WorldGlyph from './WorldGlyph.svelte';

	interface Props {
		/** The world this app is; its colour becomes `--world`. */
		world: string;
		links?: ShellLink[];
		/** Where the wordmark leads. */
		home?: string;
		/** The right end of the bar: status, the time, sign out. */
		actions?: Snippet;
		children: Snippet;
	}

	let { world: id, links = [], home = '/', actions, children }: Props = $props();
	const w = $derived(worldFor(id));
</script>

<div class="shell" style:--world={w.color}>
	<nav class="bar" aria-label="Main">
		<a class="brand" href={home}>
			<WorldGlyph world={id} size={9} />
			<span>{w.name}</span>
		</a>
		{#if links.length}
			<ul>
				{#each links as link (link.href)}
					<li>
						<a href={link.href} aria-current={link.current ? 'page' : undefined}>
							{#if link.world}<WorldGlyph world={link.world} size={9} />{/if}
							<span class="label">{link.label}</span>
							{#if link.badge}<span class="badge" aria-label="{link.badge} waiting">{link.badge}</span>{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
		{#if actions}<div class="actions">{@render actions()}</div>{/if}
	</nav>
	<main>
		{@render children()}
	</main>
	<Notices />
	<Grain />
</div>

<style>
	.shell {
		min-height: 100dvh;
	}

	.bar {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: var(--s-5);
		height: var(--nav-height);
		padding: 0 var(--margin);
		background: linear-gradient(var(--space) 40%, transparent);
	}

	.brand,
	ul a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--target);
		font-size: var(--text-xs);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		text-decoration: none;
		color: var(--text-quiet);
		transition: color var(--fade) var(--ease);
	}

	.brand {
		flex: none;
		font-size: var(--text-s);
		font-weight: var(--weight-label);
		letter-spacing: 0.32em;
		color: var(--text-bright);
	}

	ul {
		display: flex;
		gap: var(--s-4);
		min-width: 0;
		margin: 0;
		padding: 0;
		overflow-x: auto;
		list-style: none;
		scrollbar-width: none;
	}

	ul a:hover,
	ul a[aria-current='page'] {
		color: var(--text-bright);
	}

	ul a[aria-current='page'] .label {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 6px;
	}

	.badge {
		display: inline-grid;
		place-items: center;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		border-radius: 9px;
		background: var(--world);
		color: var(--space);
		font-size: 10px;
		font-weight: var(--weight-label);
		letter-spacing: 0;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		margin-left: auto;
		flex: none;
	}

	@media (max-width: 720px) {
		.bar {
			gap: var(--s-3);
			padding: 0 var(--s-3);
		}

		.brand span {
			display: none;
		}
	}
</style>
