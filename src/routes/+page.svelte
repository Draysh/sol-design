<!--
	The living brand book: every rule in DESIGN.md, drawn with the real
	components, in each flavour (`?flavour=neptune` opens on one). `npm run dev`
	to browse it.
-->
<script lang="ts">
	import {
		Button,
		Card,
		Check,
		DataRows,
		Field,
		Ground,
		HeroFigure,
		HudLabel,
		LinkStatus,
		Progress,
		Select,
		Sheet,
		SlantTicks,
		Toggle,
		Widget,
		flavourOf,
		flavours,
		jpOf,
		moonsOf
	} from '../lib/index.js';
	import { HERE, type HereContext } from '../lib/here.js';
	import { notices } from '../lib/client/notices.svelte.js';
	import { setContext } from 'svelte';

	const order = Object.keys(flavours);
	const asked = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('flavour');
	let current = $state(asked && order.includes(asked) ? asked : 'saturn');
	const f = $derived(flavourOf(current));
	setContext<HereContext>(HERE, {
		get flavour() {
			return current;
		},
		get name() {
			return 'Design';
		},
		get section() {
			return { number: 1, label: 'Design', jp: '意匠' };
		}
	});

	const titles: Record<string, [string, string]> = {
		saturn: ['続きから。', 'Pick up where you left off.'],
		mercury: ['復習、十七枚。', '1 card due and 9 new wait at the gate.'],
		neptune: ['雨音と、君の歌', 'Now playing · Grand Escape'],
		terra: ['夏の午後。', 'A summer afternoon. Two done, two to go.'],
		luna: ['今夜。', 'Bed by half past eleven, and the moon is waxing.']
	};

	let habit = $state('15 minutes of Japanese');
	let server = $state('sol.local');
	let scrobble = $state(true);
	let room = $state('living');
	let busy = $state(false);
	let checks = $state([
		{ label: '15 minutes of Japanese', meta: '12 d', done: true },
		{ label: 'Walk outside', meta: '3 d', done: false }
	]);
	let widget = $state({
		figure: '2 / 3',
		caption: 'habits today',
		progress: { value: 2, max: 3 },
		items: [
			{ id: 'jp', label: '15 minutes of Japanese', meta: '12 d', done: true, toggle: true },
			{ id: 'walk', label: 'Walk outside', meta: '3 d', done: false, toggle: true }
		]
	});

	const principles = [
		['A film’s sky', 'Every page stands on a still from an anime film under its world’s grade, or the world’s drawn sky. The words on it are white.'],
		['Glass', 'Panels are glass with one corner cut at 45°, a hairline and a lit top edge; the page’s lead panel wears brackets.'],
		['Faces by role', 'HUD capitals for labels of one to three words, a sans for reading, the world’s title face for titles and Japanese (never tracked), Corporate Logo for subtitles and big figures.'],
		['One mood a world', 'No day mode: each world keeps its own flavour all day. Sol wears Saturn’s dusk.']
	];
</script>

<div class="book" data-flavour={f.id}>
	<Ground world={current} />
	<div class="content">
		<nav class="picker" aria-label="Flavours">
			{#each order as id (id)}
				<button aria-pressed={current === id} onclick={() => (current = id)}>
					<span class="jp" lang="ja">{jpOf(id)}</span>
					{id}
				</button>
			{/each}
		</nav>

		<Sheet
			slam
			world={current}
			jp={titles[current][0]}
			hud="Design · {f.film}"
			callout={[titles[current][1]]}
			figures={[
				{ value: '05', label: 'Flavours', jp: '風味' },
				{ value: '28', label: 'Components', jp: '部品' },
				{ value: '3', label: 'Faces', jp: '書体' }
			]}
			moons={moonsOf(current).map((m) => ({ id: m.id, label: m.name, href: `?flavour=${m.id}` }))}
		/>

		<section>
			<h2 class="head"><HudLabel text="Principles" jp="原則" /></h2>
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
			<h2 class="head"><HudLabel text="Components" jp="部品" /></h2>
			<div class="grid three">
				<Card title="Actions" jp="操作" lead>
					<div class="row">
						<Button variant="primary">Start session</Button>
						<Button>Later</Button>
						<Button variant="quiet">Skip</Button>
					</div>
					<div class="row">
						<Button variant="danger">Remove</Button>
						<Button disabled>Unavailable</Button>
						<Button variant="round" aria-label="Next track">
							<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M11 2v10M2 2l7 5-7 5z" fill="none" stroke="currentColor" stroke-width="1.1"></path></svg>
						</Button>
						<Button busy={busy} onclick={() => {
							busy = true;
							setTimeout(() => (busy = false), 2400);
						}}>Busy</Button>
					</div>
					<p class="note">One filled button per screen, slanted; what can’t be taken back is the same slant in vermilion.</p>
				</Card>

				<Card title="Fields" jp="入力">
					<Field label="New habit" bind:value={habit} />
					<Field label="Server address" bind:value={server} error="Use an address that starts with https://" />
				</Card>

				<Card title="Choices" jp="選択">
					<Select
						label="Room"
						bind:value={room}
						options={[
							{ value: 'living', label: 'Living room' },
							{ value: 'office', label: 'Office' }
						]}
					/>
					<Toggle label="Scrobble plays" bind:checked={scrobble} hint="Navidrome forwards them to ListenBrainz." />
					<div>
						{#each checks as item, i (item.label)}
							<Check label={item.label} meta={item.meta} checked={item.done} onchange={(done) => (checks[i].done = done)} />
						{/each}
					</div>
				</Card>

				<Card title="Progress" jp="進捗">
					<Progress value={134} max={306} label="Position" start="2:14" end="5:06" />
					<SlantTicks value={0.7} count={14} />
					<DataRows rows={[{ label: 'Done', value: 'the light' }, { label: 'To go', value: 'faint' }, { label: 'Part done', value: 'the next tick part-way' }]} />
				</Card>

				<Card title="Notice and widget" jp="通知">
					<Widget
						world="terra"
						view={widget}
						ontoggle={(item, done) => {
							widget.items = widget.items?.map((i) => (i.id === item ? { ...i, done } : i));
						}}
					/>
					<Button onclick={() => notices.show({ world: 'terra', title: 'Terra · walk outside', body: 'Logged. Four days in a row.' })}>Show a notice</Button>
					<Button variant="ghost" onclick={() => notices.show({ world: 'sol', title: 'Not installed', body: 'TypeError: Failed to fetch', tone: 'error' })}>Show a failure</Button>
				</Card>

				<Card title="Status" jp="状態">
					<div class="col">
						<LinkStatus online unsent={0} />
						<LinkStatus online={false} unsent={2} />
					</div>
					<div class="figures">
						<HeroFigure value="06" label="Watching" jp="視聴中" lead />
						<HeroFigure value="291" label="Episodes" jp="話" />
					</div>
				</Card>
			</div>
		</section>

		<section>
			<h2 class="head"><HudLabel text="Motion" jp="動き" /></h2>
			<Card title="Tokens" jp="時間">
				<DataRows
					rows={[
						{ label: 'Snap', value: '50 ms · a press' },
						{ label: 'Fade', value: '240 ms · text, colour' },
						{ label: 'Settle', value: '420 ms · taking a place, with the spring' },
						{ label: 'Turn', value: '420 ms · a page arriving' },
						{ label: 'Count', value: '720 ms · a figure counting up' },
						{ label: 'Less motion', value: 'fades and instant changes only' }
					]}
				/>
			</Card>
		</section>
	</div>
</div>

<style>
	.book {
		position: relative;
		min-height: 100dvh;
		color: var(--text);
	}

	.content {
		position: relative;
		z-index: 1;
	}

	.col {
		display: grid;
		gap: var(--s-2);
	}

	.picker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		padding: var(--s-4) var(--margin) 0;
	}

	.picker button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--target);
		padding: 0 14px;
		border: 1px solid var(--art-line);
		background: transparent;
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
		color: var(--art-quiet);
		cursor: pointer;
	}

	.picker .jp {
		font-family: var(--font-title);
		font-weight: 800;
		letter-spacing: 0;
		color: var(--art-accent);
	}

	.picker button[aria-pressed='true'] {
		border-color: var(--art-accent);
		color: #fff;
	}

	section {
		max-width: var(--content);
		padding: var(--s-6) var(--margin) 0;
	}

	section:last-of-type {
		padding-bottom: var(--s-7);
	}

	.head {
		margin-bottom: var(--s-4);
	}

	/* The section headings stand on the still: white, as a title card's words. */
	.head :global(.hud) {
		color: var(--art-text);
	}

	.head :global(.sol-jp),
	.head :global(.mark) {
		color: var(--art-accent);
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
		align-items: start;
	}

	.principle {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding-top: 18px;
		border-top: 1px solid var(--art-line);
	}

	.principle .sol-label {
		color: var(--art-accent);
	}

	.principle .sol-prose {
		color: var(--art-quiet);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
	}

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4);
		padding: var(--s-3);
		background: var(--ground);
	}

	.note {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
