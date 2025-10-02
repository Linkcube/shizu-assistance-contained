<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		updateSingleFile,
		getSingle,
		type File,
		type LocalFile,
		fileExists,
		addLogoFile,
		addRecordingFile
	} from '$lib/fileController';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import LocalFileBrowser from '$lib/components/ui/local-file-browser/local-file-browser.svelte';
	import { toast } from 'svelte-sonner';
	import type { DJ } from '$lib/djController';
	import type { Promotion } from '$lib/promotionsController';

	type Props = {
		promo: Promotion;
		submitPromoRecordingFile: (promo: string | null) => void;
	};

	let { promo = $bindable(), submitPromoRecordingFile }: Props = $props();

	const file_type = 'recordings';

	let file_sheet_open = $state(false);
	let selected_file: File = $state({} as File);

	let promo_file: File = $state({} as File);
	let loading_promise: Promise<File>[] = $state([Promise.resolve({} as File)]);

	let localFileBrowserInstance: LocalFileBrowser;

	const staticAssetsBase = `http://${location.hostname}:4004`;

	const load_promo_recording_file = async () => {
		const file_promises: Promise<File>[] = [];
		if (promo.promo_file !== null) {
			const recording_file_promise = getSingle(promo.promo_file);
			promo_file = await recording_file_promise;
			file_promises.push(recording_file_promise);
		} else {
			promo_file = {
				name: `${promo.name}-recording`,
				file_path: '',
				url_path: '',
				root: 'RECORDINGS'
			};
		}
		loading_promise = file_promises;
	};

	export const openFileSheet = async () => {
		selected_file = {} as File;
		file_sheet_open = false;
		file_sheet_open = true;
		load_promo_recording_file();
	};

	const submitFileObjects = async () => {
		file_sheet_open = false;
		if ((await fileExists(promo_file.name)) && (promo_file.file_path || promo_file.url_path)) {
			await updateSingleFile(
				promo_file.name,
				promo_file.root,
				promo_file.file_path,
				promo_file.url_path
			);
		} else if (promo_file.file_path || promo_file.url_path) {
			await addRecordingFile(promo_file.name, promo_file.file_path, promo_file.url_path);
		} else {
			promo_file.name = '';
		}

		toast.success('Promotion Updated', {
			description: 'Updated Promotion recording values.',
			action: {
				label: 'OK',
				onClick: () => console.info('Yay')
			}
		});

		submitPromoRecordingFile(promo_file.name ? promo_file.name : null);
	};

	const editPromoFile = async () => {
		selected_file = promo_file;
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
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>
				<div class="flex flex-row items-center justify-between">
					Setup Promotion recording for {promo.name}
				</div>
			</Sheet.Title>
			<Sheet.Description>
				<p class="py-2 text-center text-muted-foreground">Promotion</p>
				<div class="flex w-full flex-row justify-between gap-1.5">
					<p class="my-auto w-full text-center text-muted-foreground">Local File</p>
					<Button class="w-full" variant="secondary" onclick={editPromoFile}>Edit</Button>
					<Button class="w-full" variant="destructive" onclick={() => (promo_file.file_path = null)}
						>Unset</Button
					>
				</div>
				<div class="flex flex-row items-center justify-between pt-4">
					<Input class="w-80" type="text" placeholder="URL" bind:value={promo_file.url_path} />
				</div>
				<Separator class="my-4"></Separator>
				{#if promo_file.file_path}
					<video controls src={`${staticAssetsBase}/recordings/${promo_file.file_path}`}
						><track kind="captions" /></video
					>
				{:else if promo_file.url_path}
					<video controls src={promo_file.url_path}><track kind="captions" /></video>
				{/if}
				<Separator class="my-4"></Separator>
				<div class="my-1.5 flex w-full flex-row justify-between gap-1.5">
					<Button class="w-full" onclick={submitFileObjects}>Submit</Button>
				</div>
			</Sheet.Description>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>

<LocalFileBrowser {file_type} {submitLocalFile} bind:this={localFileBrowserInstance} />
