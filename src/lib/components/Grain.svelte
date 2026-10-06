<!-- Film grain over the whole screen, 9 % overlay. Shell adds it; standalone pages add it themselves. -->
<script lang="ts">
	import grain from '../assets/grain.png';
</script>

<div class="grain" style:background-image="url({grain})" aria-hidden="true"></div>

<style>
	.grain {
		position: fixed;
		inset: 0;
		z-index: 100;
		opacity: 0.09;
		mix-blend-mode: overlay;
		pointer-events: none;
	}
</style>
