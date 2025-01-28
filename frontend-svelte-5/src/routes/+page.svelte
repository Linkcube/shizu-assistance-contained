<script lang="ts">
	import type { PageProps } from './$types';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const { data }: PageProps = $props();
</script>

<div class="items-center px-0 align-middle sm:px-20 lg:px-40">
	<h1 class="scroll-m-20 py-2 text-center text-5xl font-bold tracking-tight lg:text-3xl">
		Welcome!
	</h1>
	<div class="mx-auto my-2 flex max-w-screen-xl flex-row items-center justify-around">
		<a href="/djs" class="text-xl hover:underline">DJs: {data.djs}</a>
		<Separator orientation="vertical" class="mx-4 flex py-4"></Separator>
		<a href="/promotions" class="text-xl hover:underline">Promotions: {data.promos}</a>
		<Separator orientation="vertical" class="mx-4 flex py-4"></Separator>
		<a href="/events" class="text-xl hover:underline">Events: {data.events}</a>
	</div>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Welcome to Shizu's Assistance! This program is meant to help an orginzation manage a ledger of
			all DJs they have worked with as well as create event lineups to be exported to OBS.
		</span>
		<span class="my-2 flex flex-row">
			You can create/edit DJs, Promotions, and Events by clicking on their respsecitve navigation
			links at the top. When creating these, media assets such as logos and recordings can be set.
			Once you are done creating DJs and Promotions, they can be added to a lineup in the Event
			page.
		</span>
		<span class="my-2 flex flex-row">
			After your event is finished, click on export from the Events page actions dropdown or "Save
			and Export" to view a summary of the event. Clicking "Export" on this page will attempt to
			export a file to be used with the OBS script.
		</span>
		<span class="my-2 flex flex-row"> More detail can be found in the help page. </span>
	</div>
</div>
