<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const panel = {};
	const { registerPanel, selectedPanel } = getContext(TABS);

	registerPanel(panel);
</script>
<style>

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 10px;
  }
</style>

{#if $selectedPanel === panel}
<div class="container">
	<slot></slot>
</div>
{/if}