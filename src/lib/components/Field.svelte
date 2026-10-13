<!-- A label in HUD capitals and a bracketed well to type in. Errors say what to do, in sentence case. Focus lights the brackets and a line along the foot. -->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		label: string;
		value?: string;
		hint?: string;
		error?: string;
	}

	let { label, value = $bindable(''), hint, error, id, ...rest }: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const noteId = `${uid}-note`;
</script>

<div class="field">
	<label class="sol-label" for={inputId}>{label}</label>
	<span class="sol-well" class:invalid={!!error}>
		<input
			id={inputId}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error || hint ? noteId : undefined}
			{...rest}
		/>
		<span class="sol-well-line" aria-hidden="true"></span>
	</span>
	{#if error}
		<p class="note error sol-settle" id={noteId}>{error}</p>
	{:else if hint}
		<p class="note" id={noteId}>{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	input {
		display: block;
		width: 100%;
		height: var(--control);
		padding: 0 var(--s-3);
		border: 0;
		background: transparent;
		color: var(--text);
		font-size: var(--text-m);
		font-weight: var(--weight-value);
	}

	input::placeholder {
		color: var(--text-faint);
	}

	input:focus-visible {
		outline: none;
	}

	.note {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}

	.error {
		color: var(--danger-text);
	}
</style>
