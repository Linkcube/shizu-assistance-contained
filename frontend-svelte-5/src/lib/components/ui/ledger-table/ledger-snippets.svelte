<script lang="ts" module context="module">
	import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';
	import Ban from 'lucide-svelte/icons/ban';

	export { CheckValue, CrossOrValue, NameLink, RawData };
</script>

{#snippet CheckValue(value: any)}
	{#if value === null || value === undefined}
		<Ban class="mr-2 size-4 text-muted" />
	{:else}
		<CircleCheckBig class="mr-2 size-4 text-primary" />
	{/if}
{/snippet}

{#snippet CrossOrValue(value: any)}
	{#if value === null || value === undefined || value == false}
		<Ban class="mr-2 size-4 text-muted" />
	{:else}
		{value}
	{/if}
{/snippet}

{#snippet NameLink(value: { path: string; name: string })}
	<a class="hover:underline" href="/{value.path}/{value.name}">{value.name}</a>
{/snippet}

{#snippet RawData(value: any)}
	{value}
{/snippet}
