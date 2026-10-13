<!--
	One of a title card's big figures: the number in the HUD face, its label
	in HUD capitals and its Japanese tag in the title serif under it, behind a
	short upright rule (the first one's in the light). It stands on the still,
	so it takes the `art` colours. The number counts up as it arrives, on from
	the last when it changes (`--count`; at once with less motion), in the
	room its value takes, so nothing beside it moves.

	<HeroFigure value="04" label="Worlds" jp="世界" lead />
-->
<script lang="ts">
	interface Props {
		/** The figure as it reads: "04", "2/3", "546 KB". "··" while it is not known. */
		value: string;
		/** One to three words. */
		label: string;
		jp?: string;
		/** The first of a row: its rule is in the light. */
		lead?: boolean;
		/** Smaller, for a compact title card. */
		compact?: boolean;
	}

	let { value, label, jp = '', lead = false, compact = false }: Props = $props();

	let el = $state<HTMLElement>();
	let shown = $state('');
	let was = 0;

	/** The value read as a number and what is around it: "546 KB" is 546 with " KB" after. */
	function parts(v: string) {
		const m = /^(\D*?)(\d[\d,]*)(.*)$/.exec(v);
		if (!m) return null;
		const digits = m[2].replace(/,/g, '');
		return { pre: m[1], n: Number(digits), post: m[3], width: digits.length, zeros: digits.length > 1 && digits[0] === '0' };
	}

	$effect(() => {
		const target = value;
		const p = parts(target);
		const length = el ? parseFloat(getComputedStyle(el).getPropertyValue('--count')) || 0 : 0;
		if (!p || length <= 0 || p.n === was) {
			shown = target;
			if (p) was = p.n;
			return;
		}
		const from = was;
		was = p.n;
		shown = p.pre + (p.zeros ? String(from).padStart(p.width, '0') : String(from)) + p.post;
		const start = performance.now();
		let frame = 0;
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / length);
			const eased = 1 - Math.pow(1 - t, 3);
			let s = String(Math.round(from + (p.n - from) * eased));
			if (p.zeros) s = s.padStart(p.width, '0');
			shown = t < 1 ? p.pre + s + p.post : target;
			if (t < 1) frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	});
</script>

<div class="figure" class:lead class:compact bind:this={el}>
	<span class="rule" aria-hidden="true"></span>
	<span class="value">
		<span class="room" aria-hidden="true">{value}</span>
		<span class="shown">{shown || value}</span>
	</span>
	<span class="words">
		<span class="label">{label}</span>
		{#if jp}<span class="jp" lang="ja">{jp}</span>{/if}
	</span>
</div>

<style>
	.figure {
		display: inline-flex;
		align-items: center;
		gap: calc(var(--s-2) + 2px);
		--size: var(--text-figure);
		filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--dim) 75%, transparent))
			drop-shadow(0 1px 10px color-mix(in srgb, var(--dim) 90%, transparent));
	}

	.compact {
		--size: calc(var(--text-figure) * 0.74);
	}

	.rule {
		align-self: stretch;
		width: 2px;
		margin: 4px 0;
		background: var(--art-line);
	}

	.lead .rule {
		background: var(--art-accent);
	}

	/* The number keeps the room its value takes while it counts. */
	.value {
		display: grid;
		font-family: var(--font-display);
		font-size: var(--size);
		font-weight: 700;
		line-height: 1;
		text-transform: uppercase;
		color: #fff;
	}

	.room,
	.shown {
		grid-area: 1 / 1;
		white-space: nowrap;
	}

	.room {
		visibility: hidden;
	}

	.words {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.compact .words {
		gap: 0;
	}

	.label {
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
		color: #fff;
		white-space: nowrap;
	}

	.jp {
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-size: calc(var(--text-xs) + 2px);
		font-weight: 800;
		line-height: 1.2;
		color: var(--art-accent);
	}
</style>
