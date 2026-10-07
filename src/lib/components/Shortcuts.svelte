<!--
	The keys, on a sheet over the pane: what the Shell does everywhere and
	what this app adds. `?` opens it, Escape or a click outside closes it.
-->
<script lang="ts">
	import type { Shortcut } from '../types.js';

	interface Props {
		/** The app's own, shown after the Shell's. */
		shortcuts: Shortcut[];
		/** Whether `/` opens something here. */
		search: boolean;
		/** How many sections `Ctrl+1…` reach. */
		sections: number;
		onclose: () => void;
	}

	let { shortcuts, search, sections, onclose }: Props = $props();

	const everywhere = $derived<Shortcut[]>([
		...(sections
			? [{ keys: sections > 1 ? `Ctrl+1 … ${Math.min(sections, 9)}` : 'Ctrl+1', does: 'Go to a section, in the order of the sidebar' }]
			: []),
		{ keys: 'Alt+←  Alt+→', does: 'Back and forward, like the mouse’s own buttons' },
		...(search ? [{ keys: '/', does: 'Search' }] : []),
		{ keys: '?', does: 'This sheet' }
	]);

	let sheet = $state<HTMLElement>();
	$effect(() => sheet?.focus());

	function key(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onclose();
		}
	}
</script>

<div class="veil sol-fade">
	<button type="button" class="outside" aria-label="Close" onclick={onclose}></button>
	<div
		class="sheet sol-settle"
		role="dialog"
		aria-modal="true"
		aria-labelledby="sol-shortcuts-title"
		tabindex="-1"
		bind:this={sheet}
		onkeydown={key}
	>
		<header>
			<h2 id="sol-shortcuts-title" class="sol-label">Keys</h2>
			<button type="button" class="close" aria-label="Close" onclick={onclose}>
				<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"
					><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.2"></path></svg
				>
			</button>
		</header>
		<dl>
			<div class="group"><span class="sol-quiet">Everywhere</span></div>
			{#each everywhere as s (s.keys)}
				<div class="row"><dt>{s.keys}</dt><dd>{s.does}</dd></div>
			{/each}
			{#if shortcuts.length}
				<div class="group"><span class="sol-quiet">Here</span></div>
				{#each shortcuts as s (s.keys + s.does)}
					<div class="row"><dt>{s.keys}</dt><dd>{s.does}</dd></div>
				{/each}
			{/if}
		</dl>
	</div>
</div>

<style>
	.veil {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: var(--s-4);
		background: rgb(0 0 0 / 0.6);
	}

	/* The rest of the window: a click there closes the sheet. */
	.outside {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		cursor: default;
	}

	.sheet {
		position: relative;
		width: min(460px, 100%);
		max-height: calc(100dvh - 2 * var(--s-4));
		overflow-y: auto;
		padding: 18px 20px 20px;
		background: var(--space);
		box-shadow: inset 0 0 0 1px var(--line-mid);
		outline: none;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--s-2);
	}

	.close {
		display: grid;
		place-items: center;
		width: var(--control);
		height: var(--control);
		margin-right: -10px;
		border: 0;
		background: transparent;
		color: var(--text-quiet);
		cursor: pointer;
	}

	.close:hover {
		color: var(--text-bright);
	}

	dl {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: 0 var(--s-4);
		margin: 0;
	}

	.group {
		grid-column: 1 / -1;
		padding: var(--s-3) 0 var(--s-1);
		border-bottom: 1px solid var(--line);
	}

	.row {
		display: contents;
	}

	dt,
	dd {
		margin: 0;
		padding: var(--s-2) 0;
		border-bottom: 1px solid var(--line);
		font-size: var(--text-s);
	}

	dt {
		font-weight: var(--weight-label);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		color: var(--text-bright);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	dd {
		color: var(--text-value);
	}
</style>
