<!-- ( • ) and a name. Moons are doors to their own apps. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		/** Opens the app itself (through the Rust side) instead of following `href`. */
		onclick?: () => void;
		/** One line on what is behind the door, shown on hover. */
		title?: string;
		children: Snippet;
	}

	let { href, onclick, title, children }: Props = $props();

	function go(event: MouseEvent) {
		if (!onclick) return;
		event.preventDefault();
		onclick();
	}
</script>

<!-- Every world is its own app, so moving between them is a full page load. -->
<a class="moon" {href} {title} data-sveltekit-reload onclick={go}>
	<svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
		<path d="M4 1a6 6 0 0 0 0 8M18 1a6 6 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"></path>
		<circle cx="11" cy="5" r="1.6" fill="currentColor"></circle>
	</svg>
	<span>{@render children()}</span>
</a>

<style>
	.moon {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--target);
		padding: 0 4px;
		font-size: var(--text-xs);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		text-decoration: none;
		color: #e6e6e6;
		transition: color var(--fade) var(--ease);
	}

	.moon:hover {
		color: var(--text-bright);
	}

	.moon:hover span {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 4px;
	}
</style>
