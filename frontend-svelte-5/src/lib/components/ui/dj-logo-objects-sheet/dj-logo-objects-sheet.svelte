<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		updateSingleFile,
		getSingle,
		type File,
		type LocalFile,
		fileExists,
		addLogoFile
	} from '$lib/fileController';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import LocalFileBrowser from '$lib/components/ui/local-file-browser/local-file-browser.svelte';
	import { toast } from 'svelte-sonner';
	import type { DJ } from '$lib/djController';

	type Props = {
		dj: DJ;
		submitDjLogoFile: (logo: string | null) => void;
	};

	let { dj = $bindable(), submitDjLogoFile }: Props = $props();

	const file_type = 'logos';

	let file_sheet_open = $state(false);
	let selected_file: File = $state({} as File);

	let logo_file: File = $state({} as File);
	let loading_promise: Promise<File>[] = $state([Promise.resolve({} as File)]);

	let localFileBrowserInstance: LocalFileBrowser;

	const staticAssetsBase = `http://${location.hostname}:4004`;

	const load_dj_logo_file = async () => {
		const file_promises: Promise<File>[] = [];
		if (dj.logo !== null) {
			const logo_file_promise = getSingle(dj.logo);
			logo_file = await logo_file_promise;
			file_promises.push(logo_file_promise);
		} else {
			logo_file = {
				name: `${dj.name}-logo`,
				file_path: '',
				url_path: '',
				root: 'LOGOS'
			};
		}
		loading_promise = file_promises;
	};

	export const openFileSheet = async () => {
		selected_file = {} as File;
		file_sheet_open = false;
		file_sheet_open = true;
		load_dj_logo_file();
	};

	const submitFileObjects = async () => {
		file_sheet_open = false;
		if ((await fileExists(logo_file.name)) && (logo_file.file_path || logo_file.url_path)) {
			await updateSingleFile(
				logo_file.name,
				logo_file.root,
				logo_file.file_path,
				logo_file.url_path
			);
		} else if (logo_file.file_path || logo_file.url_path) {
			await addLogoFile(logo_file.name, logo_file.file_path, logo_file.url_path);
		} else {
			logo_file.name = '';
		}

		toast.success('Logo Updated', {
			description: 'Updated DJ logo.',
			action: {
				label: 'OK',
				onClick: () => console.info('Yay')
			}
		});

		submitDjLogoFile(logo_file.name ? logo_file.name : null);
	};

	const editLogoFile = async () => {
		selected_file = logo_file;
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
					Setup DJ Logo for {dj.name}
				</div>
			</Sheet.Title>
			<Sheet.Description>
				<p class="py-2 text-center text-muted-foreground">Logo</p>
				<div class="flex w-full flex-row justify-between gap-1.5">
					<p class="my-auto w-full text-center text-muted-foreground">Local File</p>
					<Button class="w-full" variant="secondary" onclick={editLogoFile}>Edit</Button>
					<Button class="w-full" variant="destructive" onclick={() => (logo_file.file_path = null)}
						>Unset</Button
					>
				</div>
				<div class="flex flex-row items-center justify-between pt-4">
					<Input class="w-80" type="text" placeholder="URL" bind:value={logo_file.url_path} />
				</div>
				<Separator class="my-4"></Separator>
				{#if logo_file.file_path}
					<img
						class="w-full"
						src={`${staticAssetsBase}/logos/${logo_file.file_path}`}
						alt="Preview"
					/>
				{:else if logo_file.url_path}
					<img class="w-full" src={logo_file.url_path} alt="Preview" />
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
