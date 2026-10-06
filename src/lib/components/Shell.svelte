<!--
	The frame around every Sol app: sign-in check, the bar of worlds, live
	events, notifications and the film grain. An app's root layout is just
	`<Shell world="terra">{@render children()}</Shell>`.
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import '../styles/index.css';
	import { describe, events } from '../client/events.svelte.js';
	import { notify } from '../client/platform.js';
	import { session } from '../client/session.svelte.js';
	import { world as worldFor, worlds } from '../worlds.js';
	import Button from './Button.svelte';
	import Grain from './Grain.svelte';
	import Loader from './Loader.svelte';
	import Notices from './Notices.svelte';
	import WorldGlyph from './WorldGlyph.svelte';

	interface Props {
		/** The app this page belongs to. */
		world: string;
		children: Snippet;
	}

	let { world: id, children }: Props = $props();

	const w = $derived(worldFor(id));
	const order = Object.keys(worlds);
	const open = $derived(
		[...session.open].sort(
			(a, b) => (order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99)
		)
	);
	let status = $state<'loading' | 'ready' | 'unreachable'>('loading');
	let now = $state(new Date());
	const time = $derived(
		new Intl.DateTimeFormat('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: session.me?.tz ?? undefined
		}).format(now)
	);

	function load() {
		status = 'loading';
		session
			.load()
			.then((where) => {
				if (where === 'ok') {
					status = 'ready';
					return;
				}
				const next = encodeURIComponent(location.pathname + location.search);
				location.assign(`/${where}?next=${next}`);
			})
			.catch(() => (status = 'unreachable'));
	}

	onMount(load);

	// While signed in: live events, notifications, a fresh list of worlds, a ticking clock.
	$effect(() => {
		if (status !== 'ready') return;
		events.start();
		const off = events.on('*', (event) => {
			if (!session.notifying.has(event.type)) return;
			if (document.hidden || !document.hasFocus()) {
				notify(worldFor(event.source).name, describe(event));
			}
		});
		const apps = setInterval(() => session.refreshApps(), 30_000);
		const clock = setInterval(() => (now = new Date()), 15_000);
		return () => {
			off();
			clearInterval(apps);
			clearInterval(clock);
			events.stop();
		};
	});

	async function signOut() {
		await session.signOut();
		location.assign('/login');
	}

	// Links within the same app stay client-side; links to other worlds load their app.
	const reload = (target: string) => (target === id ? undefined : '');
</script>

<div class="shell" style:--world={w.color}>
	{#if status === 'ready'}
		<nav class="bar" aria-label="Worlds">
			<a class="brand" href="/" data-sveltekit-reload={reload('sol')} aria-current={id === 'sol' ? 'page' : undefined}>
				<WorldGlyph world="sol" size={9} />
				<span>Sol</span>
			</a>
			<ul>
				{#each open as app (app.id)}
					<li>
						<a href="/{app.id}/" data-sveltekit-reload={reload(app.id)} aria-current={app.id === id ? 'page' : undefined}>
							<WorldGlyph world={app.id} size={9} />
							<span>{worldFor(app.id).name}</span>
						</a>
					</li>
				{/each}
			</ul>
			<div class="meta">
				<span class="live" class:on={events.connected}>{events.connected ? 'Live' : 'Offline'}</span>
				<time class="sol-quiet">{time}</time>
				<Button variant="quiet" onclick={signOut}>Sign out</Button>
			</div>
		</nav>
		<main>
			{@render children()}
		</main>
	{:else if status === 'unreachable'}
		<main class="center">
			<p>Can’t reach Sol. Is it running?</p>
			<Button onclick={load}>Try again</Button>
		</main>
	{:else}
		<main class="center" aria-busy="true">
			<Loader />
		</main>
	{/if}
	<Notices />
	<Grain />
</div>

<style>
	.shell {
		min-height: 100dvh;
	}

	.bar {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: var(--s-5);
		height: var(--nav-height);
		padding: 0 var(--margin);
		background: linear-gradient(var(--space) 40%, transparent);
	}

	.brand,
	ul a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--target);
		font-size: var(--text-xs);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		text-decoration: none;
		color: var(--text-quiet);
		transition: color var(--fade) var(--ease);
	}

	.brand {
		font-size: var(--text-s);
		font-weight: var(--weight-label);
		letter-spacing: 0.32em;
		color: var(--text-bright);
	}

	ul {
		display: flex;
		gap: var(--s-4);
		min-width: 0;
		margin: 0;
		padding: 0;
		overflow-x: auto;
		list-style: none;
		scrollbar-width: none;
	}

	ul a:hover,
	ul a[aria-current='page'] {
		color: var(--text-bright);
	}

	ul a[aria-current='page'] span {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 6px;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		margin-left: auto;
		flex: none;
	}

	.live {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--text-xs);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		color: var(--text-faint);
	}

	.live::before {
		content: '';
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--text-faint);
	}

	.live.on {
		color: var(--text-quiet);
	}

	.live.on::before {
		background: var(--ok);
		box-shadow: 0 0 8px var(--ok);
	}

	.center {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: var(--s-4);
		min-height: 100dvh;
		color: var(--text-value);
	}

	@media (max-width: 720px) {
		.bar {
			gap: var(--s-3);
			padding: 0 var(--s-3);
		}

		.brand span,
		.live,
		time {
			display: none;
		}
	}
</style>
