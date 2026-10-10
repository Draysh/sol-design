<!--
	The band across the top of a world's first screen: the lit body, its name
	in a reticle, a callout, moon links and data rows along the bottom. It is
	a header, not a hero: the working surface starts right under it.
	DESIGN.md, "The band", explains each part.

	The compositions are the apps' (Worlds.qml): a landscape frame 1600 × 900
	(a 390-wide one 580 tall in portrait) spans the band's width, and the band
	shows its middle. Once the band stops growing the bodies stop too, and the
	frame widens instead, so a body is either whole beside the name or a
	horizon rising from the band's bottom edge.

	It arrives in order: the body rises, the reticle finds the name, the
	callout and the strip of facts settle after it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Moon, Row } from '../types.js';
	import { skyOf, world as worldFor, type Placement } from '../worlds.js';
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

	/** Where a body sits: across by the frame's width (`--u`), its size and height by `--v`. */
	function place(p: Placement) {
		return `left: calc(var(--u) * ${p.cx} - var(--v) * ${p.r}); top: calc(var(--v) * ${p.cy - p.r}); width: calc(var(--v) * ${p.r * 2});`;
	}

	/** The real sky where the world follows it, else where the sheet sets it. */
	function lightOf(world: string, p: Placement) {
		return skyOf(world) ?? p;
	}
</script>

<div class="wrap">
	<section class="sheet sol-sky" style:--world={w.color} aria-label={name ?? w.name}>
		<!-- The frame the placements are made for, centred on the band. -->
		<div class="frame">
			<div class="sky landscape" aria-hidden="true">
				<div class="body" style={place(w.hero)}>
					<Body world={id} light={lightOf(id, w.hero).light} phase={lightOf(id, w.hero).phase} label="" />
				</div>
				{#each w.companions ?? [] as c (c.world)}
					<div class="body" style={place(c)}>
						<Body world={c.world} light={lightOf(c.world, c).light} phase={lightOf(c.world, c).phase} label="" />
					</div>
				{/each}
			</div>
			<div class="sky portrait" aria-hidden="true">
				<div class="body" style={place(w.portrait)}>
					<Body world={id} light={lightOf(id, w.portrait).light} phase={lightOf(id, w.portrait).phase} label="" />
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
				<!-- Where the world puts it (a flipped one ends there), kept inside the band. -->
				<div
					class="callout"
					style={w.callout.flip
						? `right: max(var(--margin), calc(100% - var(--u) * ${w.callout.x})); top: calc(var(--v) * ${w.callout.y});`
						: `left: min(max(var(--margin), calc(var(--u) * ${w.callout.x})), calc(100% - var(--margin) - 160px)); top: calc(var(--v) * ${w.callout.y});`}
				>
					<Callout lines={callout} flip={w.callout.flip} />
				</div>
			{/if}
		</div>
	</section>
	{#if rows.length}
		<!-- The facts, on a strip of their own under the band. -->
		<div class="rows sol-sky" style:--world={w.color}>
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
		/* The frame's unit across, and for heights and sizes: as `--u` until the band stops growing. */
		--u: calc(100cqw / 1600);
		--v: min(var(--u), calc(400px / 470));
		--reticle: clamp(140px, calc(var(--u) * 200), 210px);
		position: relative;
		width: 100%;
		height: clamp(260px, calc(var(--u) * 470), 400px);
		overflow: hidden;
		background: var(--deep);
		border-bottom: 1px solid var(--line);
		isolation: isolate;
	}

	/* The frame keeps its shape; the band shows its middle. */
	.frame {
		position: absolute;
		left: 0;
		width: 100%;
		top: calc(50% - var(--v) * 450);
		height: calc(var(--v) * 900);
		animation: breathe var(--drift) ease-in-out infinite;
	}

	/* A slow drift, so the scene breathes. */
	@keyframes breathe {
		50% {
			transform: translateY(-4px);
		}
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

	.center {
		position: absolute;
		left: 50%;
		top: calc(var(--v) * 450);
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
		color: var(--text);
		text-shadow: 0 0 18px color-mix(in srgb, var(--veil) 70%, transparent);
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
		gap: var(--s-1) var(--s-4);
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
		background: var(--deep);
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
			--v: min(var(--u), calc(360px / 340));
			--reticle: 140px;
			height: clamp(240px, calc(var(--u) * 340), 360px);
		}

		.frame {
			top: calc(50% - var(--v) * 290);
			height: calc(var(--v) * 580);
		}

		.landscape,
		.callout {
			display: none;
		}

		.portrait {
			display: block;
		}

		.center {
			top: calc(var(--v) * 290);
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

	@media (prefers-reduced-motion: reduce) {
		.frame {
			animation: none;
		}
	}
</style>
