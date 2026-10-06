<!-- One checklist row: a square box, the label, and a short note on the right. -->
<script lang="ts">
	interface Props {
		label: string;
		checked: boolean;
		meta?: string;
		busy?: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let { label, checked, meta, busy = false, disabled = false, onchange }: Props = $props();
</script>

<button
	class="check"
	type="button"
	role="checkbox"
	aria-checked={checked}
	aria-busy={busy || undefined}
	disabled={disabled || busy}
	onclick={() => onchange?.(!checked)}
>
	<span class="box" class:on={checked} aria-hidden="true">
		{#if checked}
			<svg width="10" height="10" viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4"></path></svg>
		{/if}
	</span>
	<span class="label" class:done={checked}>{label}</span>
	{#if meta}<span class="sol-quiet">{meta}</span>{/if}
</button>

<style>
	.check {
		display: flex;
		align-items: center;
		gap: 14px;
		width: 100%;
		min-height: 46px;
		padding: 0;
		border: 0;
		border-bottom: 1px solid var(--line);
		background: transparent;
		color: var(--text);
		font-size: var(--text-m);
		font-weight: var(--weight-value);
		text-align: left;
		cursor: pointer;
	}

	.check:last-child {
		border-bottom: 0;
	}

	.check:disabled {
		cursor: default;
	}

	.check[aria-busy='true'] {
		cursor: progress;
	}

	.box {
		display: grid;
		flex: none;
		place-items: center;
		width: 16px;
		height: 16px;
		border: 1px solid rgb(255 255 255 / 0.6);
		color: var(--space);
		transition:
			background var(--lock) var(--ease),
			border-color var(--lock) var(--ease);
	}

	.check:hover .box {
		border-color: var(--text-bright);
	}

	.box.on {
		border-color: var(--text);
		background: var(--text);
	}

	.label {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
		transition: color var(--fade) var(--ease);
	}

	.label.done {
		color: var(--text-quiet);
	}
</style>
