<!-- A hairline with a playhead. -->
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
</script>

<div class="progress">
	<div
		class="track"
		role="progressbar"
		aria-label={label}
		aria-valuemin="0"
		aria-valuemax={max}
		aria-valuenow={value}
		style:--pct="{pct}%"
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

	.fill {
		width: var(--pct);
		background: var(--text);
		transition: width var(--fade) var(--ease);
	}

	.head {
		position: absolute;
		left: var(--pct);
		top: 0;
		width: 1px;
		height: 13px;
		background: var(--text);
		transition: left var(--fade) var(--ease);
	}

	.ends {
		display: flex;
		justify-content: space-between;
	}
</style>
