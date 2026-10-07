<!-- Facts as `Label: value`. Semibold says what it is; light says what it is now. A value that changes fades to the new one. -->
<script lang="ts">
	import type { Row } from '../types.js';

	interface Props {
		rows: Row[];
		align?: 'left' | 'center' | 'right';
		size?: 's' | 'm';
	}

	let { rows, align = 'left', size = 's' }: Props = $props();
</script>

<dl class="rows {size}" style:text-align={align}>
	{#each rows as row, i (i)}
		<div>
			<dt>{row.label}:</dt>
			{#key row.value}<dd class="sol-fade" class:keep={row.keepCase}>{row.value}</dd>{/key}
		</div>
	{/each}
</dl>

<style>
	.rows {
		margin: 0;
		font-size: 11.5px;
		line-height: 2;
		letter-spacing: var(--track-rows);
		text-transform: uppercase;
	}

	.m {
		font-size: var(--text-s);
	}

	dt,
	dd {
		display: inline;
		margin: 0;
	}

	dt {
		font-weight: var(--weight-label);
		color: var(--text-bright);
	}

	dd {
		font-weight: var(--weight-value);
		color: var(--text-value);
	}

	dd.keep {
		text-transform: none;
		letter-spacing: 0.02em;
		overflow-wrap: anywhere;
	}
</style>
