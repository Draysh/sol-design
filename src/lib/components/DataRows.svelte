<!--
	Facts as a ledger, as the apps' Settings have them: each fact a line of
	its own across the width, the label in quiet HUD capitals on the left
	(capitals when it is one to three words), the value as written in the
	sans at the right end, so the eye lands on it, hairlines between. A value
	that changes fades to the new one.

	<DataRows rows={[{ label: 'Version', value: '1.0.0' }, { label: 'Data folder', value: dir, keepCase: true }]} />
-->
<script lang="ts">
	import { capsFor } from '../look.js';
	import type { Row } from '../types.js';

	interface Props {
		rows: Row[];
		size?: 's' | 'm';
	}

	let { rows, size = 's' }: Props = $props();
</script>

<dl class="rows {size}">
	{#each rows as row, i (i)}
		<div class="row">
			<dt class:caps={capsFor(row.label)}>{row.label}</dt>
			{#key row.value}<dd class="sol-fade" class:keep={row.keepCase}>{row.value}</dd>{/key}
		</div>
	{/each}
</dl>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		margin: 0;
		font-size: var(--text-s);
	}

	.m {
		font-size: var(--text-m);
	}

	.row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-3);
		min-height: 36px;
		padding: 8px 0;
		border-bottom: 1px solid var(--line);
	}

	.row:last-child {
		border-bottom: 0;
	}

	dt,
	dd {
		margin: 0;
	}

	dt {
		flex: none;
		max-width: 50%;
		color: var(--hud-quiet);
		font-weight: var(--weight-name);
	}

	dt.caps {
		font-family: var(--font-caps);
		font-size: var(--text-xs);
		font-weight: var(--weight-label);
		letter-spacing: var(--track-hud);
		text-transform: uppercase;
		color: var(--hud-text);
	}

	dd {
		min-width: 0;
		text-align: right;
		font-weight: var(--weight-name);
		color: var(--text);
	}

	dd.keep {
		overflow-wrap: anywhere;
	}
</style>
