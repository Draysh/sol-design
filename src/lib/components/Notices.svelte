<!--
	Where in-app notices appear: at the top right, clear of a page's title
	card, politely announced. Each drops in on glass, a hairline along its
	bottom runs out as its time does, and it waits while the pointer is on it.
-->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { LINGER_MS, notices } from '../client/notices.svelte.js';
	import WorldGlyph from './WorldGlyph.svelte';

	/** How long a notice takes to drop in: the `--settle` token (0 with less motion). */
	const settle = typeof document === 'undefined' ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--settle')) || 0;

	// Each hold restarts the line when it is let go, as the timer is.
	let cycles = $state<Record<number, number>>({});
	let held = $state<Record<number, boolean>>({});

	function hold(id: number) {
		held[id] = true;
		notices.hold(id);
	}

	function release(id: number) {
		held[id] = false;
		cycles[id] = (cycles[id] ?? 0) + 1;
		notices.linger(id);
	}
</script>

<div class="notices" role="status" aria-live="polite">
	{#each notices.list as notice (notice.id)}
		<div
			class="notice"
			class:error={notice.tone === 'error'}
			role="group"
			aria-label={notice.title}
			transition:fly={{ y: -16, duration: settle }}
			onmouseenter={() => hold(notice.id)}
			onmouseleave={() => release(notice.id)}
			onfocusin={() => hold(notice.id)}
			onfocusout={() => release(notice.id)}
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
			{#key cycles[notice.id] ?? 0}
				<span class="time" class:held={held[notice.id]} style:--linger="{LINGER_MS}ms" aria-hidden="true"></span>
			{/key}
		</div>
	{/each}
</div>

<style>
	.notices {
		position: fixed;
		top: var(--s-3);
		right: var(--s-3);
		z-index: 50;
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		width: min(400px, calc(100vw - 32px));
		pointer-events: none;
	}

	.notice {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px 4px 14px 18px;
		/* Glass: the page behind, blurred, under the flavour's frost, its top-right corner cut. */
		clip-path: polygon(0 0, calc(100% - var(--hud-cut)) 0, 100% var(--hud-cut), 100% 100%, 0 100%);
		background:
			linear-gradient(to right, transparent, var(--highlight) 50%, transparent) top / 100% 1px no-repeat,
			color-mix(in srgb, var(--frost) 86%, transparent);
		box-shadow: inset 0 0 0 1px var(--line-mid);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
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
		transition: color var(--fade) var(--ease);
	}

	button:hover {
		color: var(--accent);
	}

	/* How long it stays: a line that runs out. */
	.time {
		position: absolute;
		left: 1px;
		right: 1px;
		bottom: 1px;
		height: 1px;
		background: var(--accent);
		transform-origin: left;
		animation: run var(--linger) linear both;
	}

	.error .time {
		background: var(--danger);
	}

	.time.held {
		animation-play-state: paused;
	}

	@keyframes run {
		to {
			transform: scaleX(0);
		}
	}
</style>
