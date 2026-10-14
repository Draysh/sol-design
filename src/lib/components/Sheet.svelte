<!--
	The band across the top of a world's first screen: a title card on the
	still, as the apps' Sheet. A HUD line (what is on, else the world, the day
	and the hour), the page's Japanese in the title serif (the world's name in
	Japanese unless given), the callout as the English under it, then what
	sits under the title (moon links, the screen's main action) beside two or
	three big figures with their Japanese tags. Never a strip of "LABEL:
	VALUE" facts. It is a header, not a hero: the working surface starts right
	under it, and in a pane under about 1070 px it is a compact card, so the
	page's first card shows in the first view.

	With `slam`, the title comes in as the apps' openings and moments bring
	theirs: kinetic type, slammed in from a little larger on a `--hit`, a
	touch past its size and back, a slash of the world's light across it
	(the overview's greeting, once a visit). With less motion, a fade.

	With a flavour's `outline`, the `lede` (a few English words) stands under
	the title in outline capitals, drawn on as the page lands; with its
	`captions` the HUD line is a caption after the world's tag
	("saturn_films / tue_14_oct / 22:40"). A `hero` (the address of the
	navigator's cut-out, the person's own picture) stands at the right,
	cropped by the band's foot, in a window from 1300 px wide; under that
	there is no room for her beside the words, and she isn't shown.

	<Sheet world="saturn" jp="続きから。" lede="Pick up where you left off"
		figures={[{ value: '06', label: 'Watching', jp: '視聴中' }]} />
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { hereFlavour } from '../here.js';
	import { caption, jpOf, outlined, tagOf } from '../look.js';
	import type { Figure, Moon } from '../types.js';
	import { world as worldFor } from '../worlds.js';
	import HeroFigure from './HeroFigure.svelte';
	import HudLabel from './HudLabel.svelte';
	import MoonLink from './MoonLink.svelte';

	interface Props {
		world: string;
		/** The world's name in English; defaults to its own. */
		name?: string;
		/** The title in Japanese: "おかえり。". The world's name in Japanese when not given. */
		jp?: string;
		/** The HUD line over the title, after the world's name or tag, and its Japanese. The day when not given. */
		hud?: string;
		hudJp?: string;
		/** A few English words under the title, in outline capitals where the flavour has them. */
		lede?: string;
		/** The English under that: a sentence, or facts as "Walk = done". */
		callout?: string[];
		/** The navigator's cut-out, standing at the right in a wide window: its address, or "" for none. */
		hero?: string;
		/** Two or three big figures beside what sits under the title. */
		figures?: Figure[];
		/** Links to the world's moons (or its planet), shown under the title. */
		moons?: Moon[];
		/** Extra content under the title, such as the screen's main action. */
		children?: Snippet;
		/** The title slams in (kinetic type), rather than settling. */
		slam?: boolean;
	}

	let { world: id, name, jp, hud, hudJp = '', lede = '', callout = [], hero = '', figures = [], moons = [], children, slam = false }: Props = $props();
	const flavour = hereFlavour();
	const f = $derived(flavour());
	let heroGone = $state('');
	const showHero = $derived(hero !== '' && heroGone !== hero);

	const w = $derived(worldFor(id));
	const title = $derived(jp ?? jpOf(id));
	const line = $derived(callout.map((l) => l.replace(/\s*=\s*/, ': ')).join(' · '));
	const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
	const head = $derived(f.captions ? caption(hud ?? day, tagOf(id)) : `${name ?? w.name} · ${hud ?? day}`);
	const outline = $derived(outlined(lede, f));
</script>

<section class="sheet" class:heroed={showHero} aria-label={name ?? w.name}>
	{#if showHero}
		<img class="hero" src={hero} alt="" decoding="async" onerror={() => (heroGone = hero)} />
	{/if}
	<div class="card">
		<span class="hud-line"><HudLabel text={head} jp={hudJp} caption={f.captions} /></span>
		<h1 class="title" class:slam lang="ja">{title}</h1>
		{#if lede}<p class="lede" class:sol-outline={outline} class:sol-draw={outline}>{lede}</p>{/if}
		{#if line}<p class="line">{line}</p>{/if}
	</div>
	{#if moons.length || children || figures.length}
		<div class="under">
			{#if moons.length || children}
				<div class="links">
					{#each moons as moon (moon.id)}
						<MoonLink href={moon.href} jp={jpOf(moon.id)} onclick={moon.onclick} external={false}>{moon.label}</MoonLink>
					{/each}
					{@render children?.()}
				</div>
			{/if}
			{#if figures.length}
				<div class="figures">
					{#each figures.slice(0, 3) as f, i (i)}
						<span class="fig" style:--i={i + 3}><HeroFigure value={f.value} label={f.label} jp={f.jp} lead={i === 0} /></span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	.sheet {
		container-type: inline-size;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--s-3);
		min-height: clamp(260px, 30vw, 400px);
		padding: var(--s-5) var(--margin) var(--s-4);
		border-bottom: 1px solid var(--art-line);
	}

	/* The words stand on the still: a soft dark glow behind them, so they read on a bright one. */
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--s-1);
		min-width: 0;
		max-width: var(--content);
		filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--dim) 70%, transparent))
			drop-shadow(0 2px 16px color-mix(in srgb, var(--dim) 85%, transparent));
	}

	.hud-line {
		animation: sol-fade var(--fade) var(--ease) both;
	}

	.hud-line :global(.hud),
	.hud-line :global(.sol-jp) {
		color: var(--art-accent);
	}

	.hud-line :global(.mark) {
		color: var(--art-accent);
	}

	/* The title in the heavy serif: a long one shrinks to its line before it is cut. */
	.title {
		overflow: hidden;
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-size: clamp(48px, 8cqw, calc(var(--text-hero) * 0.85));
		font-weight: 800;
		letter-spacing: 0;
		text-transform: none;
		line-height: 1.12;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--art-bright);
		animation: sol-settle var(--settle) var(--spring) both;
		animation-delay: calc(var(--stagger) * 2);
	}

	/* Slammed in: from a third larger, landing on a hit a touch small, then its size; a slash of light across it. */
	.title.slam {
		position: relative;
		transform-origin: 0 60%;
		animation: sheet-slam calc(var(--hit) + var(--beat-hold) * 2) var(--ease-out) both;
	}

	.title.slam::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(105deg, transparent 38%, color-mix(in srgb, var(--art-accent) 70%, transparent) 50%, transparent 62%);
		transform: translateX(-110%);
		animation: sheet-slash calc(var(--beat-hold) * 1.5) var(--ease-in) var(--hit) both;
		pointer-events: none;
	}

	/* Opened by a page turn, it slams in as the wipe reveals the page. */
	:global(.turned) .title.slam {
		animation-delay: var(--turn-reveal);
	}

	:global(.turned) .title.slam::after {
		animation-delay: calc(var(--turn-reveal) + var(--hit));
	}

	@keyframes sheet-slam {
		0% {
			opacity: 0;
			transform: scale(1.3);
		}
		20% {
			opacity: 1;
			transform: scale(0.97);
		}
		45% {
			transform: scale(1.01);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes sheet-slash {
		0% {
			opacity: 1;
			transform: translateX(-110%);
		}
		100% {
			opacity: 0;
			transform: translateX(110%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.title.slam {
			animation: sol-fade var(--fade) var(--ease) both;
		}

		.title.slam::after {
			display: none;
		}
	}

	/* A few English words under the title: outline capitals, as large as the column allows. */
	.lede {
		--draw: var(--settle);
		--stroke: 1.5px;
		max-width: 100%;
		margin-top: var(--s-1);
		font-family: var(--font-display);
		font-size: clamp(30px, 4.6cqw, 60px);
		line-height: 1.05;
		color: var(--art-bright);
		overflow-wrap: anywhere;
	}

	.lede.sol-outline {
		font-family: var(--font-hud);
		font-weight: 500;
	}

	/*
	 * The navigator: her cut-out at the right, from a little under the band's top,
	 * cropped by its foot (never at her sides), stepping in once she has loaded.
	 */
	.hero {
		position: absolute;
		right: var(--margin);
		top: var(--s-3);
		z-index: 0;
		height: 165%;
		max-width: min(34%, 440px);
		object-fit: contain;
		object-position: right top;
		pointer-events: none;
		animation: hero-in var(--settle) var(--ease-out) both;
	}

	:global(.turned) .hero {
		animation-delay: var(--turn-reveal);
	}

	@keyframes hero-in {
		from {
			opacity: 0;
			transform: translateX(16px);
		}
	}

	.heroed > :not(.hero) {
		position: relative;
		z-index: 1;
	}

	@media (min-width: 1300px) {
		.heroed {
			overflow: hidden;
			padding-right: calc(var(--margin) + min(34%, 440px));
		}
	}

	@media (max-width: 1299px) {
		.hero {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero {
			animation-name: sol-fade;
		}
	}

	/* The English under the title: the subtitle, in the display face. */
	.line {
		max-width: 62ch;
		font-family: var(--font-display);
		font-size: calc(var(--text-lede) * 0.8);
		font-weight: 700;
		line-height: 1.35;
		color: var(--art-text);
		animation: sol-fade var(--fade) var(--ease) both;
		animation-delay: calc(var(--stagger) * 4);
	}

	.under {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3) var(--s-6);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-1) var(--s-4);
		animation: sol-settle var(--settle) var(--spring) both;
		animation-delay: calc(var(--rise) / 2);
	}

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3) var(--s-5);
	}

	.fig {
		animation: sol-settle var(--settle) var(--spring) both;
		animation-delay: calc(var(--i) * var(--stagger) * 2);
	}

	/* A compact card in a narrower pane, so the page's first card is in view. */
	@container (max-width: 1070px) {
		.title {
			font-size: clamp(40px, 7cqw, 76px);
		}

		.figures :global(.figure) {
			--size: calc(var(--text-figure) * 0.74);
		}
	}

	@media (max-width: 1300px) {
		.sheet {
			min-height: 200px;
			padding-top: var(--s-4);
		}
	}

	@media (max-width: 700px) {
		.sheet {
			min-height: 0;
			padding: var(--s-4) var(--margin) var(--s-3);
		}

		.title {
			font-size: clamp(36px, 12cqw, 56px);
		}

		.line {
			font-size: var(--text-m);
		}

		.figures {
			gap: var(--s-3) var(--s-4);
		}

		.fig:nth-child(3) {
			display: none;
		}
	}
</style>
