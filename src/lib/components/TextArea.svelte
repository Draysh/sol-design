<!-- A label in HUD capitals and room to write in a bracketed well, like a field, growing as you type. Focus lights the brackets and a line along the foot. -->
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
	<span class="sol-well">
		<textarea id={areaId} bind:value {rows} aria-describedby={hint ? `${uid}-hint` : undefined} {...rest}></textarea>
		<span class="sol-well-line" aria-hidden="true"></span>
	</span>
	{#if hint}<p class="hint" id="{uid}-hint">{hint}</p>{/if}
</div>

<style>
	.area {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	textarea {
		display: block;
		width: 100%;
		min-height: var(--target);
		padding: 8px var(--s-3);
		border: 0;
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

	textarea:focus-visible {
		outline: none;
	}

	.hint {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
