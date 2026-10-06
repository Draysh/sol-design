<!-- A label and a choice, underlined like a field. -->
<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { Option } from '../types.js';

	interface Props extends Omit<HTMLSelectAttributes, 'value'> {
		label: string;
		value?: string;
		options: Option[];
		/** Shown first with an empty value, e.g. `Choose…`. */
		placeholder?: string;
		hint?: string;
	}

	let { label, value = $bindable(''), options, placeholder, hint, id, ...rest }: Props = $props();
	const uid = $props.id();
	const selectId = $derived(id ?? `${uid}-select`);
</script>

<div class="select">
	<label class="sol-label" for={selectId}>{label}</label>
	<div class="control">
		<select id={selectId} bind:value aria-describedby={hint ? `${uid}-hint` : undefined} {...rest}>
			{#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
			{#each options as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.1"></path></svg>
	</div>
	{#if hint}<p class="hint" id="{uid}-hint">{hint}</p>{/if}
</div>

<style>
	.select {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.sol-label {
		font-size: var(--text-xs);
	}

	.control {
		position: relative;
		color: var(--text-quiet);
	}

	select {
		width: 100%;
		height: var(--target);
		padding: 0 24px 0 0;
		border: 0;
		border-bottom: 1px solid var(--line-strong);
		border-radius: 0;
		background: transparent;
		color: var(--text);
		font-size: 17px;
		font-weight: var(--weight-value);
		appearance: none;
		cursor: pointer;
	}

	select:hover {
		border-color: rgb(255 255 255 / 0.7);
	}

	select:focus-visible {
		outline: none;
		border-color: var(--text-bright);
		box-shadow: 0 1px 0 var(--text-bright);
	}

	option {
		background: #0b0b0b;
		color: var(--text);
	}

	svg {
		position: absolute;
		right: 4px;
		top: 50%;
		translate: 0 -50%;
		pointer-events: none;
	}

	.hint {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
