<!--
	The way back to the page this one was opened from: always 「← 戻る」 BACK,
	the page it leads to in its hint. The Shell places it: at the start of
	the PageHead, or over the pane's corner.
-->
<script lang="ts">
	interface Props {
		label: string;
		go: () => void;
		/** Over the page itself (a backdrop, a cover) rather than in a header. */
		floating?: boolean;
	}

	let { label, go, floating = false }: Props = $props();
</script>

<button type="button" class="back sol-fade" class:floating onclick={go} title="Back to {label} (Alt+←)" aria-label="Back to {label}">
	<svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
		<path d="M5.5 1 1.5 5l4 4M1.5 5H13" fill="none" stroke="currentColor" stroke-width="1.2" />
	</svg>
	<span class="jp" lang="ja">戻る</span>
	<span>Back</span>
</button>

<style>
	.back {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 32px;
		padding: 0 12px 0 10px;
		border: 1px solid var(--line-mid);
		background: var(--deep);
		color: var(--hud-quiet);
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
		white-space: nowrap;
		cursor: pointer;
		transition:
			color var(--fade) var(--ease),
			border-color var(--fade) var(--ease);
	}

	.back:hover {
		color: var(--hud-text);
		border-color: var(--accent);
	}

	.jp {
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-size: calc(var(--text-xs) + 2px);
		font-weight: 800;
		letter-spacing: 0;
		color: var(--accent-text);
	}

	.back:active {
		transform: translateY(1px);
	}

	svg {
		flex: none;
		transition: transform var(--settle) var(--spring);
	}

	.back:hover svg {
		transform: translateX(-2px);
	}

	/* Over a picture it needs its own ground, and stays put while the page scrolls. */
	.floating {
		position: absolute;
		top: var(--s-3);
		left: var(--s-3);
		z-index: 20;
		border-color: var(--line-strong);
		box-shadow: 0 6px 24px color-mix(in srgb, var(--veil) 50%, transparent);
	}
</style>
