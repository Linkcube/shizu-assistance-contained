<script lang="ts">
	import { deleteSingle, getAll, type Event } from '$lib/eventController';
	import type { PageProps } from './$types';
	import LedgerTable from '$lib/components/ui/ledger-table/ledger-table.svelte';
	import { createCols } from '$lib/components/ui/ledger-table/ledger-events-columns';
	import { toast } from 'svelte-sonner';

	let { data }: PageProps = $props();

	let base_events: Event[] = $state([]);

	const updateEvents = async () => {
		const events = await getAll();
		if (events !== undefined) {
			base_events = events;
		}
	};

	export const deleteEventAction = async (event_name: string) => {
		deleteSingle(event_name).then((success) => {
			if (success) {
				toast.success('Success', {
					description: `Deleted ${event_name}.`,
					action: {
						label: 'OK',
						onClick: () => console.info('OK')
					}
				});
			}
			updateEvents();
		});
	};

	if (data.events !== undefined) {
		base_events = data.events;
	}
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">Events</h1>
<LedgerTable data={base_events} columns={createCols('events', deleteEventAction)} />
