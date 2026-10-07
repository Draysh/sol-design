<!--
	The living brand book: every rule in DESIGN.md, drawn with the real
	components. `npm run dev` to browse it.
-->
<script lang="ts">
	import {
		Body,
		Button,
		Callout,
		Card,
		Check,
		DataRows,
		Field,
		MoonLink,
		Progress,
		RingGauge,
		Sheet,
		Select,
		Toggle,
		Widget,
		WorldGlyph,
		count,
		moonsOf,
		worlds,
		type Row
	} from '../lib/index.js';
	import { notices } from '../lib/client/notices.svelte.js';

	const order = Object.keys(worlds);
	let current = $state('neptune');
	const w = $derived(worlds[current]);

	const sheetRows: Record<string, Row[][]> = {
		sol: [
			[
				{ label: 'Server', value: 'NAS · arm64' },
				{ label: 'Uptime', value: '12 days' }
			],
			[
				{ label: 'Worlds online', value: '4 of 4' },
				{ label: 'Notices', value: '2 unread' }
			],
			[
				{ label: 'Local time', value: '21:48' },
				{ label: 'Desktop AI', value: 'idle' }
			]
		],
		terra: [
			[
				{ label: 'Habits today', value: '2 of 3' },
				{ label: 'Streak', value: '12 days' }
			],
			[{ label: 'Diary', value: '4 entries this week' }],
			[
				{ label: 'Next', value: 'journal before bed' },
				{ label: 'Reminder', value: '22:30' }
			]
		],
		neptune: [
			[
				{ label: 'Now playing', value: 'Tears in Rain' },
				{ label: 'Artist', value: 'Vangelis' }
			],
			[
				{ label: 'Position', value: '2:14 of 5:06' },
				{ label: 'Room', value: 'living room' }
			],
			[
				{ label: 'Source', value: 'Navidrome' },
				{ label: 'Format', value: 'FLAC 24/96' }
			]
		]
	};
	const callouts: Record<string, string[]> = {
		sol: ['Terra = 2 of 3', 'Mercury = 42 due', 'Neptune = playing'],
		terra: ['Japanese = done', 'Walk = done', 'Journal = open'],
		luna: ['Evening entry = open', 'Mood = 4 of 7'],
		saturn: ['Season 2 = now', 'Films = 3 queued'],
		titan: ['Because = Arrival', 'Suggestions = 3'],
		mercury: ['New = 10', 'Learning = 6', 'Review = 26'],
		neptune: ['Next = Blade Runner Blues', 'Then = Memories of Green', 'Queue = 14 tracks'],
		triton: ['Station = Drift 01', 'Tracks = 50']
	};
	const fallbackRows = (id: string): Row[][] => [
		[
			{ label: 'World', value: worlds[id].name },
			{ label: 'Kind', value: worlds[id].kind }
		],
		[{ label: 'Axial tilt', value: `${worlds[id].tilt}°` }],
		[{ label: 'Glow', value: worlds[id].color }]
	];

	let habit = $state('15 minutes of Japanese');
	let scrobble = $state(true);
	let furigana = $state(false);
	let room = $state('living');
	let widget = $state({
		figure: '2 / 3',
		caption: 'habits today',
		progress: { value: 2, max: 3 },
		items: [
			{ id: 'jp', label: '15 minutes of Japanese', meta: '12 d', done: true, toggle: true },
			{ id: 'walk', label: 'Walk outside', meta: '3 d', done: false, toggle: true }
		]
	});
	let server = $state('sol.local');
	let checks = $state([
		{ label: '15 minutes of Japanese', meta: '12 d', done: true },
		{ label: 'Walk outside', meta: '3 d', done: false },
		{ label: 'Journal before bed', meta: '22:30', done: false }
	]);

	let motionKey = $state(0);
	let busy = $state(false);
	let figure = $state(1284);
	let ring = $state({ value: 3, max: 12 });

	const principles = [
		['One light', 'Every body is lit from one side. Darkness is the default; light means attention.'],
		['Black is space', 'The ground is pure black. Groups get corner ticks, not boxes; nothing is filled unless it is the action.'],
		['Name in the reticle', 'Every world names itself inside a reticle whose axis leans at that world’s real tilt.'],
		['Label: value', 'Facts read as label and value. Semibold says what it is; light says what it is now.']
	];
</script>

<header class="top">
	<span class="sol-label">Sol · Design language</span>
	<span class="sol-quiet">Observatory · v0.6</span>
</header>

<Sheet
	world={current}
	callout={callouts[current]}
	rows={sheetRows[current] ?? fallbackRows(current)}
	moons={moonsOf(current).map((m) => ({ id: m.id, label: m.name, href: `#${m.id}` }))}
/>

<nav class="picker" aria-label="Worlds">
	{#each order as id (id)}
		<button aria-pressed={current === id} onclick={() => (current = id)}>
			<WorldGlyph world={id} size={10} />
			{worlds[id].name}
		</button>
	{/each}
</nav>

<section>
	<h2 class="head"><span class="num">01</span><span class="sol-label">Principles</span></h2>
	<div class="grid four">
		{#each principles as [title, text] (title)}
			<div class="principle">
				<span class="sol-label">{title}</span>
				<p class="sol-prose">{text}</p>
			</div>
		{/each}
	</div>
</section>

<section>
	<h2 class="head"><span class="num">02</span><span class="sol-label">Light</span></h2>
	<p class="sol-prose lead">Colour comes only from the bodies. Each world’s glow is sampled from its own photograph and used for glow and icons, never for text or fills.</p>
	<div class="grid eight">
		{#each order as id (id)}
			<div class="swatch" id={id}>
				<div class="disc"><Body world={id} phase={worlds[id].render === 'disc' ? 0.45 : 1} /></div>
				<span class="sol-label">{worlds[id].name}</span>
				<span class="sol-quiet">{worlds[id].color} · {worlds[id].tilt}°</span>
			</div>
		{/each}
	</div>
	<div class="grid three facts">
		<DataRows rows={[{ label: 'Key light', value: 'one side only' }, { label: 'Terminator', value: 'blur 4.5 % of radius' }, { label: 'Limb glow', value: 'world colour, 2.4 % stroke' }]} />
		<DataRows rows={[{ label: 'Space', value: '#000000' }, { label: 'Text', value: '#F2F2F2' }, { label: 'Value · quiet', value: '#BDBDBD · #A8A8A8' }]} />
		<DataRows rows={[{ label: 'Lines', value: 'white at 8 % and 45 %' }, { label: 'Grain', value: 'dark specks, one layer' }, { label: 'This world', value: w.tagline }]} />
	</div>
</section>

<section>
	<h2 class="head"><span class="num">03</span><span class="sol-label">Typography</span></h2>
	<p class="sol-prose lead">One family, Outfit. Weight does the work other systems give to separate fonts.</p>
	<div class="type">
		<div class="spec"><DataRows rows={[{ label: 'Display', value: 'Outfit 200' }, { label: 'Tracking', value: '+10 %' }]} /></div>
		<span class="display">Eight worlds</span>
		<div class="spec"><DataRows rows={[{ label: 'Name', value: 'Outfit 400' }, { label: 'Tracking', value: '+8 %' }]} /></div>
		<span class="name">Neptune</span>
		<div class="spec"><DataRows rows={[{ label: 'Label · value', value: '600 · 300' }, { label: 'Size', value: '11.5 caps' }]} /></div>
		<DataRows size="m" rows={[{ label: 'Orbital period', value: '164.8 years' }]} />
		<div class="spec"><DataRows rows={[{ label: 'Reading', value: 'Outfit 300' }, { label: 'Case', value: 'sentence' }]} /></div>
		<p class="sol-prose">Lists, messages and anything read in full stay in sentence case. Capitals are for names and labels, never for paragraphs.</p>
	</div>
</section>

<section>
	<h2 class="head"><span class="num">04</span><span class="sol-label">Components</span></h2>
	<div class="grid three">
		<Card title="Actions">
			<div class="row">
				<Button variant="primary">Start session</Button>
				<Button>Later</Button>
				<Button variant="quiet">Skip</Button>
			</div>
			<div class="row">
				<Button disabled>Unavailable</Button>
				<Button variant="round" aria-label="Next track">
					<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M11 2v10M2 2l7 5-7 5z" fill="none" stroke="currentColor" stroke-width="1.1"></path></svg>
				</Button>
			</div>
			<p class="note">One filled button per screen. Tab to a button to see the focus ticks lock on.</p>
		</Card>

		<Card title="Fields">
			<Field label="New habit" bind:value={habit} />
			<Field label="Server address" bind:value={server} error="Use an address that starts with https://" />
		</Card>

		<Card title="Choices" world="neptune">
			<Select
				label="Room"
				bind:value={room}
				options={[
					{ value: 'living', label: 'Living room' },
					{ value: 'office', label: 'Office' }
				]}
			/>
			<Toggle label="Scrobble plays" bind:checked={scrobble} hint="Navidrome forwards them to ListenBrainz." />
			<Toggle label="Show furigana" bind:checked={furigana} />
		</Card>

		<Card title="Checklist" world="terra">
			<div>
				{#each checks as item, i (item.label)}
					<Check label={item.label} meta={item.meta} checked={item.done} onchange={(done) => (checks[i].done = done)} />
				{/each}
			</div>
		</Card>

		<Card title="Callout and moon link" world="saturn">
			<Callout lines={['New = 10', 'Learning = 6', 'Review = 26']} />
			<MoonLink href="#titan">Titan · 3 like Arrival</MoonLink>
			<p class="note">Callouts summarise; moon links open another world.</p>
		</Card>

		<Card title="Progress" world="neptune">
			<Progress value={134} max={306} label="Position" start="2:14" end="5:06" />
			<div class="row">
				<RingGauge outer={{ value: 3, max: 12 }} inner={{ value: 1, max: 2 }} center="E03" label="Episode 3 of 12, season 1 of 2" />
				<DataRows rows={[{ label: 'Ring', value: 'season' }, { label: 'Inner', value: 'show' }, { label: 'Centre', value: 'next episode' }]} />
			</div>
		</Card>

		<Card title="Notice and widget" world="terra">
			<Widget
				world="terra"
				view={widget}
				ontoggle={(item, done) => {
					widget.items = widget.items?.map((i) => (i.id === item ? { ...i, done } : i));
				}}
			/>
			<Button onclick={() => notices.show({ world: 'terra', title: 'Terra · walk outside', body: 'Logged. Four days in a row.' })}>Show a notice</Button>
		</Card>
	</div>
	<div class="grid three facts">
		<DataRows rows={[{ label: 'Steps', value: '8 · 16 · 24 · 40 · 64 · 112' }, { label: 'Margin', value: '16 to 96, fluid' }, { label: 'Targets', value: '44 px or more' }]} />
		<DataRows rows={[{ label: 'Corners', value: 'square; round only for discs' }, { label: 'Lines', value: '1 px, never thicker' }, { label: 'Shadows', value: 'none; light comes from bodies' }]} />
		<DataRows rows={[{ label: 'Chrome', value: 'solid black, never blurred' }, { label: 'Bars', value: 'stay put; the pane scrolls' }, { label: 'Grain', value: 'one layer over all' }]} />
	</div>
</section>

<section>
	<h2 class="head"><span class="num">05</span><span class="sol-label">Motion</span></h2>
	<p class="sol-prose lead">
		Things arrive; nothing moves for its own sake. A screen settles into the pane, a list comes a stagger at a time, a
		figure counts up to its value, and the reticle finds its name. Only opacity and transforms move, so the pane
		keeps scrolling at the monitor's full rate. Reduced motion sets every duration to zero.
	</p>
	<div class="grid three">
		<Card title="Arriving">
			{#key motionKey}
				<ul class="sol-stagger demo-list">
					{#each ['Blade Runner Blues', 'Memories of Green', 'Tears in Rain', 'Rachel’s Song', 'One More Kiss, Dear'] as line (line)}
						<li>{line}</li>
					{/each}
				</ul>
			{/key}
			<div class="row">
				<Button onclick={() => motionKey++}>Again</Button>
				<Button busy={busy} onclick={() => {
					busy = true;
					setTimeout(() => (busy = false), 2400);
				}}>Busy for a moment</Button>
			</div>
			<p class="note">A settle is 420 ms; each item comes 28 ms after the one before, never more than 400 ms late. A busy button sweeps a hairline until it is done.</p>
		</Card>

		<Card title="Figures" world="saturn">
			{#key motionKey}
				<p class="figure"><span class="big" use:count={{ value: figure }}>0</span><span class="sol-quiet">episodes</span></p>
			{/key}
			<div class="row">
				<RingGauge outer={ring} inner={{ value: 1, max: 2 }} center="E{String(ring.value).padStart(2, '0')}" label="Episode of season" />
				<Progress value={ring.value} max={ring.max} label="Season" start="E{ring.value}" end="of {ring.max}" />
			</div>
			<div class="row">
				<Button onclick={() => (figure += 137)}>Another evening</Button>
				<Button variant="quiet" onclick={() => (ring = { value: (ring.value % 12) + 1, max: 12 })}>Next episode</Button>
			</div>
			<p class="note">A figure counts up over the rise (900 ms); a progress line fills to its value and follows it after; an arc draws itself.</p>
		</Card>

		<Card title="Tokens">
			<DataRows
				rows={[
					{ label: 'Fade', value: '240 ms · text, colour' },
					{ label: 'Lock', value: '120 ms · ticks, switches' },
					{ label: 'Settle', value: '420 ms · taking a place' },
					{ label: 'Rise', value: '900 ms · a body, a figure' },
					{ label: 'Stagger', value: '28 ms · between siblings' },
					{ label: 'Ease out', value: 'fast out, soft landing' }
				]}
			/>
			<p class="note">Use <code>.sol-settle</code> with <code>--i</code>, <code>.sol-stagger</code> on a list, <code>.sol-fade</code> on changed text, and <code>use:count</code> on a display figure.</p>
		</Card>
	</div>
</section>

<style>
	.top {
		display: flex;
		justify-content: space-between;
		padding: var(--s-4) var(--margin);
	}

	.picker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		padding: var(--s-4) var(--margin);
	}

	.picker button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--target);
		padding: 0 14px;
		border: 1px solid var(--line-mid);
		background: transparent;
		font-size: var(--text-xs);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		color: var(--text-quiet);
		cursor: pointer;
	}

	.picker button[aria-pressed='true'] {
		border-color: var(--text);
		color: var(--text-bright);
	}

	section {
		padding: var(--s-7) var(--margin) 0;
		border-top: 1px solid var(--line);
		margin-top: var(--s-6);
	}

	section:last-of-type {
		padding-bottom: var(--s-7);
	}

	.head {
		display: flex;
		align-items: baseline;
		gap: 28px;
		margin-bottom: var(--s-5);
		text-transform: none;
		letter-spacing: 0;
	}

	.num {
		font-weight: var(--weight-display);
		font-size: 72px;
		line-height: 1;
		letter-spacing: 0.06em;
	}

	.lead {
		margin-bottom: var(--s-5);
	}

	.grid {
		display: grid;
		gap: var(--s-4);
	}

	.four {
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: var(--s-5);
	}

	.three {
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}

	.eight {
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
	}

	.facts {
		margin-top: var(--s-6);
		padding-top: var(--s-4);
		border-top: 1px solid var(--line-mid);
	}

	.principle {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding-top: 18px;
		border-top: 1px solid rgb(255 255 255 / 0.3);
	}

	.swatch {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
	}

	.disc {
		width: 96px;
		margin: 24px 0 14px;
	}

	.type {
		display: grid;
		grid-template-columns: 260px 1fr;
		align-items: center;
		row-gap: 0;
	}

	.type > * {
		padding: var(--s-4) 0;
		border-top: 1px solid var(--line-mid);
	}

	.display {
		font-weight: var(--weight-display);
		font-size: var(--text-3xl);
		line-height: 1;
		letter-spacing: var(--track-display);
		text-transform: uppercase;
	}

	.name {
		font-weight: var(--weight-name);
		font-size: var(--text-xl);
		letter-spacing: var(--track-name);
		text-transform: uppercase;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
	}

	.note {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}

	.note code {
		font-family: inherit;
		color: var(--text-value);
	}

	.demo-list {
		margin: 0;
		padding: 0;
		list-style: none;
		color: var(--text-value);
	}

	.demo-list li {
		min-height: 36px;
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--line);
	}

	.figure {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
	}

	.big {
		font-weight: var(--weight-display);
		font-size: var(--text-2xl);
		line-height: 1;
		letter-spacing: var(--track-display);
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 720px) {
		.type {
			grid-template-columns: 1fr;
		}

		.spec {
			border-top: 1px solid var(--line-mid);
			padding-bottom: 0;
		}

		.spec + * {
			border-top: 0;
		}
	}
</style>
