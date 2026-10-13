<!-- An on/off switch: a square hairline track and a square that springs across into the light. -->
<script lang="ts">
	interface Props {
		label: string;
		checked: boolean;
		hint?: string;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let { label, checked = $bindable(), hint, disabled = false, onchange }: Props = $props();
	const uid = $props.id();
</script>

<div class="toggle">
	<button
		id="{uid}-switch"
		type="button"
		role="switch"
		aria-checked={checked}
		aria-describedby={hint ? `${uid}-hint` : undefined}
		{disabled}
		onclick={() => {
			checked = !checked;
			onchange?.(checked);
		}}
	>
		<span class="track" aria-hidden="true"><span class="disc"></span></span>
		<span class="label">{label}</span>
	</button>
	{#if hint}<p class="hint" id="{uid}-hint">{hint}</p>{/if}
</div>

<style>
	.toggle {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	button {
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: var(--target);
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--text);
		font-size: var(--text-m);
		font-weight: var(--weight-value);
		text-align: left;
		cursor: pointer;
	}

	button:disabled {
		color: var(--text-faint);
		cursor: default;
	}

	/* Focus: arcs round the switch, not a box round the row. */
	button:focus-visible {
		outline: none;
	}

	button:focus-visible .track {
		outline: 1px solid var(--hud-text);
		outline-offset: 4px;
	}

	.track {
		position: relative;
		flex: none;
		width: 36px;
		height: 18px;
		border: 1px solid var(--line-strong);
		transition: border-color var(--lock) var(--ease);
	}

	button:hover:not(:disabled) .track {
		border-color: var(--accent);
	}

	.disc {
		position: absolute;
		left: 3px;
		top: 3px;
		width: 10px;
		height: 10px;
		background: var(--hud-quiet);
		transition:
			transform var(--settle) var(--spring),
			background var(--lock) var(--ease),
			box-shadow var(--settle) var(--ease-out);
	}

	/* Pressed: the disc stretches towards where it is going. */
	button:active:not(:disabled) .disc {
		transform: scaleX(1.3);
		transform-origin: left;
	}

	[aria-checked='true'] .track {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 14%, transparent);
	}

	[aria-checked='true'] .disc {
		transform: translateX(18px);
		background: var(--accent);
		box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 60%, transparent);
	}

	[aria-checked='true']:active:not(:disabled) .disc {
		transform: translateX(18px) scaleX(1.3);
		transform-origin: right;
	}

	.hint {
		padding-left: 50px;
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
