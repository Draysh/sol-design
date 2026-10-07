<!-- A group, marked by two corner ticks instead of a box. The ticks lock on as the card appears. -->
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
				<a class="open" {href} data-sveltekit-reload={external ? '' : undefined}>
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
		padding: 18px 20px;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
	}

	.card::before,
	.card::after {
		content: '';
		position: absolute;
		width: 14px;
		height: 14px;
		border: 0 solid var(--tick);
		pointer-events: none;
		animation: lock var(--settle) var(--ease-out) both;
		animation-delay: calc(var(--settle) / 2);
	}

	.card::before {
		left: -1px;
		top: -1px;
		border-width: 1px 0 0 1px;
		transform-origin: top left;
	}

	.card::after {
		right: -1px;
		bottom: -1px;
		border-width: 0 1px 1px 0;
		transform-origin: bottom right;
	}

	@keyframes lock {
		from {
			opacity: 0;
			transform: scale(0.3);
		}
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		min-height: 24px;
	}

	h2 {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.open {
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

	.open:hover {
		color: var(--text-bright);
	}

	.open:hover svg {
		transform: translate(1px, -1px);
	}
</style>
