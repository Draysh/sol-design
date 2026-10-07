<!-- A label and room to write: underlined like a field, growing as you type. Focus lights the line from the left. -->
<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'value'> {
		label: string;
		value?: string;
		hint?: string;
	}

	let { label, value = $bindable(''), hint, id, rows = 3, ...rest }: Props = $props();
	const uid = $props.id();
	const areaId = $derived(id ?? `${uid}-area`);
</script>

<div class="area">
	<label class="sol-label" for={areaId}>{label}</label>
	<span class="control">
		<textarea id={areaId} bind:value {rows} aria-describedby={hint ? `${uid}-hint` : undefined} {...rest}></textarea>
	</span>
	{#if hint}<p class="hint" id="{uid}-hint">{hint}</p>{/if}
</div>

<style>
	.area {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.sol-label {
		font-size: var(--text-xs);
	}

	.control {
		position: relative;
		display: block;
	}

	textarea {
		display: block;
		width: 100%;
		min-height: var(--target);
		padding: 8px 0;
		border: 0;
		border-bottom: 1px solid var(--line-strong);
		border-radius: 0;
		background: transparent;
		color: var(--text);
		font-size: var(--text-m);
		font-weight: var(--weight-value);
		line-height: 1.6;
		resize: vertical;
		field-sizing: content;
		transition: border-color var(--fade) var(--ease);
	}

	textarea::placeholder {
		color: var(--text-faint);
	}

	textarea:hover {
		border-color: rgb(255 255 255 / 0.7);
	}

	textarea:focus-visible {
		outline: none;
		border-color: var(--text-bright);
	}

	.control::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: var(--text-bright);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--settle) var(--ease-out);
		pointer-events: none;
	}

	.control:focus-within::after {
		transform: scaleX(1);
	}

	.hint {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
