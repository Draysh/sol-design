<!--
	Draws a dashboard widget from the `WidgetView` an app returns, so Sol never
	needs app-specific widget code. Ticking a checklist item calls the route the
	app named, then asks for fresh data.
-->
<script lang="ts">
	import { errorMessage, type WidgetView } from '../client/api.js';
	import { notices } from '../client/notices.svelte.js';
	import Check from './Check.svelte';
	import DataRows from './DataRows.svelte';
	import Progress from './Progress.svelte';

	interface Props {
		app: string;
		view: WidgetView;
		/** Called after an item changed, to load the widget again. */
		onchange?: () => void;
	}

	let { app, view, onchange }: Props = $props();
	let busy = $state<string | null>(null);

	async function toggle(item: NonNullable<WidgetView['items']>[number], done: boolean) {
		if (!item.toggle) return;
		busy = item.id;
		try {
			const res = await fetch(`/api/${app}${item.toggle.path}`, {
				method: item.toggle.method,
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ [item.toggle.field]: done })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(errorMessage(body, `Couldn’t update “${item.label}”`));
			}
			onchange?.();
		} catch (err) {
			notices.show({ world: app, title: 'Not saved', body: (err as Error).message, tone: 'error' });
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
						disabled={!item.toggle}
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
