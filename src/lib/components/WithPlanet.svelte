<!--
	A moon's place beside its planet: it starts by itself, without a window,
	whenever its planet opens, and leaves a little after the planet closes,
	so nobody has to remember to open it. Per computer, on until turned off.

	<WithPlanet world="titan" on={running} work="Picks keep up with what you rate and finish." onchange={set} />
-->
<script lang="ts">
	import { world as worldFor } from '../worlds.js';
	import Card from './Card.svelte';
	import Toggle from './Toggle.svelte';

	interface Props {
		/** The moon this app is. */
		world: string;
		/** Whether it runs with its planet on this computer; `null` when this copy can't (not installed). */
		on: boolean | null;
		/** What the moon keeps doing out of sight, in one sentence. */
		work?: string;
		onchange: (on: boolean) => void;
	}

	let { world: id, on, work, onchange }: Props = $props();
	const moon = $derived(worldFor(id));
	const planet = $derived(worldFor(moon.parent ?? 'sol'));
</script>

<Card title="With {planet.name}" world={planet.id}>
	{#if on === null}
		<p class="note">
			Once {moon.name} is installed, it starts by itself whenever {planet.name} opens: no window, nothing to remember. This copy is a
			development build or isn't installed.
		</p>
	{:else}
		<Toggle
			label="Run whenever {planet.name} runs"
			checked={on}
			hint={on
				? `${moon.name} starts without a window when ${planet.name} opens and stops a little after it closes.${work ? ` ${work}` : ''}`
				: `${moon.name} only works while you have it open.`}
			{onchange}
		/>
	{/if}
</Card>

<style>
	.note {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}
</style>
