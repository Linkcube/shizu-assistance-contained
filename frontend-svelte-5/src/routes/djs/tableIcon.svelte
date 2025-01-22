<script lang="ts" module>
	import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';
	import Ban from 'lucide-svelte/icons/ban';

	export { CheckValue, CrossOrValue };
</script>

{#snippet CheckValue(value: {})}
	{#if value === null || value === undefined}
		<Ban class="mr-2 size-4 text-muted" />
	{:else}
		<CircleCheckBig class="mr-2 size-4 text-primary" />
	{/if}
{/snippet}

{#snippet CrossOrValue(value: {})}
	{#if value === null || value === undefined || value == false}
		<Ban class="mr-2 size-4 text-muted" />
	{:else}
		{value}
	{/if}
{/snippet}
