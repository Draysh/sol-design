<!-- An on/off switch: a hairline track, a disc that moves into the light. -->
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

	.track {
		position: relative;
		flex: none;
		width: 36px;
		height: 18px;
		border: 1px solid var(--line-strong);
		border-radius: 9px;
		transition: border-color var(--lock) var(--ease);
	}

	.disc {
		position: absolute;
		left: 3px;
		top: 3px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--text-quiet);
		transition:
			left var(--lock) var(--ease),
			background var(--lock) var(--ease),
			box-shadow var(--lock) var(--ease);
	}

	[aria-checked='true'] .track {
		border-color: var(--text);
	}

	[aria-checked='true'] .disc {
		left: 21px;
		background: var(--text-bright);
		box-shadow: 0 0 10px color-mix(in srgb, var(--world) 70%, transparent);
	}

	.hint {
		padding-left: 50px;
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
