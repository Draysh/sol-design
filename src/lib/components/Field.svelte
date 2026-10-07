<!-- A label and an underlined input. Errors say what to do, in sentence case. Focus lights the line from the left. -->
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

<div class="field" class:invalid={!!error}>
	<label class="sol-label" for={inputId}>{label}</label>
	<span class="control">
		<input
			id={inputId}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error || hint ? noteId : undefined}
			{...rest}
		/>
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

	.sol-label {
		font-size: var(--text-xs);
	}

	.control {
		position: relative;
		display: block;
	}

	input {
		width: 100%;
		height: var(--control);
		padding: 0;
		border: 0;
		border-bottom: 1px solid var(--line-strong);
		border-radius: 0;
		background: transparent;
		color: var(--text);
		font-size: var(--text-m);
		font-weight: var(--weight-value);
		transition: border-color var(--fade) var(--ease);
	}

	input::placeholder {
		color: var(--text-faint);
	}

	input:hover {
		border-color: rgb(255 255 255 / 0.7);
	}

	input:focus-visible {
		outline: none;
		border-color: var(--text-bright);
	}

	/* The light: a line that comes in from the left on focus. */
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

	.invalid input {
		border-color: var(--danger);
	}

	.invalid .control::after {
		background: var(--danger);
	}

	.note {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}

	.error {
		color: var(--danger-text);
	}
</style>
