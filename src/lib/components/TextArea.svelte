<!-- A label and room to write: underlined like a field, growing as you type. -->
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
	<textarea id={areaId} bind:value {rows} aria-describedby={hint ? `${uid}-hint` : undefined} {...rest}></textarea>
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

	textarea {
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
		box-shadow: 0 1px 0 var(--text-bright);
	}

	.hint {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
