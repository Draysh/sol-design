<!--
	Hairlines and HUD capitals, square. `primary` is the only filled shape
	on a screen: use it once, for the screen's main action; it is a
	parallelogram in the flavour's light. `ghost` otherwise, `quiet` for
	low-stakes actions, `round` for an icon alone (a diamond), `danger` for
	what can't be taken back (removing, revoking): the same slant outlined in
	vermilion, never the world's light. Focus locks two corner ticks on; a
	press gives and springs back; while busy, a hairline sweeps along the bottom.

	<Button variant="primary" onclick={save}>Save</Button>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Common = {
		variant?: 'primary' | 'ghost' | 'quiet' | 'round' | 'danger';
		busy?: boolean;
		children: Snippet;
	};
	type Props = Common &
		((HTMLButtonAttributes & { href?: undefined }) | (HTMLAnchorAttributes & { href: string }));

	let { variant = 'ghost', busy = false, children, ...rest }: Props = $props();
</script>

{#snippet inside()}
	<span class="face" aria-hidden="true"></span>
	<span class="text">{@render children()}</span>
	{#if busy}<span class="sweep" aria-hidden="true"></span>{/if}
{/snippet}

{#if rest.href !== undefined}
	<a class="btn sol-ticks {variant}" {...rest as HTMLAnchorAttributes}>{@render inside()}</a>
{:else}
	{@const attrs = rest as HTMLButtonAttributes}
	<button
		class="btn sol-ticks {variant}"
		{...attrs}
		type={attrs.type ?? 'button'}
		disabled={attrs.disabled || busy}
		aria-busy={busy || undefined}
	>
		{@render inside()}
	</button>
{/if}

<style>
	.btn {
		position: relative;
		isolation: isolate;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--control);
		padding: 0 16px;
		border: 0;
		background: transparent;
		color: var(--text);
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition:
			color var(--fade) var(--ease),
			transform var(--settle) var(--spring);
	}

	.text {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* The shape the button is drawn in: a hairline square by default. */
	.face {
		position: absolute;
		inset: 0;
		z-index: -1;
		border: 1px solid rgb(var(--ink) / 0.4);
		background: transparent;
		transition:
			background var(--fade) var(--ease),
			border-color var(--fade) var(--ease);
	}

	.btn:hover:not(:disabled) .face {
		border-color: var(--text);
		background: var(--surface-hover);
	}

	/* A press gives, like a real key, and springs back. */
	.btn:active:not(:disabled) {
		transform: translateY(1px) scale(0.95);
		transition-duration: var(--snap);
		transition-timing-function: var(--ease-out);
	}

	/* The primary: a parallelogram in the flavour's light. */
	.primary,
	.danger {
		padding: 0 calc(16px + var(--lean) / 2);
	}

	.primary .face,
	.danger .face {
		border: 0;
		clip-path: polygon(var(--lean) 0, 100% 0, calc(100% - var(--lean)) 100%, 0 100%);
	}

	.primary {
		color: var(--ground);
	}

	.primary .face {
		background: var(--primary);
	}

	.primary:hover:not(:disabled) .face {
		background: color-mix(in srgb, var(--primary) 88%, white);
	}

	/* What can't be taken back: the same slant, outlined in vermilion. */
	.danger {
		color: var(--danger-text);
	}

	.danger .face {
		border-top: 1px solid var(--danger);
		border-bottom: 1px solid var(--danger);
		background:
			linear-gradient(to bottom right, transparent calc(50% - 0.7px), var(--danger) calc(50% - 0.7px), var(--danger) calc(50% + 0.7px), transparent calc(50% + 0.7px)) left / var(--lean) 100% no-repeat,
			linear-gradient(to bottom right, transparent calc(50% - 0.7px), var(--danger) calc(50% - 0.7px), var(--danger) calc(50% + 0.7px), transparent calc(50% + 0.7px)) right / var(--lean) 100% no-repeat;
	}

	.danger:hover:not(:disabled) .face {
		border-color: var(--danger);
		background-color: color-mix(in srgb, var(--danger) 22%, transparent);
	}

	.quiet {
		padding: 0 10px;
		color: var(--hud-quiet);
	}

	.quiet .face {
		border-color: transparent;
	}

	.quiet:hover:not(:disabled) {
		color: var(--accent);
	}

	.quiet:hover:not(:disabled) .face {
		border-color: transparent;
		background: transparent;
	}

	/* An icon alone: a diamond. */
	.round {
		width: var(--control);
		padding: 0;
	}

	.round .face {
		inset: 14%;
		rotate: 45deg;
		border-color: rgb(var(--ink) / 0.35);
	}

	.btn:disabled {
		color: var(--text-faint);
		cursor: default;
	}

	.btn:disabled .face {
		border-color: var(--line-mid);
	}

	.primary:disabled .face {
		background: color-mix(in srgb, var(--primary) 25%, transparent);
	}

	.primary:disabled {
		color: var(--hud-text);
	}

	.btn[aria-busy='true'] {
		color: var(--text-quiet);
		cursor: progress;
	}

	.primary[aria-busy='true'] .face {
		background: color-mix(in srgb, var(--primary) 55%, transparent);
	}

	/* Busy: a hairline sweeps along the bottom edge until the work is done. */
	.sweep {
		position: absolute;
		left: var(--lean);
		right: var(--lean);
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
		animation: sweep var(--sweep) var(--ease) infinite;
	}

	@keyframes sweep {
		from {
			left: -40%;
		}
		to {
			left: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.btn:active:not(:disabled) {
			transform: none;
		}
	}
</style>
