<!--
	A HUD label, as the apps': the flavour's mark, the words in the HUD face
	(capitals tracked wide, for one to three words; a longer label as
	written, in the sans) and a Japanese tag after them in the title serif,
	two pixels larger, in the light: "◆ IN ORBIT · 軌道". The mark is the
	flavour's: Saturn's diamond, Mercury's vermilion seal (the tag's first
	kanji), Neptune's neon slashes, Terra's and Luna's furin. Neptune's
	Japanese comes first instead, lit as a sign, the way a street's signs read.
	Card heads with one; a page may use it for any heading of its own. A
	`caption` (a flavour's `captions`: a Sheet's HUD line) is written as
	given, lowercase, in the HUD face tracked a little.

	<HudLabel text="In orbit" jp="軌道" />
-->
<script lang="ts">
	import { hereFlavour } from '../here.js';
	import { capsFor } from '../look.js';

	interface Props {
		text: string;
		/** Japanese after the words, in the light: "軌道". */
		jp?: string;
		/** The world's mark before the words. */
		mark?: boolean;
		/** The heading level it is, or none for a plain label. */
		level?: 2 | 3 | null;
		/** Written as a caption: "neptune_music / now_playing". */
		caption?: boolean;
		class?: string;
	}

	let { text, jp = '', mark = true, level = null, caption = false, class: className = '' }: Props = $props();
	const flavour = hereFlavour();
	const f = $derived(flavour());
	const sign = $derived(f.motif === 'neon' && jp !== '');
	const caps = $derived(!caption && capsFor(text));
	const tag = $derived(level ? `h${level}` : 'span');
</script>

<svelte:element this={tag} class="hud {className}" class:caps class:caption>
	{#if sign}
		<span class="sign">{jp}</span>
	{:else if mark}
		<span class="mark {f.motif}" aria-hidden="true">
			{#if f.motif === 'shrine'}
				<span class="seal">{jp ? jp.charAt(0) : f.glyph}</span>
			{:else if f.motif === 'neon'}
				//
			{:else if f.motif === 'summer'}
				<svg width="10" height="17" viewBox="0 0 10 17">
					<path d="M1.6 8.4A4.2 4.2 0 0 1 8.4 8.4Z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.2" />
					<rect x="4.4" y="0" width="1.2" height="2" fill="currentColor" />
					<rect x="4.5" y="8.4" width="1" height="2.6" fill="var(--hud-quiet)" />
					<rect x="3.3" y="10.8" width="3.4" height="6" fill="var(--primary)" transform="rotate(8 5 13.8)" />
				</svg>
			{/if}
		</span>
	{/if}
	<span class="words">{text}</span>
	{#if jp && !sign}<span class="sol-jp tag" lang="ja">· {jp}</span>{/if}
</svelte:element>

<style>
	.hud {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		margin: 0;
		font-family: var(--font);
		font-size: calc(var(--text-xs) + 1px);
		font-weight: var(--weight-label);
		letter-spacing: 0;
		text-transform: none;
		line-height: 1.3;
		color: var(--hud-text);
	}

	.caps {
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
	}

	.caption {
		font-family: var(--font-caps);
		font-weight: 500;
		letter-spacing: 0.04em;
	}

	.caption .words {
		white-space: normal;
	}

	.words {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tag {
		flex: none;
	}

	.mark {
		display: inline-grid;
		place-items: center;
		flex: none;
		color: var(--accent-text);
	}

	.dusk::before {
		content: '';
		width: 6px;
		height: 6px;
		rotate: 45deg;
		background: var(--accent);
	}

	.seal {
		display: grid;
		place-items: center;
		width: 15px;
		height: 15px;
		background: var(--seal);
		color: #fff;
		font-family: var(--font-title);
		font-weight: 800;
		font-size: 10px;
		letter-spacing: 0;
		line-height: 1;
	}

	.neon {
		font-family: var(--font-hud);
		font-weight: 700;
		letter-spacing: 0;
	}

	/* Neptune's sign: the Japanese, dark on the light. */
	.sign {
		flex: none;
		padding: 0 5px;
		background: var(--accent);
		color: var(--ground);
		font-family: var(--font-title);
		font-feature-settings: var(--title-features);
		font-weight: 800;
		font-size: calc(var(--text-xs) + 1px);
		letter-spacing: 0;
		text-transform: none;
		line-height: 1.45;
	}
</style>
