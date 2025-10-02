<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import DjTable from './dj-table.svelte';
	import { toast } from 'svelte-sonner';
	import { deleteSingle, updateSingle } from '$lib/djController';
	import { pushToLog } from '$lib/utils';
	import DjLogoObjectsSheet from '$lib/components/ui/dj-logo-objects-sheet/dj-logo-objects-sheet.svelte';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url?.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let dj = $state(data.dj);
	let events = data.events;

	let djLogoObjectSheetInstance: DjLogoObjectsSheet;

	const submitChanges = () => {
		updateSingle(dj.name, dj.logo, dj.rtmp_server, dj.rtmp_key, dj.public_name, dj.discord_id)
			.then(() => {
				pushToLog({
					statusCode: 200,
					errorType: 'DJ Saved',
					message: `Changes made to ${dj.name} were successfully saved.`
				});
				if (previousPage) {
					toast.success('DJ Saved', {
						description: `Changes made to ${dj.name} were successfully saved.`,
						action: {
							label: 'OK',
							onClick: () => console.info('Yay')
						}
					});
					goto(previousPage);
				} else {
					toast.success('DJ Saved', {
						description: `Changes made to ${dj.name} were successfully saved.`,
						action: {
							label: 'Back',
							onClick: () => window.close()
						}
					});
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const deleteDj = () => {
		deleteSingle(dj.name).then((success) => {
			if (!success) return;
			pushToLog({
				statusCode: 200,
				errorType: 'DJ Deleted',
				message: `Deleted ${dj.name} successfully.`
			});
			if (previousPage) {
				toast.success('DJ Deleted', {
					description: `Deleted ${dj.name} successfully.`,
					action: {
						label: 'OK',
						onClick: () => console.info('Yay')
					}
				});
				goto(previousPage);
			} else {
				toast.success('DJ Deleted', {
					description: `Deleted ${dj.name} successfully.`,
					action: {
						label: 'Back',
						onClick: () => window.close()
					}
				});
			}
		});
	};

	const selectLogo = () => {
		djLogoObjectSheetInstance.openFileSheet();
	};

	const submitDjLogoFile = (logo: string | null) => {
		dj.logo = logo;
	};

	const unsetLogoFile = () => {
		dj.logo = null;
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{dj.name}
</h1>

<DjTable bind:dj {events} {submitChanges} {deleteDj} {selectLogo} {unsetLogoFile} />

<DjLogoObjectsSheet bind:dj {submitDjLogoFile} bind:this={djLogoObjectSheetInstance} />
