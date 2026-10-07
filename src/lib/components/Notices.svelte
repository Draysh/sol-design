<!-- Where in-app notices appear: the top edge, politely announced. -->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { notices } from '../client/notices.svelte.js';
	import WorldGlyph from './WorldGlyph.svelte';
</script>

<div class="notices" role="status" aria-live="polite">
	{#each notices.list as notice (notice.id)}
		<div
			class="notice"
			class:error={notice.tone === 'error'}
			role="group"
			aria-label={notice.title}
			transition:fly={{ y: -12, duration: 240 }}
			onmouseenter={() => notices.hold(notice.id)}
			onmouseleave={() => notices.linger(notice.id)}
			onfocusin={() => notices.hold(notice.id)}
			onfocusout={() => notices.linger(notice.id)}
		>
			<WorldGlyph world={notice.world} size={14} />
			<div class="text">
				<span class="sol-label">{notice.title}</span>
				{#if notice.body}<span class="body">{notice.body}</span>{/if}
			</div>
			<button aria-label="Dismiss" onclick={() => notices.dismiss(notice.id)}>
				<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"
					><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.2"></path></svg
				>
			</button>
		</div>
	{/each}
</div>

<style>
	.notices {
		position: fixed;
		top: var(--s-3);
		left: 50%;
		z-index: 50;
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		width: min(440px, calc(100vw - 32px));
		translate: -50% 0;
		pointer-events: none;
	}

	.notice {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px 4px 14px 18px;
		background: rgb(10 10 10 / 0.92);
		box-shadow: inset 0 0 0 1px var(--line-mid);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		pointer-events: auto;
	}

	.notice :global(svg:first-child) {
		margin-top: 2px;
		flex: none;
	}

	.notice.error {
		box-shadow: inset 0 0 0 1px var(--danger);
	}

	.text {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.body {
		font-size: var(--text-s);
		color: var(--text-value);
	}

	button {
		display: grid;
		flex: none;
		place-items: center;
		width: var(--target);
		height: var(--target);
		margin-top: -12px;
		border: 0;
		background: transparent;
		color: var(--text-quiet);
		cursor: pointer;
	}

	button:hover {
		color: var(--text-bright);
	}
</style>
