<!--
	A group: a panel raised off the night (a step lighter than the pane, lit
	a little from above, with rounded corners and a hairline), its title in
	the world's light over a hairline that splits head from body, and two
	corner ticks, bent round its corners, that lock on to it under the
	pointer. It settles into place as it appears.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import WorldGlyph from './WorldGlyph.svelte';

	interface Props {
		title?: string;
		/** Shows the world's glyph next to the title. */
		world?: string;
		/** Adds an "Open" link to the header. */
		href?: string;
		/** Cross-app links reload the page; keep false for links inside the same app. */
		external?: boolean;
		class?: string;
		children: Snippet;
	}

	let { title, world, href, external = true, class: className = '', children }: Props = $props();
</script>

<section class="card {className}">
	{#if title || href}
		<header>
			{#if title}
				<h2 class="sol-label">
					{#if world}<WorldGlyph {world} />{/if}
					<span>{title}</span>
				</h2>
			{/if}
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
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		min-width: 0;
		padding: 16px 20px 20px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(to bottom, var(--raised-top), var(--raised));
		transition: border-color var(--fade) var(--ease);
	}

	.card:hover {
		border-color: var(--line-mid);
	}

	/* Under the pointer, two ticks lock on, rounded with the panel. */
	.card::before,
	.card::after {
		content: '';
		position: absolute;
		width: calc(var(--radius) + 6px + 7px);
		height: calc(var(--radius) + 6px + 7px);
		border: 0 solid var(--text-world);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--fade) var(--ease),
			translate var(--settle) var(--ease-out);
	}

	.card::before {
		left: -7px;
		top: -7px;
		border-width: 1px 0 0 1px;
		border-top-left-radius: calc(var(--radius) + 6px);
		translate: 5px 5px;
	}

	.card::after {
		right: -7px;
		bottom: -7px;
		border-width: 0 1px 1px 0;
		border-bottom-right-radius: calc(var(--radius) + 6px);
		translate: -5px -5px;
	}

	.card:hover::before,
	.card:hover::after {
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
		padding: 0 20px 13px;
		border-bottom: 1px solid var(--line);
	}

	h2 {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		color: var(--text-world);
	}

	h2 span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.open {
		--tick-out: 2px;
		--tick-arm: 6px;
		--tick-radius: var(--radius-s);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: var(--target);
		margin: -10px -8px -10px 0;
		padding: 0 8px;
		font-size: var(--text-xs);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		text-decoration: none;
		color: var(--text-quiet);
		transition: color var(--fade) var(--ease);
	}

	.open svg {
		transition: transform var(--settle) var(--ease-out);
	}

	.open:hover,
	.open:focus-visible {
		color: var(--text-bright);
	}

	.open:hover svg {
		transform: translate(1px, -1px);
	}
</style>
