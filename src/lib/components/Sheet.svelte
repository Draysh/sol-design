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

	<Sheet world="saturn" jp="続きから。" callout={['Pick up where you left off']}
		figures={[{ value: '06', label: 'Watching', jp: '視聴中' }]} />
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { jpOf } from '../look.js';
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
		/** The HUD line over the title, and its Japanese. The world and the day when not given. */
		hud?: string;
		hudJp?: string;
		/** The English under the title: a sentence, or facts as "Walk = done". */
		callout?: string[];
		/** Two or three big figures beside what sits under the title. */
		figures?: Figure[];
		/** Links to the world's moons (or its planet), shown under the title. */
		moons?: Moon[];
		/** Extra content under the title, such as the screen's main action. */
		children?: Snippet;
	}

	let { world: id, name, jp, hud, hudJp = '', callout = [], figures = [], moons = [], children }: Props = $props();

	const w = $derived(worldFor(id));
	const title = $derived(jp ?? jpOf(id));
	const line = $derived(callout.map((l) => l.replace(/\s*=\s*/, ': ')).join(' · '));
	const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
	const head = $derived(hud ?? `${name ?? w.name} · ${day}`);
</script>

<section class="sheet" aria-label={name ?? w.name}>
	<div class="card">
		<span class="hud-line"><HudLabel text={head} jp={hudJp} /></span>
		<h1 class="title" lang="ja">{title}</h1>
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
		color: #fff;
		animation: sol-settle var(--settle) var(--spring) both;
		animation-delay: calc(var(--stagger) * 2);
	}

	.line {
		max-width: 62ch;
		font-size: calc(var(--text-lede) * 0.8);
		font-weight: var(--weight-name);
		line-height: 1.35;
		color: color-mix(in srgb, #fff 92%, transparent);
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
