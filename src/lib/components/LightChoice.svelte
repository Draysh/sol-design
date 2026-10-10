<!--
	Night or day in this browser, as the apps choose it in Settings → On
	this device: as the desktop is, with the sun, always night, always day.
	Kept in the browser (`light`); every Sol page in it follows.
-->
<script lang="ts">
	import { light, lightModes, type LightMode } from '../light.svelte.js';
	import Select from './Select.svelte';

	interface Props {
		label?: string;
		hint?: string;
	}

	let { label = 'Light', hint }: Props = $props();
</script>

<Select
	{label}
	{hint}
	options={lightModes}
	value={light.mode}
	onchange={(e) => (light.mode = e.currentTarget.value as LightMode)}
/>
