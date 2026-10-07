<!--
	The band across the top of a world's first screen: the lit body, its name
	in a reticle, a callout, moon links and data rows along the bottom. It is
	a header, not a hero: the working surface starts right under it.
	DESIGN.md, "The band", explains each part.

	It arrives in order: the body rises, the reticle finds the name, the
	callout and the strip of facts settle after it.
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
		<!-- The 1600 × 900 frame the placements are made for, centred on the band. -->
		<div class="frame">
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
		</div>

		<div class="center">
			<Reticle tilt={w.tilt} size="var(--reticle)">
				<h1 class="name">{name ?? w.name}</h1>
			</Reticle>
			{#if moons.length || children}
				<div class="under">
					{#each moons as moon (moon.id)}
						<MoonLink href={moon.href} onclick={moon.onclick}>{moon.label}</MoonLink>
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
		</div>
	</section>
	{#if rows.length}
		<!-- The facts, on a strip of their own under the band. -->
		<div class="rows">
			{#each blocks as { block, at }, i (i)}
				<div class="block at-{at}" style:--i={i}>
					<DataRows rows={block} align={at} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.wrap {
		container-type: inline-size;
		width: 100%;
	}

	.sheet {
		--u: calc(100cqw / 1600);
		--reticle: clamp(140px, calc(var(--u) * 200), 210px);
		position: relative;
		width: 100%;
		height: clamp(260px, calc(var(--u) * 470), 400px);
		overflow: hidden;
		background: var(--space);
		border-bottom: 1px solid var(--line);
		isolation: isolate;
	}

	/* The frame keeps its 16:9 shape; the band shows its middle. */
	.frame {
		position: absolute;
		left: 0;
		width: 100%;
		top: calc(50% - var(--u) * 450);
		height: calc(var(--u) * 900);
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
		/* Drawn once into its own layer, so scrolling under the band costs nothing. */
		will-change: transform;
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

	/* The name comes into focus: from wide-spaced and faint to set. */
	.name {
		white-space: nowrap;
		font-weight: var(--weight-name);
		font-size: clamp(20px, calc(var(--u) * 36), 34px);
		letter-spacing: var(--track-name);
		line-height: 1;
		text-shadow: 0 0 18px rgb(0 0 0 / 0.7);
		animation: focus var(--rise) var(--ease-out) both;
		animation-delay: calc(var(--rise) / 4);
	}

	@keyframes focus {
		from {
			opacity: 0;
			letter-spacing: 0.3em;
		}
	}

	.under {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: var(--s-2) var(--s-4);
		margin-top: var(--s-2);
		animation: sol-settle var(--settle) var(--ease-out) both;
		animation-delay: calc(var(--rise) / 2);
	}

	.callout {
		position: absolute;
		animation: sol-fade var(--fade) var(--ease) both;
		animation-delay: calc(var(--rise) / 2);
	}

	.rows {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		align-items: start;
		gap: var(--s-4);
		padding: var(--s-2) var(--margin);
		border-bottom: 1px solid var(--line);
	}

	.block {
		animation: sol-settle var(--settle) var(--ease-out) both;
		animation-delay: calc(var(--rise) / 3 + var(--i, 0) * var(--stagger) * 3);
	}

	.at-center {
		grid-column: 2;
	}

	.at-right {
		grid-column: 3;
	}

	@container (max-width: 700px) {
		.sheet {
			--u: calc(100cqw / 390);
			--reticle: 140px;
			height: clamp(240px, calc(var(--u) * 340), 360px);
		}

		.frame {
			top: calc(50% - var(--u) * 290);
			height: calc(var(--u) * 580);
		}

		.landscape,
		.callout {
			display: none;
		}

		.portrait {
			display: block;
		}

		.center {
			top: calc(var(--u) * 290);
		}

		.rows {
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
