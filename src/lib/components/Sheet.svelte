<!--
	A world's main screen: the lit body, its name in a reticle, a callout, moon
	links, data rows along the bottom and corner marks. DESIGN.md, "Anatomy of
	a sheet", explains each part.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Moon, Row } from '../types.js';
	import { world as worldFor, type Placement } from '../worlds.js';
	import Body from './Body.svelte';
	import Callout from './Callout.svelte';
	import DataRows from './DataRows.svelte';
	import MoonLink from './MoonLink.svelte';
	import Reticle from './Reticle.svelte';

	interface Props {
		world: string;
		/** Defaults to the world's name. */
		name?: string;
		callout?: string[];
		/** Up to three blocks: left, centre and right. */
		rows?: Row[][];
		/** Links to the world's moons, shown under the name. */
		moons?: Moon[];
		/** Extra content under the name, such as the screen's main action. */
		children?: Snippet;
	}

	let { world: id, name, callout = [], rows = [], moons = [], children }: Props = $props();

	const w = $derived(worldFor(id));
	const blocks = $derived.by(() => {
		const kept = rows.slice(0, 3);
		const at = kept.length === 3 ? (['left', 'center', 'right'] as const) : (['left', 'right'] as const);
		return kept.map((block, i) => ({ block, at: at[i] }));
	});

	function place(p: Placement) {
		return `left: calc(var(--u) * ${p.cx - p.r}); top: calc(var(--u) * ${p.cy - p.r}); width: calc(var(--u) * ${p.r * 2});`;
	}
</script>

<div class="wrap">
	<section class="sheet" style:--world={w.color} aria-label={name ?? w.name}>
		<div class="sky landscape" aria-hidden="true">
			<div class="body" style={place(w.hero)}><Body world={id} label="" /></div>
			{#each w.companions ?? [] as c (c.world)}
				<div class="body" style={place(c)}>
					<Body world={c.world} light={c.light} phase={c.phase} label="" />
				</div>
			{/each}
		</div>
		<div class="sky portrait" aria-hidden="true">
			<div class="body" style={place(w.portrait)}>
				<Body world={id} light={w.portrait.light} phase={w.portrait.phase} label="" />
			</div>
			<div class="fade"></div>
		</div>

		<div class="center">
			<Reticle tilt={w.tilt} size="var(--reticle)">
				<h1 class="name">{name ?? w.name}</h1>
			</Reticle>
			{#if moons.length || children}
				<div class="under">
					{#each moons as moon (moon.id)}
						<MoonLink href={moon.href}>{moon.label}</MoonLink>
					{/each}
					{@render children?.()}
				</div>
			{/if}
		</div>

		{#if callout.length}
			<div
				class="callout"
				style="left: calc(var(--u) * {w.callout.x}); top: calc(var(--u) * {w.callout.y});"
				style:translate={w.callout.flip ? '-100% 0' : undefined}
			>
				<Callout lines={callout} flip={w.callout.flip} />
			</div>
		{/if}

		{#if rows.length}
			<svg class="marks" aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none">
				<path d="M0 20h40M20 0v40" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"></path>
			</svg>
			<svg class="marks right" aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none">
				<path d="M60 20h40M80 0v40" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"></path>
			</svg>
			<div class="rows">
				{#each blocks as { block, at }, i (i)}
					<div class="block at-{at}">
						<DataRows rows={block} align={at} />
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.wrap {
		container-type: inline-size;
		width: 100%;
	}

	.sheet {
		--u: calc(100cqw / 1600);
		--reticle: clamp(170px, calc(var(--u) * 243), 260px);
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		min-height: 520px;
		max-height: calc(100svh - var(--nav-height));
		overflow: hidden;
		background: var(--space);
		isolation: isolate;
	}

	.sky {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.portrait {
		display: none;
	}

	.body {
		position: absolute;
	}

	.fade {
		position: absolute;
		inset: auto 0 0;
		height: 45%;
		background: linear-gradient(transparent, var(--space) 70%);
	}

	.center {
		position: absolute;
		left: 50%;
		top: calc(var(--u) * 450);
		display: flex;
		flex-direction: column;
		align-items: center;
		translate: -50% calc(var(--reticle) / -2);
	}

	.name {
		white-space: nowrap;
		font-weight: var(--weight-name);
		font-size: clamp(22px, calc(var(--u) * 45), 46px);
		letter-spacing: var(--track-name);
		line-height: 1;
		text-shadow: 0 0 18px rgb(0 0 0 / 0.7);
	}

	.under {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: var(--s-2) var(--s-4);
		margin-top: var(--s-2);
	}

	.callout {
		position: absolute;
	}

	.rows {
		position: absolute;
		left: var(--margin);
		right: var(--margin);
		bottom: 40px;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		align-items: end;
		gap: var(--s-4);
	}

	.at-center {
		grid-column: 2;
	}

	.at-right {
		grid-column: 3;
	}

	.marks {
		position: absolute;
		left: calc(var(--margin) - 20px);
		bottom: 130px;
		width: 100px;
		height: 40px;
		color: var(--text-bright);
		opacity: 0.5;
	}

	.marks.right {
		left: auto;
		right: calc(var(--margin) - 20px);
	}

	@container (max-width: 700px) {
		.sheet {
			--u: calc(100cqw / 390);
			--reticle: 150px;
			aspect-ratio: 390 / 580;
			min-height: 0;
		}

		.landscape,
		.callout,
		.marks {
			display: none;
		}

		.portrait {
			display: block;
		}

		.center {
			top: calc(var(--u) * 290);
		}

		.rows {
			left: var(--s-4);
			right: var(--s-4);
			bottom: var(--s-4);
			grid-template-columns: 1fr 1fr;
		}

		.at-center {
			display: none;
		}

		.at-right {
			grid-column: 2;
		}
	}
</style>
