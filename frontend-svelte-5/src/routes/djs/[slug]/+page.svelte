<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import DjTable from './dj-table.svelte';
	import { type File } from '$lib/fileController';
	import FileObjectsSheet from '$lib/components/ui/file-objects-sheet/file-objects-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { updateSingle } from '$lib/djController';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let dj = $state(data.dj);
	let file_type = $state('logos');

	let fileObjectSheetInstance: FileObjectsSheet;

	const submitChanges = () => {
		console.log($state.snapshot(dj));
		updateSingle(
			dj.name,
			dj.logo,
			dj.recording,
			dj.rtmp_server,
			dj.rtmp_key,
			dj.public_name,
			dj.discord_id
		)
			.then(() => {
				toast.success('DJ Saved', {
					description: `Changes made to ${dj.name} were successfully saved.`,
					action: {
						label: 'OK',
						onClick: () => console.info('Yay')
					}
				});
				if (previousPage) {
					goto(previousPage);
				} else {
					goto('/');
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const deleteDj = () => {
		if (previousPage) {
			goto(previousPage);
		} else {
			goto('/');
		}
	};

	const selectLogo = () => {
		file_type = 'logos';
		fileObjectSheetInstance.openFileSheet();
	};

	const selectRecording = () => {
		file_type = 'recordings';
		fileObjectSheetInstance.openFileSheet();
	};

	const submitFile = (selected_file: File) => {
		if (file_type === 'logos') {
			dj.logo = selected_file.name;
		} else {
			dj.recording = selected_file.name;
		}
	};

	const unsetLogoFile = () => {
		dj.logo = '';
	};

	const unsetRecordingFile = () => {
		dj.recording = '';
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{dj.name}
</h1>

<DjTable
	bind:dj
	{submitChanges}
	{deleteDj}
	{selectLogo}
	{selectRecording}
	{unsetLogoFile}
	{unsetRecordingFile}
/>

<FileObjectsSheet bind:dj {file_type} {submitFile} bind:this={fileObjectSheetInstance} />
