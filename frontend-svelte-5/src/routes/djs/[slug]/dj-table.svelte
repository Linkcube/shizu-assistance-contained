<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import FileImage from 'lucide-svelte/icons/file-image';
	import FileX from 'lucide-svelte/icons/file-x';
	import * as Select from '$lib/components/ui/select/index.js';
	import { RTMP_SERVERS } from '$lib/utils';
	import type { DJ, DjEvent } from '$lib/djController';
	import DeleteConfirmation from '$lib/components/ui/delete-confirmation/delete-confirmation.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import Wifi from 'lucide-svelte/icons/wifi';
	import Film from 'lucide-svelte/icons/film';
	import type { RTMP_Data } from '$lib/settingsController';

	type Props = {
		dj: DJ;
		events: DjEvent[];
		rtmp_data: RTMP_Data;
		submitChanges: () => void;
		deleteDj: () => void;
		selectLogo: () => void;
		unsetLogoFile: () => void;
	};

	let {
		dj = $bindable(),
		events,
		rtmp_data,
		submitChanges,
		deleteDj,
		selectLogo,
		unsetLogoFile
	}: Props = $props();

	console.log(events);

	const rtmpTriggerContent = $derived(
		rtmp_data.rtmp_zones.find((r) => r.id === dj.rtmp_server && r.id !== '')?.name ?? 'RTMP Server'
	);

	let delete_instance: DeleteConfirmation;

	const openDeleteConfirmation = () => {
		delete_instance.open();
	};
</script>

<div class="mx-auto flex min-w-80 max-w-screen-lg flex-col px-10 py-4 md:px-40">
	<div class="flex w-full flex-col justify-between md:flex-row">
		<div class="w-full max-w-md basis-2/5 items-center gap-1.5">
			<Label for="public-name">Public Name</Label>
			<Input type="text" id="public-name" placeholder="Public Name" bind:value={dj.public_name} />
			<p class="text-sm text-muted-foreground">Alternate Public Name.</p>
		</div>

		<div class="w-full max-w-md basis-2/5 items-center gap-1.5">
			<Label for="discord-id">Discord ID</Label>
			<Input type="text" id="discord-id" placeholder="Discord ID" bind:value={dj.discord_id} />
			<p class="text-sm text-muted-foreground">Ex. Shizu#42069.</p>
		</div>
	</div>
	<div class="flex w-full flex-col justify-between gap-1.5 py-4">
		<Label for="discord-id">DJ Logo</Label>
		<div class="flex flex-row">
			<Button class="basis-1/2" variant="outline" onclick={selectLogo}>
				<FileImage class="mr-2 h-4 w-4" />
				Select Logo
			</Button>
			<Button class="basis-1/2" variant="secondary" onclick={unsetLogoFile}>
				<FileX class="mr-2 h-4 w-4" />
				Unset
			</Button>
		</div>
		<p class="text-sm text-muted-foreground">{dj.logo ? `Current: ${dj.logo}` : 'No Logo Set'}</p>
	</div>

	<div class="flex w-full flex-row justify-between gap-1.5 py-4">
		<div class="basis-1/5 flex-col">
			<Label for="server-select">RTMP Server</Label>
			<Select.Root type="single" name="server-select" bind:value={dj.rtmp_server}>
				<Select.Trigger class="w-[120px]" disabled={rtmp_data.rtmp_zones.length === 0}>
					{rtmpTriggerContent}
				</Select.Trigger>
				{#if rtmp_data.rtmp_zones.length !== 0}
					<Select.Content>
						<Select.Item value="">Unset</Select.Item>
						{#each rtmp_data.rtmp_zones as rtmp_config}
							<Select.Item value={rtmp_config.id}>
								{rtmp_config.name}
							</Select.Item>
						{/each}
					</Select.Content>
				{/if}
			</Select.Root>
			<p class="text-sm text-muted-foreground">Closest Zone.</p>
		</div>
		<div class="basis-4/5 flex-col">
			<div class="flex w-full flex-col justify-between gap-1.5">
				<Label for="rtmp-key">RTMP Key</Label>
				<Input
					disabled={dj.rtmp_server === null || dj.rtmp_server === ''}
					type="text"
					id="rtmp-key"
					placeholder="RTMP Key"
					bind:value={dj.rtmp_key}
				/>
				<p class="text-sm text-muted-foreground">Personal Live Streaming Key.</p>
			</div>
		</div>
	</div>
	<div class="flex w-full flex-row justify-between gap-1.5 py-4">
		<Button class="w-full" onclick={submitChanges}>Save</Button>
		<Button variant="destructive" class="w-full" onclick={openDeleteConfirmation}>Delete</Button>
	</div>

	<Table.Root>
		<Table.Caption>Events this DJ is part of.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">#</Table.Head>
				<Table.Head>Event</Table.Head>
				<Table.Head>Source</Table.Head>
				<Table.Head>VJ</Table.Head>
				<Table.Head>Date</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each events as event, index}
				<Table.Row>
					<Table.Cell class="font-medium">{events.length - index}</Table.Cell>
					<Table.Cell>
						<a class="hover:underline" href="/events/{event.event}">{event.event}</a>
					</Table.Cell>
					<Table.Cell>
						{#if event.is_live}
							<Wifi class="mr-2 size-4 text-primary" />
						{:else}
							<Film class="mr-2 size-4 text-primary" />
						{/if}
					</Table.Cell>
					<Table.Cell>{event.vj}</Table.Cell>
					<Table.Cell>{event.date}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<DeleteConfirmation
	type="dj"
	item_name={dj.name}
	callbackFunc={deleteDj}
	bind:this={delete_instance}
/>
