<!--
	Hairlines and capitals. `primary` is the only filled shape on a screen:
	use it once, for the screen's main action. Focus locks two corner ticks
	on; a press gives a little; while busy, a hairline sweeps along the bottom.
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
		{#if busy}<span class="sweep" aria-hidden="true"></span>{/if}
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
		overflow: visible;
		transition:
			background var(--fade) var(--ease),
			border-color var(--fade) var(--ease),
			color var(--fade) var(--ease),
			box-shadow var(--settle) var(--ease-out),
			transform var(--lock) var(--ease);
	}

	.btn:hover:not(:disabled) {
		border-color: var(--text);
		background: var(--surface-hover);
	}

	/* A press gives, like a real key. */
	.btn:active:not(:disabled) {
		transform: translateY(1px);
		transition-duration: 40ms;
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
		box-shadow: 0 0 56px color-mix(in srgb, var(--world) 50%, transparent);
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

	/* Busy: a hairline sweeps along the bottom edge until the work is done. */
	.sweep {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 1px;
		overflow: hidden;
		pointer-events: none;
	}

	.sweep::before {
		content: '';
		position: absolute;
		top: 0;
		width: 40%;
		height: 100%;
		background: var(--text-bright);
		animation: sweep 1.1s var(--ease) infinite;
	}

	@keyframes sweep {
		from {
			left: -40%;
		}
		to {
			left: 100%;
		}
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

	@media (prefers-reduced-motion: reduce) {
		.sweep::before {
			animation-duration: 3s;
		}
	}
</style>
