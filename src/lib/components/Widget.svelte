<!--
	Draws a widget from a `WidgetView`, so Sol's dashboard needs no code from
	the worlds. Items marked `toggle` get a working checkbox; `ontoggle` decides
	what ticking does (Sol passes it to the world's app).
-->
<script lang="ts">
	import type { WidgetView } from '../client/api.js';
	import { notices } from '../client/notices.svelte.js';
	import Check from './Check.svelte';
	import DataRows from './DataRows.svelte';
	import Progress from './Progress.svelte';

	interface Props {
		/** The world it belongs to, for messages. */
		world: string;
		view: WidgetView;
		/** Called when a box is ticked or unticked; throw to show it failed. */
		ontoggle?: (item: string, done: boolean) => Promise<void> | void;
	}

	let { world, view, ontoggle }: Props = $props();
	let busy = $state<string | null>(null);

	async function toggle(item: NonNullable<WidgetView['items']>[number], done: boolean) {
		if (!item.toggle || !ontoggle) return;
		busy = item.id;
		try {
			await ontoggle(item.id, done);
		} catch (err) {
			notices.show({ world, title: 'Not saved', body: (err as Error).message, tone: 'error' });
		} finally {
			busy = null;
		}
	}
</script>

<div class="widget">
	{#if view.figure}
		<p class="figure">
			<span class="number">{view.figure}</span>
			{#if view.caption}<span class="sol-quiet">{view.caption}</span>{/if}
		</p>
	{/if}
	{#if view.progress}
		<Progress value={view.progress.value} max={view.progress.max} label={view.caption ?? 'Progress'} />
	{/if}
	{#if view.items?.length}
		<div class="items">
			{#each view.items as item (item.id)}
				{#if item.done !== undefined && item.done !== null}
					<Check
						label={item.label}
						meta={item.meta ?? undefined}
						checked={item.done}
						busy={busy === item.id}
						disabled={!item.toggle || !ontoggle}
						onchange={(done) => toggle(item, done)}
					/>
				{:else}
					<p class="item"><span>{item.label}</span>{#if item.meta}<span class="sol-quiet">{item.meta}</span>{/if}</p>
				{/if}
			{/each}
		</div>
	{/if}
	{#if view.rows?.length}
		<DataRows rows={view.rows} />
	{/if}
	{#if !view.figure && !view.items?.length && !view.rows?.length && view.empty}
		<p class="empty">{view.empty}</p>
	{/if}
</div>

<style>
	.widget {
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
	}

	.figure {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
	}

	.number {
		font-weight: var(--weight-display);
		font-size: 44px;
		line-height: 1;
		letter-spacing: 0.04em;
	}

	.items {
		display: flex;
		flex-direction: column;
	}

	.item {
		display: flex;
		justify-content: space-between;
		gap: var(--s-3);
		min-height: 40px;
		align-items: center;
		border-bottom: 1px solid var(--line);
	}

	.empty {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
