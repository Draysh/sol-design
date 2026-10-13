<!--
	A link to one of the world's moons (or, from a moon, to its planet),
	under a title card: a small diamond in the second light, the moon's name
	in Japanese, and its words in HUD capitals. It stands on the still.

	<MoonLink href="/worlds/titan" jp="タイタン">Titan</MoonLink>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		/** The name in Japanese: "タイタン". */
		jp?: string;
		/** Opens the app itself (through the Rust side) instead of following `href`. */
		onclick?: () => void;
		/** A link to another app reloads the page; false for a page of this one. */
		external?: boolean;
		/** One line on what is behind the door, shown on hover. */
		title?: string;
		children: Snippet;
	}

	let { href, jp = '', onclick, external = true, title, children }: Props = $props();

	function go(event: MouseEvent) {
		if (!onclick) return;
		event.preventDefault();
		onclick();
	}
</script>

<a class="moon sol-ticks" {href} {title} data-sveltekit-reload={external ? '' : undefined} onclick={go}>
	<span class="diamond" aria-hidden="true"></span>
	{#if jp}<span class="jp" lang="ja">{jp}</span>{/if}
	<span class="words">{@render children()}</span>
</a>

<style>
	.moon {
		--tick-out: 2px;
		--tick-arm: 6px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--target);
		padding: 0 4px;
		color: var(--art-text);
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
		text-decoration: none;
		white-space: nowrap;
		/* It stands on the still: a soft dark glow behind the words. */
		text-shadow: 0 1px 8px color-mix(in srgb, var(--dim) 90%, transparent);
	}

	.diamond {
		width: 7px;
		height: 7px;
		rotate: 45deg;
		border: 1px solid var(--art-second);
		transition: background var(--fade) var(--ease);
	}

	.moon:hover .diamond,
	.moon:focus-visible .diamond {
		background: var(--art-second);
	}

	.jp {
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-size: calc(var(--text-s) + 1px);
		font-weight: 800;
		letter-spacing: 0;
		color: var(--art-second);
	}

	.words {
		transition: color var(--fade) var(--ease);
	}

	.moon:hover .words {
		color: #fff;
	}
</style>
