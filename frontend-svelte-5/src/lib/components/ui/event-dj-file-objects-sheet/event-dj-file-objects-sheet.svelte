<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		addRecordingFile,
		updateSingleFile,
		getSingle,
		type File,
		type LocalFile,
		fileExists
	} from '$lib/fileController';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import LocalFileBrowser from '$lib/components/ui/local-file-browser/local-file-browser.svelte';
	import { toast } from 'svelte-sonner';
	import type { EventDj } from '$lib/eventController';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	type Props = {
		event_dj: EventDj;
		event: string;
		submitEventDjRecordingData: (
			recording: string | null,
			visuals: string | null,
			use_generic_visuals: boolean
		) => void;
	};

	let { event_dj = $bindable(), event = $bindable(), submitEventDjRecordingData }: Props = $props();

	const file_type = 'recordings';

	let file_sheet_open = $state(false);
	let selected_file: File = $state({} as File);

	let recording_file: File = $state({} as File);
	let visuals_file: File = $state({} as File);
	let use_generic_visuals = $state(false);
	let loading_promise: Promise<File>[] = $state([Promise.resolve({} as File)]);

	let localFileBrowserInstance: LocalFileBrowser;

	const staticAssetsBase = `http://${location.hostname}:4004`;

	const load_event_dj_files = async () => {
		const file_promises: Promise<File>[] = [];
		if (event_dj.recording !== null) {
			const recording_file_promise = getSingle(event_dj.recording);
			recording_file = await recording_file_promise;
			file_promises.push(recording_file_promise);
		} else {
			recording_file = {
				name: `${event}-${event_dj.name}-recording`,
				file_path: '',
				url_path: '',
				root: 'RECORDINGS'
			};
		}
		if (event_dj.visuals !== null) {
			const visuals_file_promise = getSingle(event_dj.visuals);
			visuals_file = await visuals_file_promise;
			file_promises.push(visuals_file_promise);
		} else {
			visuals_file = {
				name: `${event}-${event_dj.name}-visuals`,
				file_path: '',
				url_path: '',
				root: 'RECORDINGS'
			};
		}
		loading_promise = file_promises;
		use_generic_visuals = event_dj.use_generic_visuals;
	};

	export const openFileSheet = async () => {
		selected_file = {} as File;
		file_sheet_open = false;
		file_sheet_open = true;
		load_event_dj_files();
	};

	const submitFileObjects = async () => {
		file_sheet_open = false;
		if (
			(await fileExists(recording_file.name)) &&
			(recording_file.file_path || recording_file.url_path)
		) {
			await updateSingleFile(
				recording_file.name,
				recording_file.root,
				recording_file.file_path,
				recording_file.url_path
			);
		} else if (recording_file.file_path || recording_file.url_path) {
			await addRecordingFile(
				recording_file.name,
				recording_file.file_path,
				recording_file.url_path
			);
		} else {
			recording_file.name = '';
		}

		if (
			(await fileExists(visuals_file.name)) &&
			(visuals_file.file_path || visuals_file.url_path)
		) {
			await updateSingleFile(
				visuals_file.name,
				visuals_file.root,
				visuals_file.file_path,
				visuals_file.url_path
			);
		} else if (visuals_file.file_path || visuals_file.url_path) {
			await addRecordingFile(visuals_file.name, visuals_file.file_path, visuals_file.url_path);
		} else {
			visuals_file.name = '';
		}

		toast.success('Recording Updated', {
			description: 'Updated EventDJ recording values.',
			action: {
				label: 'OK',
				onClick: () => console.info('Yay')
			}
		});

		submitEventDjRecordingData(
			recording_file.name ? recording_file.name : null,
			visuals_file.name ? visuals_file.name : null,
			use_generic_visuals
		);
	};

	const editRecordingFile = async () => {
		selected_file = recording_file;
		localFileBrowserInstance.openDialogue();
	};

	const editVisualsFile = async () => {
		selected_file = visuals_file;
		localFileBrowserInstance.openDialogue();
	};

	const submitLocalFile = (file_path: string[], local_file: LocalFile) => {
		let local_path = '';
		if (file_path.length > 0) {
			local_path = file_path.join('/') + '/';
		}
		local_path += `${local_file.name + local_file.ext}`;
		selected_file.file_path = local_path;
	};
</script>

<Sheet.Root open={file_sheet_open}>
	<Sheet.Content side="right" class="h-full overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>
				<div class="flex flex-row items-center justify-between">
					Setup DJ Recording for {event_dj.name}
				</div>
			</Sheet.Title>
			<Sheet.Description>
				<p class="py-2 text-center text-muted-foreground">Recording</p>
				<div class="flex w-full flex-row justify-between gap-1.5">
					<p class="my-auto w-full text-center text-muted-foreground">Local File</p>
					<Button class="w-full" variant="secondary" onclick={editRecordingFile}>Edit</Button>
					<Button
						class="w-full"
						variant="destructive"
						onclick={() => (recording_file.file_path = null)}>Unset</Button
					>
				</div>
				<div class="flex flex-row items-center justify-between pt-4">
					<Input class="w-80" type="text" placeholder="URL" bind:value={recording_file.url_path} />
				</div>
				<Separator class="my-4"></Separator>
				{#if recording_file.file_path}
					<video controls src={`${staticAssetsBase}/recordings/${recording_file.file_path}`}
						><track kind="captions" /></video
					>
				{:else if recording_file.url_path}
					<video controls src={recording_file.url_path}><track kind="captions" /></video>
				{/if}
				<Separator class="my-4"></Separator>
				<p class="py-2 text-center text-muted-foreground">Visuals</p>
				<div class="flex w-full flex-row justify-between gap-1.5">
					<p class="my-auto w-full text-center text-muted-foreground">Local File</p>
					<Button class="w-full" variant="secondary" onclick={editVisualsFile}>Edit</Button>
					<Button
						class="w-full"
						variant="destructive"
						onclick={() => (visuals_file.file_path = null)}>Unset</Button
					>
				</div>
				<div class="flex flex-row items-center justify-between pt-4">
					<Input class="w-80" type="text" placeholder="URL" bind:value={visuals_file.url_path} />
				</div>
				{#if visuals_file.file_path}
					<Separator class="my-4"></Separator>
					<video controls src={`${staticAssetsBase}/recordings/${visuals_file.file_path}`}
						><track kind="captions" /></video
					>
				{:else if visuals_file.url_path}
					<Separator class="my-4"></Separator>
					<video controls src={visuals_file.url_path}><track kind="captions" /></video>
				{/if}
				<Separator class="my-4"></Separator>
				<div class="flex items-center space-x-2">
					<Checkbox id="public" bind:checked={use_generic_visuals} aria-labelledby="terms-label" />
					<Label
						id="public-label"
						for="public"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Use generic visuals
					</Label>
				</div>
				<Separator class="my-4"></Separator>
				<div class="my-1.5 flex w-full flex-row justify-between gap-1.5">
					<Button class="w-full" onclick={submitFileObjects}>Submit</Button>
				</div>
			</Sheet.Description>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>

<LocalFileBrowser {file_type} {submitLocalFile} bind:this={localFileBrowserInstance} />
