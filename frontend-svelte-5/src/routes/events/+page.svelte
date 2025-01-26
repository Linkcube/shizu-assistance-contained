<script lang="ts">
	import { addSingle, deleteSingle, getAll, type Event } from '$lib/eventController';
	import type { PageProps } from './$types';
	import LedgerTable from '$lib/components/ui/ledger-table/ledger-table.svelte';
	import { createCols } from '$lib/components/ui/ledger-table/ledger-events-columns';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Plus from 'lucide-svelte/icons/plus';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { goto } from '$app/navigation';
	import DeleteConfirmation from '$lib/components/ui/delete-confirmation/delete-confirmation.svelte';

	let { data }: PageProps = $props();

	let base_events: Event[] = $state([]);
	let create_event_name = $state('');
	let create_event_open = $state(false);

	let delete_instance: DeleteConfirmation;
	let delete_event_name = $state('');

	const updateEvents = async () => {
		const events = await getAll();
		if (events !== undefined) {
			base_events = events;
		}
	};

	export const deleteEventAction = () => {
		deleteSingle(delete_event_name).then((success) => {
			if (success) {
				toast.success('Success', {
					description: `Deleted ${delete_event_name}.`,
					action: {
						label: 'OK',
						onClick: () => console.info('OK')
					}
				});
			}
			updateEvents();
		});
	};

	const createEventOpen = () => {
		create_event_name = '';
		create_event_open = true;
	};

	const createEvent = async () => {
		let response = await addSingle(create_event_name);
		if (response) {
			toast.success('Success', {
				description: `Created ${create_event_name}.`,
				action: {
					label: 'Edit',
					onClick: () => goto(`/events/${create_event_name}`)
				}
			});
		}
		create_event_open = false;
		updateEvents();
	};

	const openDeleteConfirmation = (event_name: string) => {
		delete_event_name = event_name;
		delete_instance.open();
	};

	if (data.events !== undefined) {
		base_events = data.events;
	}
</script>

<div class="flex flex-row items-center justify-around">
	<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">Events</h1>
	<Button onclick={createEventOpen}>
		<Plus class="mr-2 h-4 w-4" />
		New Event
	</Button>
</div>

<LedgerTable data={base_events} columns={createCols('events', openDeleteConfirmation)} />

<Dialog.Root bind:open={create_event_open}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new Promotion</Dialog.Title>
			<Dialog.Description>
				<div class="flex flex-row items-center justify-between pt-4">
					Name:
					<Input class="w-80" type="text" placeholder="Name" bind:value={create_event_name} />
				</div>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button type="submit" onclick={createEvent}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<DeleteConfirmation
	type="event"
	item_name={delete_event_name}
	callbackFunc={deleteEventAction}
	bind:this={delete_instance}
/>
