<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import EventTable from './event-table.svelte';
	import { deleteSingle, updateSingle } from '$lib/eventController';
	import { toast } from 'svelte-sonner';
	import { pushToLog } from '$lib/utils';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let event = $state(data.event);

	const saveChanges = () => {
		updateSingle(event)
			.then((success) => {
				if (success) {
					pushToLog({
						statusCode: 200,
						errorType: 'Event Saved',
						message: `Changes made to ${event.name} were successfully saved.`
					});
					if (previousPage) {
						toast.success('Event Saved', {
							description: `Changes made to ${event.name} were successfully saved.`,
							action: {
								label: 'OK',
								onClick: () => console.info('Yay')
							}
						});
						goto(previousPage);
					} else {
						toast.success('Event Saved', {
							description: `Changes made to ${event.name} were successfully saved.`,
							action: {
								label: 'Back',
								onClick: () => window.close()
							}
						});
					}
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const deleteEvent = () => {
		deleteSingle(event.name)
			.then((success) => {
				if (success) {
					pushToLog({
						statusCode: 200,
						errorType: 'Event Deleted',
						message: `Deleted ${event.name} successfully.`
					});
					if (previousPage) {
						toast.success('Event Deleted', {
							description: `Deleted ${event.name} successfully.`,
							action: {
								label: 'OK',
								onClick: () => console.info('Yay')
							}
						});
						goto(previousPage);
					} else {
						toast.success('Event Saved', {
							description: `Deleted ${event.name} successfully.`,
							action: {
								label: 'Back',
								onClick: () => window.close()
							}
						});
					}
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const saveAndExport = () => {
		updateSingle(event)
			.then((success) => {
				if (success) {
					pushToLog({
						statusCode: 200,
						errorType: 'Event Saved',
						message: `Changes made to ${event.name} were successfully saved.`
					});
					toast.success('Event Saved', {
						description: `Changes made to ${event.name} were successfully saved.`,
						action: {
							label: 'OK',
							onClick: () => console.info('Yay')
						}
					});
					goto(`/events/${event.name}/export`);
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{event.name}
</h1>

<EventTable bind:event {saveChanges} {deleteEvent} {saveAndExport} />