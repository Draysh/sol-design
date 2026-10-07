<!--
	The frame around every screen: a sidebar on the left (the world, its
	sections, its status at the bottom) and a pane on the right that scrolls
	on its own. The window itself never scrolls, so the chrome stays put like
	an app's, not a website's. Ctrl (or ⌘) + 1…9 jumps to a section.

	The world's light marks the current section and glides to the next one
	when it changes; each screen settles into the pane as it opens.

	A page opened from another (a title from the library) offers the way
	back by name, in its PageHead or over the pane's corner; Alt+← and the
	mouse's back button go back too (on Linux the app passes the button on
	as a `sol:navigate` event: orbit::mouse). Going back lands where you left off:
	the pane's scroll is kept for every step of the history.

	<Shell world="sol" path={page.url.pathname} links={[{ href: '/', label: 'Overview', current: true }]}>
		{#snippet actions()}<Button variant="quiet">Sign out</Button>{/snippet}
		{#snippet footer()}<Transport />{/snippet}
		…
	</Shell>
-->
<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { BACK, type BackContext, type BackTarget } from '../back.js';
	import '../styles/index.css';
	import type { ShellLink } from '../types.js';
	import { world as worldFor } from '../worlds.js';
	import Back from './Back.svelte';
	import Body from './Body.svelte';
	import Grain from './Grain.svelte';
	import Notices from './Notices.svelte';
	import WorldGlyph from './WorldGlyph.svelte';

	interface Props {
		/** The world this app is; its colour becomes `--world`. */
		world: string;
		links?: ShellLink[];
		/** Where the wordmark leads. */
		home?: string;
		/** The current page's path. A page whose path isn't a section's offers the way back. */
		path?: string;
		/** The bottom of the sidebar: status, the time, sign out. */
		actions?: Snippet;
		/** A bar along the bottom of the pane, e.g. a player's transport. */
		footer?: Snippet;
		children: Snippet;
	}

	let { world: id, links = [], home = '/', path, actions, footer, children }: Props = $props();
	const w = $derived(worldFor(id));
	let nav = $state<HTMLElement>();
	let list = $state<HTMLElement>();
	let pane = $state<HTMLElement>();

	// ---- Back, and where each page was left -----------------------------
	// SvelteKit numbers the entries of the history. Leaving one, the pane's
	// scroll and the page's name are kept under its number; coming back to
	// it, the scroll returns. A new page starts at the top.
	const places = new Map<number, number>();
	const names = new Map<number, string>();
	let unrestore: (() => void) | undefined;

	/** The current entry's number, as SvelteKit keeps it in `history.state`. */
	function entry(): number | null {
		if (typeof history === 'undefined') return null;
		const state = history.state as Record<string, unknown> | null;
		const meta = state?.['sveltekit:metadata'] as { historyIndex?: unknown } | undefined;
		const index = meta?.historyIndex ?? state?.['sveltekit:history'];
		return typeof index === 'number' ? index : null;
	}

	// The Shell can open after the app has (behind a sign-in, say), so it
	// starts from the entry it opens on, not from the app's first.
	let here = $state(entry() ?? 0);
	/** The entry the Shell opened on: there's nothing of it to go back to before this. */
	let start = entry() ?? 0;

	beforeNavigate((nav) => {
		if (nav.willUnload || !pane) return;
		unrestore?.();
		places.set(here, pane.scrollTop);
		// A section by its name in the sidebar, any other page by its title.
		names.set(here, links.find((l) => l.href === path)?.label ?? document.title.split(' · ')[0].trim());
	});

	afterNavigate((nav) => {
		here = entry() ?? (nav.type === 'popstate' ? here + nav.delta : nav.type === 'enter' ? 0 : here + 1);
		if (nav.type === 'enter') start = here;
		if (nav.type === 'popstate') restore(places.get(here) ?? 0);
		else if (nav.type !== 'enter' && nav.from?.url.pathname !== nav.to?.url.pathname) pane?.scrollTo({ top: 0 });
	});

	/**
	 * Scrolls the pane to `top` as soon as the page is tall enough, which
	 * takes a moment while it loads. Scrolling or pressing anything first
	 * leaves it be.
	 */
	function restore(top: number) {
		unrestore?.();
		const el = pane;
		if (!el) return;
		el.scrollTop = top;
		if (Math.abs(el.scrollTop - top) < 2) return;
		const own = ['wheel', 'pointerdown', 'touchstart'] as const;
		const stop = () => {
			grows.disconnect();
			clearInterval(poll);
			clearTimeout(timer);
			for (const kind of own) el.removeEventListener(kind, stop);
			window.removeEventListener('keydown', stop);
			unrestore = undefined;
		};
		const again = () => {
			el.scrollTop = top;
			if (Math.abs(el.scrollTop - top) < 2) stop();
		};
		// Growth shows up in the frame it happens; the timer is for a window
		// that isn't painting (hidden, minimised), where observers wait.
		const grows = new ResizeObserver(again);
		for (const child of el.children) grows.observe(child);
		const poll = setInterval(again, 100);
		const timer = setTimeout(stop, 4000);
		for (const kind of own) el.addEventListener(kind, stop, { passive: true });
		window.addEventListener('keydown', stop);
		unrestore = stop;
	}
	$effect(() => () => unrestore?.());

	/** A page that isn't one of the sections, so it was opened from somewhere. */
	const deeper = $derived(!!path && links.length > 0 && !links.some((l) => l.href === path));
	const back = $derived.by((): BackTarget | null => {
		if (!deeper) return null;
		if (here > start) return { label: names.get(here - 1) || 'Back', go: () => history.back() };
		// Opened first thing: up to its section, or home.
		const up = links.find((l) => l.current) ?? links.find((l) => l.href === home) ?? links[0];
		return { label: up.label, go: () => goto(up.href) };
	});

	// A PageHead (or a page's own WayBack) shows the way back itself; without
	// one it floats over the pane's corner.
	let claimed = $state(0);
	setContext<BackContext>(BACK, {
		get back() {
			return back;
		},
		claim() {
			claimed++;
			return () => claimed--;
		}
	});

	/** Back through the history, or up when there's no history to go back through. */
	function goBack(): boolean {
		if (here > start) history.back();
		else if (back) back.go();
		else return false;
		return true;
	}

	// The mouse's own back and forward buttons. WebKitGTK can't tell the page
	// which was pressed, so the app catches them and says (orbit::mouse).
	function mouse(e: MouseEvent) {
		if (e.button === 3 && goBack()) e.preventDefault();
		else if (e.button === 4) {
			e.preventDefault();
			history.forward();
		}
	}
	$effect(() => {
		const told = (e: Event) => {
			const way = (e as CustomEvent<string>).detail;
			if (way === 'back') goBack();
			else if (way === 'forward') history.forward();
		};
		window.addEventListener('sol:navigate', told);
		return () => window.removeEventListener('sol:navigate', told);
	});

	// While the pane scrolls, what slides under a still pointer must not
	// react to it: covers lifting and dropping as they pass read as the page
	// jumping. Hover comes back a moment after the scroll stops.
	let scrolling = $state(false);
	let still: ReturnType<typeof setTimeout> | undefined;
	function scrolled() {
		if (!scrolling) scrolling = true;
		clearTimeout(still);
		still = setTimeout(() => (scrolling = false), 180);
	}
	$effect(() => () => clearTimeout(still));

	// The light: one element that moves to the current section instead of
	// a mark on each, so the change is seen as movement. It appears in place
	// the first time and glides from then on.
	let light = $state({ y: 0, h: 0, on: false, moved: false });
	let lit = false;
	$effect(() => {
		links;
		if (!list) return;
		const place = () => {
			const a = list?.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
			if (!a || !list) {
				light = { y: 0, h: 0, on: false, moved: lit };
				return;
			}
			// Layout positions, not rects: the sections are still settling in,
			// and a section mid-animation is an offset parent of its own.
			let y = 0;
			for (let el: HTMLElement | null = a; el && el !== list; el = el.offsetParent as HTMLElement | null) y += el.offsetTop;
			light = { y, h: a.offsetHeight, on: true, moved: lit };
			lit = true;
		};
		place();
		const ro = new ResizeObserver(place);
		ro.observe(list);
		return () => ro.disconnect();
	});

	function shortcut(e: KeyboardEvent) {
		// Alt+← and Alt+→: back and forth, except where the arrows move through text.
		if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
			const t = e.target as HTMLElement | null;
			if (t?.isContentEditable || t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return;
			if (e.key === 'ArrowRight') history.forward();
			else if (!goBack()) return;
			e.preventDefault();
			return;
		}
		if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
		const n = Number(e.key);
		if (!Number.isInteger(n) || n < 1 || n > 9) return;
		const section = nav?.querySelectorAll<HTMLAnchorElement>('a[data-section]')[n - 1];
		if (section) {
			e.preventDefault();
			section.click();
		}
	}
</script>

<svelte:window onkeydown={shortcut} onmouseup={mouse} />

<div class="shell" style:--world={w.color}>
	<nav class="side sol-chrome" aria-label="Main" bind:this={nav}>
		<a class="brand" href={home}>
			<span class="disc" aria-hidden="true"><Body world={id} label="" /></span>
			<span class="brand-name">{w.name}</span>
		</a>
		{#if links.length}
			<ul bind:this={list}>
				<li
					class="light"
					class:on={light.on}
					class:moved={light.moved}
					style:transform="translateY({light.y}px)"
					style:height="{light.h}px"
					aria-hidden="true"
				></li>
				{#each links as link, i (link.href)}
					<li class="section" style:--i={i}>
						<a
							href={link.href}
							data-section
							aria-current={link.current ? 'page' : undefined}
							title={i < 9 ? `Ctrl+${i + 1}` : undefined}
						>
							{#if link.world}
								<WorldGlyph world={link.world} size={10} />
							{:else}
								<span class="mark" aria-hidden="true"></span>
							{/if}
							<span class="label">{link.label}</span>
							{#if link.badge}
								{#key link.badge}
									<span class="badge" aria-label="{link.badge} waiting">{link.badge}</span>
								{/key}
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
		{#if actions}<div class="actions">{@render actions()}</div>{/if}
	</nav>
	<div class="pane">
		{#if back && !claimed}
			{#key back.label}<Back {...back} floating />{/key}
		{/if}
		<main bind:this={pane} class:scrolling onscroll={scrolled}>
			{#key path}
				<div class="screen">
					{@render children()}
				</div>
			{/key}
		</main>
		{#if footer}<footer class="foot">{@render footer()}</footer>{/if}
	</div>
	<Notices />
	<Grain />
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: var(--sidebar) minmax(0, 1fr);
		height: 100dvh;
		overflow: hidden;
	}

	.side {
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: var(--s-2) 0 var(--s-3);
		border-right: 1px solid var(--line);
		background: var(--space);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: none;
		height: var(--nav-height);
		padding: 0 var(--s-3) 0 20px;
		color: var(--text-bright);
		font-size: var(--text-s);
		font-weight: var(--weight-label);
		letter-spacing: 0.28em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.disc {
		display: block;
		width: 22px;
		flex: none;
		transition: transform var(--settle) var(--ease-out);
	}

	.brand:hover .disc {
		transform: scale(1.08);
	}

	ul {
		position: relative;
		display: grid;
		align-content: start;
		gap: 2px;
		flex: 1;
		min-height: 0;
		margin: var(--s-2) 0 0;
		padding: 0 var(--s-2);
		overflow-y: auto;
		list-style: none;
	}

	.section {
		animation: sol-settle var(--settle) var(--ease-out) both;
		animation-delay: calc(var(--i, 0) * var(--stagger));
	}

	/* The current section carries the world's light. */
	.light {
		position: absolute;
		left: 0;
		top: 0;
		width: 2px;
		margin: 9px 0;
		height: calc(var(--control) - 18px);
		background: var(--world);
		box-shadow: 0 0 8px var(--world);
		opacity: 0;
		pointer-events: none;
	}

	.light.on {
		opacity: 1;
	}

	.light.moved {
		transition:
			transform var(--settle) var(--ease-out),
			opacity var(--fade) var(--ease);
	}

	ul a {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		height: var(--control);
		padding: 0 12px;
		color: var(--text-quiet);
		font-size: var(--text-s);
		text-decoration: none;
		white-space: nowrap;
		transition:
			color var(--fade) var(--ease),
			background var(--fade) var(--ease);
	}

	ul a:hover {
		color: var(--text-bright);
		background: var(--surface);
	}

	ul a[aria-current='page'] {
		color: var(--text-bright);
		background: var(--surface-hover);
	}

	.mark {
		width: 6px;
		height: 6px;
		flex: none;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		transition:
			background var(--lock) var(--ease),
			border-color var(--lock) var(--ease),
			transform var(--settle) var(--ease-out);
	}

	ul a:hover .mark {
		border-color: var(--text-bright);
		transform: scale(1.2);
	}

	ul a[aria-current='page'] .mark {
		border-color: var(--text-bright);
		background: var(--text-bright);
		transform: none;
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		transition: transform var(--settle) var(--ease-out);
	}

	ul a:hover .label {
		transform: translateX(2px);
	}

	.badge {
		display: inline-grid;
		place-items: center;
		min-width: 18px;
		height: 18px;
		margin-left: auto;
		padding: 0 5px;
		border-radius: 9px;
		background: var(--world);
		color: var(--space);
		font-size: 10px;
		font-weight: var(--weight-label);
		letter-spacing: 0;
		animation: sol-pop var(--settle) var(--ease-out) both;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-2);
		flex: none;
		margin-top: var(--s-3);
		padding: var(--s-3) var(--s-3) 0 20px;
		border-top: 1px solid var(--line);
		font-size: var(--text-xs);
	}

	.pane {
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	main {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	/* A screen settles into the pane as it opens. */
	.screen {
		animation: sol-settle var(--settle) var(--ease-out) both;
	}

	/* Scrolling: the content ignores the pointer until the pane is still.
	   The pane itself keeps it, so the wheel goes on scrolling. */
	.scrolling > .screen {
		pointer-events: none;
	}

	.foot {
		flex: none;
		background: var(--space);
	}

	@media (max-width: 760px) {
		.shell {
			grid-template-columns: var(--rail) minmax(0, 1fr);
		}

		.brand {
			justify-content: center;
			padding: 0;
		}

		.brand-name,
		.label,
		.badge,
		.actions {
			display: none;
		}

		ul {
			padding: 0 var(--s-1);
		}

		ul a {
			justify-content: center;
			padding: 0;
		}
	}
</style>
