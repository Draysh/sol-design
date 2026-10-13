<!--
	The frame around every screen, as the apps' Shell: the world's ground
	(its film's still, or its drawn sky) behind everything, a floating glass
	rail on the left (the world's kanji in a diamond and its name, its
	sections numbered 01, 02 … with their Japanese, its status at the foot)
	and a pane on the right that scrolls on its own. The window itself never
	scrolls, so the chrome stays put like an app's, not a website's. Ctrl (or
	⌘) + 1…9 jumps to a section, `/` opens the app's search and `?` a sheet
	of the keys.

	The window wears a flavour (`flavour`, the world's own unless given: a
	page about another world may wear that one's), and stands on its stills
	(`stills`, the addresses of the person's pictures, named as the apps name
	them), one per section in turn; without one, the flavour's drawn sky.

	Under the sections, doors: Sol, and the moons or planet this world works
	with. Every section can carry a `hint`, one line on what it is for, shown
	on hover, and its `jp`. The light marks the current section and glides to
	the next one when it changes. A page turns the flavour's way, as the
	apps' do, in one `--turn` (420 ms): a wipe covers the pane, holds, and
	the new screen is revealed under it (Neptune's slices with a red and a
	cyan edge, Saturn's film bars closing to black on an amber line,
	Mercury's ink blooming from the title with a vermilion edge, Terra's
	sweep of sunlight). Transforms and opacity only, over the pane and never
	in the way of a click; with less motion, a fade. There is no opening: the
	first screen simply settles in.

	A page opened from another (a title from the library) offers the way
	back by name, in its PageHead or over the pane's corner; Alt+← and the
	mouse's back button go back too (on Linux the app passes the button on
	as a `sol:navigate` event: orbit::mouse). Going back lands where you left off:
	the pane's scroll is kept for every step of the history.

	<Shell
		world="saturn"
		path={page.url.pathname}
		links={[{ href: '/', label: 'Home', jp: 'ホーム', hint: 'What you are in the middle of', current: true }]}
		doors={[{ world: 'sol', label: 'Sol', onclick: openSol }]}
		search="/search"
		shortcuts={[{ keys: 'Space', does: 'Play or pause' }]}
	>
		{#snippet actions()}<LinkStatus online unsent={0} />{/snippet}
		{#snippet footer()}<Transport />{/snippet}
		…
	</Shell>
-->
<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { BACK, type BackContext, type BackTarget } from '../back.js';
	import { HERE, type HereContext } from '../here.js';
	import { flavourOf, jpOf, stillFor } from '../look.js';
	import '../styles/index.css';
	import type { Door, ShellLink, Shortcut } from '../types.js';
	import { world as worldFor } from '../worlds.js';
	import Back from './Back.svelte';
	import Ground from './Ground.svelte';
	import Notices from './Notices.svelte';
	import Shortcuts from './Shortcuts.svelte';
	import WorldGlyph from './WorldGlyph.svelte';

	interface Props {
		/** The world this app is; its colour becomes `--world`. */
		world: string;
		/** The world whose flavour the window wears: the app's own unless a page is about another. */
		flavour?: string;
		/** The person's stills the ground may show, by address (`<world>-ground-<n>.jpg`): none, the drawn sky. */
		stills?: string[];
		links?: ShellLink[];
		/** Where the wordmark leads. */
		home?: string;
		/** The current page's path. A page whose path isn't a section's offers the way back. */
		path?: string;
		/** Doors to other apps, under the sections: Sol, a moon, the planet. */
		doors?: Door[];
		/** Where `/` leads: the app's search page. */
		search?: string;
		/** The app's own keys, for the sheet `?` opens; the Shell's are listed already. */
		shortcuts?: Shortcut[];
		/** The bottom of the sidebar: status, the time, sign out. */
		actions?: Snippet;
		/** A bar along the bottom of the pane, e.g. a player's transport. */
		footer?: Snippet;
		children: Snippet;
	}

	let { world: id, flavour, stills = [], links = [], home = '/', path, doors = [], search, shortcuts = [], actions, footer, children }: Props = $props();
	let keys = $state(false);
	const w = $derived(worldFor(id));
	const wearing = $derived(flavour ?? id);
	const f = $derived(flavourOf(wearing));
	/** The open section, by its place among the links. */
	const at = $derived(links.findIndex((l) => l.current));
	const still = $derived(stillFor(wearing, stills, Math.max(0, at)));
	setContext<HereContext>(HERE, {
		get flavour() {
			return wearing;
		},
		get name() {
			return w.name;
		},
		get section() {
			const l = links[at];
			return l ? { number: at + 1, label: l.label, jp: l.jp } : null;
		}
	});
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

	/** How many times a page has turned (the wipe plays for each), and whether the last went back. */
	let turns = $state(0);
	let turnBack = $state(false);
	const turnWay = $derived(f.turn);

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
		// A page turns when another page opens (not the first, nor the same page again).
		if (nav.type !== 'enter' && nav.from && nav.from.url.pathname !== nav.to?.url.pathname) {
			turns++;
			turnBack = nav.type === 'popstate' && nav.delta !== undefined && nav.delta < 0;
		}
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
	let calm: ReturnType<typeof setTimeout> | undefined;
	function scrolled() {
		if (!scrolling) scrolling = true;
		clearTimeout(calm);
		calm = setTimeout(() => (scrolling = false), 180);
	}
	$effect(() => () => clearTimeout(calm));

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

	/** Whether the key was pressed while writing, where it means itself. */
	function typing(e: KeyboardEvent): boolean {
		const t = e.target;
		return t instanceof Element && !!t.closest('input, textarea, select, [contenteditable]');
	}

	function shortcut(e: KeyboardEvent) {
		// Alt+← and Alt+→: back and forth, except where the arrows move through text.
		if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
			if (typing(e)) return;
			if (e.key === 'ArrowRight') history.forward();
			else if (!goBack()) return;
			e.preventDefault();
			return;
		}
		// `/` opens the search, `?` the keys; neither while writing.
		if (!e.ctrlKey && !e.metaKey && !e.altKey && !typing(e)) {
			// `?` is Shift+/ on most keyboards; some report the slash with Shift held.
			const slash = e.key === '/' || e.code === 'Slash';
			const help = e.key === '?' || (slash && e.shiftKey);
			if (slash && !help && search && !keys) {
				// A page may use `/` itself (a library's find box): it says so by
				// preventing the default, and gets the key. Its handler runs after
				// this one, and a microtask would run between the two (the browser
				// checks for them after every listener), so wait for the next task.
				setTimeout(() => {
					if (!e.defaultPrevented) goto(search);
				}, 0);
				return;
			}
			if (help) {
				e.preventDefault();
				keys = !keys;
				return;
			}
			if (e.key === 'Escape' && keys) {
				keys = false;
				return;
			}
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

<div class="shell" data-flavour={f.id} style:--world={w.color}>
	<Ground world={wearing} {still} />
	<nav class="side sol-chrome" aria-label="Main" bind:this={nav}>
		<span class="sol-glass rail-glass" aria-hidden="true"></span>
		<a class="brand" href={home} title={w.tagline || undefined}>
			<span class="diamond" aria-hidden="true"><span>{jpOf(id).charAt(0)}</span></span>
			<span class="brand-text">
				<span class="brand-jp" lang="ja">{jpOf(id)}</span>
				<span class="brand-name">{w.name}</span>
				{#if w.role}<span class="role">{w.role}</span>{/if}
			</span>
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
							aria-label={link.hint ? `${link.label}. ${link.hint}` : link.label}
							title={[link.hint, i < 9 ? `Ctrl+${i + 1}` : null].filter(Boolean).join(' · ') || undefined}
						>
							<span class="number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
							{#if link.jp}<span class="jp" lang="ja" aria-hidden="true">{link.jp}</span>{/if}
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
		{#if doors.length}
			<ul class="doors" aria-label="Other apps">
				{#each doors as door, i (door.world + door.label)}
					<li class="door" style:--i={links.length + i}>
						{#if door.onclick}
							<button type="button" onclick={door.onclick} title={door.hint} aria-label={door.hint ? `${door.label}. ${door.hint}` : door.label}>
								<WorldGlyph world={door.world} size={10} />
								<span class="label">{door.label}</span>
							</button>
						{:else}
							<a href={door.href ?? '#'} title={door.hint} aria-label={door.hint ? `${door.label}. ${door.hint}` : door.label} data-sveltekit-reload>
								<WorldGlyph world={door.world} size={10} />
								<span class="label">{door.label}</span>
							</a>
						{/if}
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
		<div class="pages">
			<main bind:this={pane} class:scrolling class:backed={!!back && !claimed} class:turned={turns > 0} onscroll={scrolled}>
				{#key path}
					<div class="screen">
						{@render children()}
					</div>
				{/key}
			</main>
			{#if turns > 0}
				{#key turns}
					<div class="turn" data-way={turnWay} class:back={turnBack} aria-hidden="true">
						{#if turnWay === 'slice'}
							{#each [0, 1, 2, 3, 4, 5, 6] as i (i)}<span class="band" style:--i={i} style:--n={[0.1, 0.7, 0.35, 0.9, 0.2, 0.55, 0.8][i]}></span>{/each}
						{:else if turnWay === 'cut'}
							<span class="bar top"></span><span class="bar bottom"></span>
						{:else if turnWay === 'ink'}
							<span class="ink"></span>
						{:else}
							<span class="sun"></span>
						{/if}
					</div>
				{/key}
			{/if}
		</div>
		{#if footer}<footer class="foot">{@render footer()}</footer>{/if}
	</div>
	{#if keys}
		<Shortcuts {shortcuts} search={!!search} sections={links.length} onclose={() => (keys = false)} />
	{/if}
	<Notices />
</div>

<style>
	.shell {
		position: relative;
		display: grid;
		grid-template-columns: calc(var(--sidebar) + var(--s-3)) minmax(0, 1fr);
		height: 100dvh;
		overflow: hidden;
		background: var(--ground);
		color: var(--text);
	}

	/* The rail: floating glass, its foot's corner cut, the light's brackets on its top corners. */
	.side {
		position: relative;
		z-index: 1;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		min-height: 0;
		margin: var(--s-3) 0 var(--s-3) var(--s-3);
		padding: var(--s-3) 0 var(--s-3);
	}

	.rail-glass {
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%);
		background:
			linear-gradient(to right, transparent, var(--highlight) 50%, transparent) top / 100% 1px no-repeat,
			linear-gradient(to bottom, rgb(255 255 255 / 0.04), transparent 30%),
			var(--deep);
	}

	.rail-glass::after {
		top: calc(100% - var(--cut));
		left: 100%;
		rotate: 135deg;
		background: var(--line-mid);
	}

	.side::before,
	.side::after {
		content: '';
		position: absolute;
		top: -1px;
		width: var(--hud-bracket);
		height: var(--hud-bracket);
		border: 0 solid var(--accent);
		pointer-events: none;
	}

	.side::before {
		left: -1px;
		border-width: 2px 0 0 2px;
	}

	.side::after {
		right: -1px;
		border-width: 2px 2px 0 0;
	}

	/* The world: its kanji in a diamond, its name in Japanese over its name in HUD capitals, and what it is for. */
	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: none;
		min-height: var(--nav-height);
		padding: 0 var(--s-3) var(--s-2) 14px;
		color: var(--hud-text);
		text-decoration: none;
	}

	.diamond {
		display: grid;
		place-items: center;
		flex: none;
		width: 30px;
		height: 30px;
	}

	.diamond::before {
		content: '';
		grid-area: 1 / 1;
		width: 21px;
		height: 21px;
		rotate: 45deg;
		border: 1.5px solid var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		transition: rotate var(--settle) var(--spring);
	}

	.brand:hover .diamond::before {
		rotate: 135deg;
	}

	.diamond span {
		grid-area: 1 / 1;
		font-family: var(--font-title);
		font-size: 13px;
		font-weight: 800;
		line-height: 1;
		color: var(--hud-text);
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.25;
	}

	.brand-jp {
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-size: var(--text-l);
		font-weight: 800;
		line-height: 1.1;
	}

	.brand-name {
		font-family: var(--font-caps);
		font-size: var(--text-s);
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
	}

	/* What the world is for, under its name. */
	.role {
		overflow: hidden;
		font-size: var(--text-xs);
		font-weight: var(--weight-value);
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--hud-quiet);
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

	/* The current section carries the flavour's light: a bar down its left and a light fading out to the right. */
	.light {
		position: absolute;
		left: var(--s-2);
		right: var(--s-2);
		top: 0;
		height: var(--control);
		border-left: 3px solid var(--accent);
		background: linear-gradient(to right, color-mix(in srgb, var(--accent) 16%, transparent), transparent 85%);
		opacity: 0;
		pointer-events: none;
	}

	.light.on {
		opacity: 1;
	}

	.light.moved {
		transition:
			transform var(--settle) var(--spring),
			opacity var(--fade) var(--ease);
	}

	ul a {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		height: var(--control);
		padding: 0 12px 0 14px;
		color: var(--hud-quiet);
		font-size: var(--text-s);
		text-decoration: none;
		white-space: nowrap;
		transition:
			color var(--fade) var(--ease),
			background var(--fade) var(--ease);
	}

	ul a:hover {
		color: var(--hud-text);
		background: var(--surface);
	}

	ul a[aria-current='page'] {
		color: var(--hud-text);
	}

	.number {
		flex: none;
		width: 1.6em;
		font-family: var(--font-hud);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.08em;
		color: var(--hud-faint);
		transition: color var(--fade) var(--ease);
	}

	ul a[aria-current='page'] .number {
		color: var(--accent);
	}

	.jp {
		flex: none;
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-size: var(--text-s);
		font-weight: 800;
		color: inherit;
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		transition: transform var(--settle) var(--spring);
	}

	ul a:hover .label {
		transform: translateX(2px);
	}

	.badge {
		display: inline-grid;
		place-items: center;
		min-width: 20px;
		height: 18px;
		margin-left: auto;
		padding: 0 6px;
		clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
		background: var(--accent);
		color: var(--ground);
		font-family: var(--font-hud);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0;
		animation: sol-pop var(--settle) var(--spring) both;
	}

	/* Doors to other apps: after the sections, before the status. */
	.doors {
		display: grid;
		gap: 2px;
		flex: none;
		margin: var(--s-3) var(--s-3) 0;
		padding: var(--s-2) 0 0;
		border-top: 1px solid var(--line);
		list-style: none;
	}

	.door {
		animation: sol-settle var(--settle) var(--ease-out) both;
		animation-delay: calc(var(--i, 0) * var(--stagger));
	}

	.door a,
	.door button {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		height: var(--control);
		padding: 0 12px;
		border: 0;
		background: transparent;
		color: var(--hud-quiet);
		font-family: var(--font);
		font-size: var(--text-s);
		font-weight: var(--weight-value);
		text-align: left;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition:
			color var(--fade) var(--ease),
			background var(--fade) var(--ease);
	}

	.door a:hover,
	.door button:hover {
		color: var(--hud-text);
		background: var(--surface);
	}

	.door :global(svg) {
		flex: none;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-2);
		flex: none;
		margin: var(--s-3) var(--s-3) 0;
		padding: var(--s-3) 0 0 2px;
		border-top: 1px solid var(--line);
		font-size: var(--text-xs);
	}

	.pane {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	/* The pages, and the page turn over them (not over a footer). */
	.pages {
		position: relative;
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
	}

	main {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	/* The first screen settles into the pane. */
	.screen {
		animation: sol-settle var(--turn) var(--ease-out) both;
	}

	/*
	 * A page turning, in one --turn: the wipe covers the pane by --turn-cover
	 * (after a --hit of anticipation), is held to --turn-reveal, and the new
	 * screen lands as it goes. Each way is transforms and opacity only.
	 */
	.turned > .screen {
		animation: turn-land var(--turn) var(--ease-out) both;
	}

	@keyframes turn-land {
		0%,
		67% {
			opacity: 0;
			transform: translateY(6px);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}

	.turn {
		position: absolute;
		inset: 0;
		z-index: 2;
		overflow: hidden;
		pointer-events: none;
		/* Gone once it has played: nothing over the pane stays. */
		animation: turn-gone 0ms linear var(--turn) both;
	}

	@keyframes turn-gone {
		to {
			visibility: hidden;
		}
	}

	.turn > span {
		position: absolute;
		will-change: transform, opacity;
	}

	/* Neptune's: the pane sliced into bands, each torn across in steps, a red edge and a cyan one split off it. */
	.band {
		left: 0;
		width: 100%;
		top: calc(var(--i) * 100% / 7);
		height: calc(100% / 7 + 1px);
		background: var(--ground);
		box-shadow:
			inset 3px 0 0 var(--accent),
			inset -2px 0 0 var(--second);
		animation: turn-slice var(--turn) steps(1, end) both;
		animation-delay: calc(var(--n) * var(--flicker));
	}

	.band:nth-child(even) {
		--from: 104%;
	}

	@keyframes turn-slice {
		0% {
			transform: translateX(var(--from, -104%));
		}
		12% {
			transform: translateX(calc(var(--from, -104%) * 0.6));
		}
		24% {
			transform: translateX(calc(var(--from, -104%) * 0.2));
		}
		36% {
			transform: none;
		}
		52% {
			transform: translateX(calc(var(--from, -104%) * -0.03));
		}
		58% {
			transform: none;
		}
		70% {
			transform: translateX(calc(var(--from, -104%) * -0.5));
		}
		82%,
		100% {
			transform: translateX(calc(var(--from, -104%) * -1));
		}
	}

	/* Saturn's: a film's black bars slam in from the top and the bottom to black, an amber line on each; a black hold, a cut. */
	.bar {
		left: 0;
		width: 100%;
		height: 50.5%;
		/* A film's black, whatever the flavour: not a token. */
		background: #000;
		animation: turn-bar var(--turn) var(--ease-in) both;
	}

	.bar.top {
		top: 0;
		box-shadow: inset 0 -2px 0 var(--accent);
		--from: -100%;
	}

	.bar.bottom {
		bottom: 0;
		box-shadow: inset 0 2px 0 var(--accent);
		--from: 100%;
	}

	@keyframes turn-bar {
		0% {
			transform: translateY(var(--from));
		}
		19% {
			transform: translateY(calc(var(--from) * 0.86));
		}
		43%,
		67% {
			transform: none;
			opacity: 1;
		}
		67.1%,
		100% {
			transform: none;
			opacity: 0;
		}
	}

	/* Mercury's: ink blooming from the title, edged in vermilion, then thinning away from the middle. */
	.ink {
		left: calc(var(--margin, 40px) + 120px);
		top: 90px;
		width: 300vmax;
		height: 300vmax;
		margin: -150vmax 0 0 -150vmax;
		border-radius: 50%;
		background: var(--ground);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--seal) 75%, transparent);
		animation: turn-ink var(--turn) var(--ease-out) both;
	}

	@keyframes turn-ink {
		0% {
			transform: scale(0);
			opacity: 1;
		}
		19% {
			transform: scale(0.02);
		}
		43%,
		67% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}

	/* Terra's: a sweep of sunlight across the pane, its sunflower edge leading, the page coming up into the light. */
	.sun {
		top: 0;
		left: 0;
		width: 160%;
		height: 100%;
		--dir: 1;
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--sky-2) 96%, transparent) 0%,
			color-mix(in srgb, var(--art-text) 94%, transparent) 80%,
			color-mix(in srgb, var(--primary) 85%, var(--art-text)) 85%,
			transparent 92%
		);
		animation: turn-sun var(--turn) var(--ease-out) both;
	}

	@keyframes turn-sun {
		0% {
			transform: translateX(calc(var(--dir) * -100%));
		}
		43%,
		67% {
			transform: translateX(calc(var(--dir) * -12%));
			opacity: 1;
		}
		100% {
			transform: translateX(calc(var(--dir) * -12%));
			opacity: 0;
		}
	}

	/* Back runs the other way. */
	.turn.back .band {
		--from: 104%;
	}

	.turn.back .band:nth-child(even) {
		--from: -104%;
	}

	.turn.back .sun {
		left: auto;
		right: 0;
		--dir: -1;
		background: linear-gradient(
			to left,
			color-mix(in srgb, var(--sky-2) 96%, transparent) 0%,
			color-mix(in srgb, var(--art-text) 94%, transparent) 80%,
			color-mix(in srgb, var(--primary) 85%, var(--art-text)) 85%,
			transparent 92%
		);
	}

	/* With less motion, no wipe: the new screen fades in. */
	@media (prefers-reduced-motion: reduce) {
		.turn {
			display: none;
		}

		.turned > .screen {
			animation: sol-fade var(--turn) var(--ease) both;
		}
	}

	/* Scrolling: the content ignores the pointer until the pane is still.
	   The pane itself keeps it, so the wheel goes on scrolling. */
	.scrolling > .screen {
		pointer-events: none;
	}

	/* On a phone the way back floats where a title card's HUD line would be: the page starts under it. */
	@media (max-width: 700px) {
		.backed > .screen {
			padding-top: 40px;
		}
	}

	.foot {
		flex: none;
		border-top: 1px solid var(--line);
		background: var(--deep);
	}

	/* A narrow window: the rail, each section its number and its Japanese. */
	@media (max-width: 760px) {
		.shell {
			grid-template-columns: calc(var(--rail) + var(--s-2)) minmax(0, 1fr);
		}

		.side {
			margin: var(--s-2) 0 var(--s-2) var(--s-2);
			padding-top: var(--s-2);
		}

		.brand {
			justify-content: center;
			padding: 0 0 var(--s-2);
		}

		.brand-text,
		.label,
		.badge,
		.actions {
			display: none;
		}

		.door .label {
			display: none;
		}

		ul {
			padding: 0 var(--s-1);
		}

		.light {
			left: var(--s-1);
			right: var(--s-1);
		}

		ul a {
			flex-direction: column;
			justify-content: center;
			gap: 0;
			height: 48px;
			padding: 0;
			line-height: 1.2;
		}

		ul li.light {
			height: 48px;
		}

		.number {
			width: auto;
			font-size: 9px;
		}

		.jp {
			font-size: var(--text-xs);
		}

		.doors {
			margin: var(--s-2) var(--s-1) 0;
		}

		.door a,
		.door button {
			justify-content: center;
			padding: 0;
		}
	}
</style>
