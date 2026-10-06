<!-- A dotted leader and a short list: what comes next in this world. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		lines?: string[];
		/** Put the leader on the right, pointing at a body to the right. */
		flip?: boolean;
		children?: Snippet;
	}

	let { lines = [], flip = false, children }: Props = $props();
</script>

<div class="callout" class:flip>
	<svg class="leader" width="72" height="12" viewBox="0 0 72 12" aria-hidden="true">
		<circle cx="4" cy="6" r="3" fill="currentColor"></circle>
		<circle cx="18" cy="6" r="2.4" fill="currentColor"></circle>
		<path d="M26 6H72" stroke="currentColor" stroke-width="1" opacity="0.6"></path>
	</svg>
	<div class="text">
		{#if children}
			{@render children()}
		{:else}
			{#each lines as line, i (i)}
				<span>{line}</span>
			{/each}
		{/if}
	</div>
</div>

<style>
	.callout {
		display: flex;
		align-items: flex-start;
		color: var(--text-bright);
	}

	.leader {
		flex: none;
		margin-top: 4px;
	}

	.text {
		display: flex;
		flex-direction: column;
		padding-left: 10px;
		border-left: 1px solid var(--line-strong);
		font-size: 10.5px;
		font-weight: var(--weight-value);
		line-height: 1.6;
		letter-spacing: var(--track-rows);
		text-transform: uppercase;
		color: #d6d6d6;
		white-space: nowrap;
	}

	.flip {
		flex-direction: row-reverse;
	}

	.flip .leader {
		transform: scaleX(-1);
	}

	.flip .text {
		padding: 0 10px 0 0;
		border-left: 0;
		border-right: 1px solid var(--line-strong);
		text-align: right;
	}
</style>
