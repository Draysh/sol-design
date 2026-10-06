<!-- A world app's own version: installing it, and keeping it up to date through Sol. -->
<script lang="ts">
	import type { AppUpdateStatus } from '../types.js';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import DataRows from './DataRows.svelte';
	import Progress from './Progress.svelte';
	import Toggle from './Toggle.svelte';

	interface Props {
		/** The app's name, e.g. `Terra`. */
		name: string;
		status: AppUpdateStatus;
		/** Sol's page for this world, where the packages are. */
		downloads?: string;
		oncheck: () => void;
		oninstall: () => void;
		onrestart: () => void;
		onauto: (auto: boolean) => void;
		/** Installs a copy that runs from where it was unpacked. */
		oninstallapp: () => void;
	}

	let { name, status, downloads, oncheck, oninstall, onrestart, onauto, oninstallapp }: Props = $props();

	const how: Record<string, string> = {
		dev: 'a development build',
		loose: 'not installed',
		portable: 'by itself, for you',
		setup: 'with its setup',
		deb: 'as a .deb package',
		rpm: 'as an .rpm package',
		unsupported: 'by hand'
	};
	const installed = $derived(status.here.state === 'installed' ? how[status.here.kind] : how[status.here.state]);
	const updates = $derived(status.here.state === 'loose' || status.here.state === 'installed');
	const quiet = $derived(
		status.here.state === 'loose' || (status.here.state === 'installed' && status.here.kind === 'portable')
	);
	const mb = (n: number) => `${(n / 1_000_000).toFixed(1)} MB`;
	const time = (t: string) =>
		new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(t));
</script>

<Card title="Updates">
	{#if status.here.state === 'loose'}
		<p class="note">
			{name} runs from where you unpacked it. Install it to find it in your app menu and have it keep itself up to date.
		</p>
		<div><Button variant="primary" onclick={oninstallapp}>Install {name}</Button></div>
	{/if}

	<DataRows
		rows={[
			{ label: 'Version', value: status.current },
			{ label: 'Installed', value: installed }
		]}
	/>

	{#if status.state === 'checking'}
		<p class="note">Asking Sol…</p>
	{:else if status.state === 'current'}
		<p class="note">
			{status.message ?? 'Up to date.'} <span class="sol-quiet">Checked {time(status.checked_at)}.</span>
		</p>
	{:else if status.state === 'available'}
		<p class="news">Version {status.offer.version} is out.</p>
		{#if status.offer.notes}<p class="notes">{status.offer.notes}</p>{/if}
		{#if status.installs_itself}
			<div><Button variant="primary" onclick={oninstall}>Update to {status.offer.version}</Button></div>
		{:else}
			<p class="note">
				This copy came from a package, so the new one is installed the same way{#if downloads}: <a
						href={downloads}
						target="_blank"
						rel="noreferrer">get it from Sol</a
					>{/if}.
			</p>
		{/if}
	{:else if status.state === 'downloading'}
		<Progress
			value={status.done}
			max={status.total}
			label="Downloading {status.version}"
			start="Downloading {status.version}"
			end="{mb(status.done)} of {mb(status.total)}"
		/>
	{:else if status.state === 'ready'}
		<p class="news">Version {status.version} is installed. It runs from the next start.</p>
		<div><Button variant="primary" onclick={onrestart}>Restart now</Button></div>
	{:else if status.state === 'failed'}
		<p class="note error">{status.error}</p>
	{/if}

	{#if updates}
		{#if quiet}
			<Toggle
				label="Install updates by myself"
				hint="New versions are put in place quietly and run from the next start."
				checked={status.auto}
				onchange={onauto}
			/>
		{/if}
		{#if status.state !== 'downloading' && status.state !== 'ready'}
			<div><Button variant="quiet" busy={status.state === 'checking'} onclick={oncheck}>Check now</Button></div>
		{/if}
	{/if}
</Card>

<style>
	.note {
		font-size: var(--text-s);
		color: var(--text-quiet);
	}

	.news {
		color: var(--text-value);
	}

	.notes {
		white-space: pre-line;
		font-size: var(--text-s);
		color: var(--text-value);
	}

	.error {
		color: var(--danger-text);
	}

	a {
		color: inherit;
	}
</style>
