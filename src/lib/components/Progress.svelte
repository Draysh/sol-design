<!-- A hairline with a playhead. It fills to its value as it appears, and follows the value after. -->
<script lang="ts">
	interface Props {
		value: number;
		max: number;
		label: string;
		start?: string;
		end?: string;
	}

	let { value, max, label, start, end }: Props = $props();
	const pct = $derived(max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0);

	// Drawn from nothing on the first frame, so the fill grows into place.
	let shown = $state(0);
	$effect(() => {
		const target = pct;
		const frame = requestAnimationFrame(() => (shown = target));
		return () => cancelAnimationFrame(frame);
	});
</script>

<div class="progress">
	<div
		class="track"
		role="progressbar"
		aria-label={label}
		aria-valuemin="0"
		aria-valuemax={max}
		aria-valuenow={value}
		style:--pct={shown}
	>
		<span class="fill"></span>
		<span class="head"></span>
	</div>
	{#if start || end}
		<div class="ends"><span class="sol-quiet">{start}</span><span class="sol-quiet">{end}</span></div>
	{/if}
</div>

<style>
	.progress {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.track {
		position: relative;
		height: 13px;
	}

	.track::before,
	.fill {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		height: 1px;
	}

	.track::before {
		right: 0;
		background: rgb(255 255 255 / 0.2);
	}

	/* The fill is scaled, never resized: the compositor's work. */
	.fill {
		width: 100%;
		background: var(--text);
		transform: scaleX(calc(var(--pct) / 100));
		transform-origin: left;
		transition: transform var(--rise) var(--ease-out);
	}

	.head {
		position: absolute;
		left: calc(var(--pct) * 1%);
		top: 0;
		width: 1px;
		height: 13px;
		background: var(--text);
		transition: left var(--rise) var(--ease-out);
	}

	.ends {
		display: flex;
		justify-content: space-between;
	}
</style>
