<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import DjTable from './dj-table.svelte';
	import { type File } from '$lib/fileController';
	import FileObjectsSheet from '$lib/components/ui/file-objects-sheet/file-objects-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { deleteSingle, updateSingle } from '$lib/djController';
	import { pushToLog } from '$lib/utils';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let dj = $state(data.dj);
	let file_type: 'logos' | 'recordings' = $state('logos');

	let fileObjectSheetInstance: FileObjectsSheet;

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
		file_type = 'logos';
		fileObjectSheetInstance.openFileSheet();
	};

	const submitFile = (selected_file: File) => {
		dj.logo = selected_file.name;
	};

	const unsetLogoFile = () => {
		dj.logo = null;
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{dj.name}
</h1>

<DjTable bind:dj {submitChanges} {deleteDj} {selectLogo} {unsetLogoFile} />

<FileObjectsSheet bind:dj {file_type} {submitFile} bind:this={fileObjectSheetInstance} />
