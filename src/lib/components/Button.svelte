<!--
	Hairlines and capitals. `primary` is the only filled shape on a screen:
	use it once, for the screen's main action. Focus locks two corner ticks on.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Common = {
		variant?: 'primary' | 'ghost' | 'quiet' | 'round';
		busy?: boolean;
		children: Snippet;
	};
	type Props = Common &
		((HTMLButtonAttributes & { href?: undefined }) | (HTMLAnchorAttributes & { href: string }));

	let { variant = 'ghost', busy = false, children, ...rest }: Props = $props();
</script>

{#if rest.href !== undefined}
	<a class="btn {variant}" {...rest as HTMLAnchorAttributes}>{@render children()}</a>
{:else}
	{@const attrs = rest as HTMLButtonAttributes}
	<button
		class="btn {variant}"
		{...attrs}
		type={attrs.type ?? 'button'}
		disabled={attrs.disabled || busy}
		aria-busy={busy || undefined}
	>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		min-height: var(--control);
		padding: 0 16px;
		border: 1px solid rgb(255 255 255 / 0.4);
		border-radius: 0;
		background: transparent;
		color: var(--text);
		font-family: var(--font);
		font-size: var(--text-xs);
		font-weight: var(--weight-label);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background var(--fade) var(--ease),
			border-color var(--fade) var(--ease),
			color var(--fade) var(--ease);
	}

	.btn:hover:not(:disabled) {
		border-color: var(--text);
		background: var(--surface-hover);
	}

	.primary {
		border-color: var(--text);
		background: var(--text);
		color: var(--space);
		box-shadow: 0 0 40px color-mix(in srgb, var(--world) 30%, transparent);
	}

	.primary:hover:not(:disabled) {
		background: var(--text-bright);
		color: var(--space);
	}

	.quiet {
		border-color: transparent;
		padding: 0 10px;
		color: var(--text-quiet);
	}

	.quiet:hover:not(:disabled) {
		border-color: transparent;
		background: transparent;
		color: var(--text-bright);
	}

	.round {
		width: var(--control);
		padding: 0;
		border-color: rgb(255 255 255 / 0.35);
		border-radius: 50%;
	}

	.btn:disabled {
		border-color: var(--line-mid);
		background: transparent;
		color: var(--text-faint);
		box-shadow: none;
		cursor: default;
	}

	.btn[aria-busy='true'] {
		color: var(--text-quiet);
		cursor: progress;
	}

	/* Focus: two ticks lock onto the control, like a reticle finding its target. */
	.btn:focus-visible {
		outline: none;
	}

	.btn::before,
	.btn::after {
		content: '';
		position: absolute;
		width: 10px;
		height: 10px;
		border: 0 solid var(--text-bright);
		opacity: 0;
		transition:
			opacity var(--lock) var(--ease),
			inset var(--lock) var(--ease);
		pointer-events: none;
	}

	.btn::before {
		left: -10px;
		top: -10px;
		border-width: 1px 0 0 1px;
	}

	.btn::after {
		right: -10px;
		bottom: -10px;
		border-width: 0 1px 1px 0;
	}

	.btn:focus-visible::before {
		left: -6px;
		top: -6px;
		opacity: 1;
	}

	.btn:focus-visible::after {
		right: -6px;
		bottom: -6px;
		opacity: 1;
	}
</style>
