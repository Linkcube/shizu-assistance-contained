<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';

	interface table_defs {
		key: string;
		description: string;
	}

	const dj_info: table_defs[] = [
		{
			key: 'DJ Name',
			description: 'Name used to reference the entry, this cannot be changed in the future.'
		},
		{
			key: 'Public Name',
			description: 'Name to override `DJ Name` if updates are needed.'
		},
		{
			key: 'Discord ID',
			description: 'Currently not used, but planned use in future functionality.'
		},
		{
			key: 'Logo File',
			description: "File pointing to the local file/url for the DJ's logo."
		},
		{
			key: 'RTMP Server',
			description: 'Which RTMP server the DJ is connecting to if live.'
		},
		{
			key: 'Stream Key',
			description: "DJ's unique stream key used when connecting for a live stream."
		}
	];

	const promo_info: table_defs[] = [
		{
			key: 'Promo Name',
			description: 'Name used to reference the entry, this cannot be changed in the future.'
		},
		{
			key: 'Recording File',
			description: "File pointing to the local file/url for the Promo's recording."
		}
	];

	const lineup_dj_info: table_defs[] = [
		{
			key: 'Is Live',
			description: 'If the DJ will be live streaming.'
		},
		{
			key: 'VJ Name',
			description: "VJ the DJ's visuals should be credited with."
		},
		{
			key: 'Recording File',
			description:
				"File pointing to the local file/url for the DJ's recording. This is set per-event."
		}
	];

	const theme_info: table_defs[] = [
		{
			key: 'Overlay',
			description: '`File` used for the stream overlay.'
		},
		{
			key: 'Starting File',
			description: "`File` used as 'stream starting soon' or similar media."
		},
		{
			key: 'Ending File',
			description: "`File` used as 'stream has ended' or similar media."
		},
		{
			key: 'Video Dimensions',
			description: 'The height and width + offset for videos the overlay is designed to accomodate.'
		},
		{
			key: 'Chat Dimensions',
			description: 'Same as `Video Dimensions` for stream chat'
		}
	];
</script>

<div class="items-center px-5 align-middle sm:px-20 lg:px-40">
	<h1 class="scroll-m-20 py-2 text-center text-5xl font-bold tracking-tight lg:text-3xl">Help</h1>

	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Walkthrough
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			This section will give a walkthrough of each object, their properties, and how to build a full
			event to be exported to OBS.
		</span>
	</div>

	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Adding DJs
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			The DJs page can be accessed by the navigation bar at the top of the page. New entries can be
			added by clicking on the "New DJ" button in the top right. Existing entries can be edited by
			clicking on their name, or the ellipses dropdown in their row. Each entry has the following
			properties:
		</span>
	</div>
	<Table.Root>
		<Table.Caption>DJ Values.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Variable</Table.Head>
				<Table.Head>Description</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each dj_info as info}
				<Table.Row>
					<Table.Cell class="font-medium">{info.key}</Table.Cell>
					<Table.Cell>{info.description}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			If a `Logo File` is not set, `DJ Name` as a text element will be used for OBS unless `Public
			Name` is set.
		</span>
		<span class="my-2 flex flex-row">
			The `Logo File` points to a `File` object, which can be accessed/set by clicking on their
			buttons.
		</span>
		<span class="my-2 flex flex-row">
			`File` objects can either point to a local file set in the directories specified in the README
			(`LOCAL_LOGOS_PATH` and `LOCAL_RECORDINGS_PATH`), or to a URL which it will use the
			`FILE_SERVER_AUTHORIZATION` when accessing. When picking a local file, a preview will be
			displayed if the browser can render it (Firefox by default lacks a lot of compatibility).
		</span>
	</div>

	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Adding Promotions
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Much like DJs, promotions can be added in the Promotions page, and edited through their table.
			Promotions only have two properties:
		</span>
	</div>
	<Table.Root>
		<Table.Caption>Promotion Values.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Variable</Table.Head>
				<Table.Head>Description</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each promo_info as info}
				<Table.Row>
					<Table.Cell class="font-medium">{info.key}</Table.Cell>
					<Table.Cell>{info.description}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			This is the same `File` object as for DJs. In OBS, promos will be added as a single vlc
			playlist of all files.
		</span>
	</div>

	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Creating an Event
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Events can be created by accessing the Events page, same editing as DJs and Promotions. As
			your events increase, make sure to use the sorting and searching options to save time finding
			the event you want to edit. The following are values you can set for an Event:
		</span>
	</div>
	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Event DJs
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Each event will have a list of DJs, they can be added by clicking the **+** button next the
			`DJs`. In this window you can either select multiple entries from existing DJ entries. Make
			sure to clear your selection before clicking "Select". After adding DJs, their order can be
			changed by dragging and dropping their table row. Each Event DJ has the following properties:
		</span>
	</div>
	<Table.Root>
		<Table.Caption>Event DJ Values.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Variable</Table.Head>
				<Table.Head>Description</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each lineup_dj_info as info}
				<Table.Row>
					<Table.Cell class="font-medium">{info.key}</Table.Cell>
					<Table.Cell>{info.description}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Clicking on the ellipses for a DJ's row will give the option to toggle being live, edit the
			VJ, or set their recording. When a DJ is set to not live, the recording sidebar will be
			automatically openened. There is an edit option, which will open the DJ's page in a new tab.
			The remove button will remove the DJ from the event, but not delete the DJ.
		</span>
	</div>
	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Event Promotions
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row"> Similar to Event DJs, but with no editable values. </span>
	</div>
	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Event Date and Time
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Clicking on the calendar button will let you select the date of the event. Adjusting the
			values after "Staring Time" will set the start time, in US eastern time.
		</span>
	</div>
	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Event Theme
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Defines files and dimensions for a Theme, once a Theme is created it can be used by any Event.
			Themes have the following properties:
		</span>
	</div>
	<Table.Root>
		<Table.Caption>Theme Values.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Variable</Table.Head>
				<Table.Head>Description</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each theme_info as info}
				<Table.Row>
					<Table.Cell class="font-medium">{info.key}</Table.Cell>
					<Table.Cell>{info.description}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<h1 class="scroll-m-20 py-2 text-center text-3xl font-bold tracking-tight lg:text-2xl">
		Exporting an Event
	</h1>
	<div class="flex flex-col">
		<span class="my-2 flex flex-row">
			Either on the Events page, or in a specific Event's page, the "Export" action can be taken.
			This will show a summary of each DJ with their displayed content, and a similar table for
			promotions. A preview of the choosen theme's dimensions and assets will be shown as well. Any
			obvious errors will be pointed out here, but the user can still try to export the event. If
			the export succeded, a message telling you the file has been saved should be shown, you are
			now set to import this file into OBS and the event should be nearly good to go!
		</span>
	</div>
</div>
