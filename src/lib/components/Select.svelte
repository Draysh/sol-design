<!-- A label in HUD capitals and a choice in a bracketed well, like a field. Focus lights the brackets and a line along the foot. -->
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
	<div class="sol-well">
		<select id={selectId} bind:value aria-describedby={hint ? `${uid}-hint` : undefined} {...rest}>
			{#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
			{#each options as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.1"></path></svg>
		<span class="sol-well-line" aria-hidden="true"></span>
	</div>
	{#if hint}<p class="hint" id="{uid}-hint">{hint}</p>{/if}
</div>

<style>
	.select {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.sol-well {
		color: var(--text-quiet);
	}

	select {
		display: block;
		width: 100%;
		height: var(--control);
		padding: 0 36px 0 var(--s-3);
		border: 0;
		background: transparent;
		color: var(--text);
		font-size: var(--text-m);
		font-weight: var(--weight-value);
		appearance: none;
		cursor: pointer;
	}

	select:focus-visible {
		outline: none;
	}

	option {
		background: var(--frost);
		color: var(--text);
	}

	svg {
		position: absolute;
		right: var(--s-3);
		top: 50%;
		translate: 0 -50%;
		pointer-events: none;
		transition: transform var(--settle) var(--spring);
	}

	.sol-well:hover svg {
		transform: translateY(1px);
	}

	.hint {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
