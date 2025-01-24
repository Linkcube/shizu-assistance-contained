<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	let {
		checked = false,
		onCheckedChange = (v) => (checked = v),
		...restProps
	}: ComponentProps<typeof Checkbox> = $props();
</script>

{#if restProps.disabled}
	<Checkbox checked={true} disabled />
{:else}
	<Checkbox bind:checked={() => checked, onCheckedChange} {...restProps} />
{/if}
