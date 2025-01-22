<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		addLogoFile,
		addRecordingFile,
		deleteSingleFile,
		getAllLogos,
		getAllRecordings,
		updateSingleFile,
		type File,
		type LocalFile
	} from '$lib/fileController';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';
	import Ban from 'lucide-svelte/icons/ban';
	import { staticAssetsBase } from '$lib/utils';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { DJ } from '$lib/djController';
	import LocalFileBrowser from '$lib/components/ui/local-file-browser/local-file-browser.svelte';
	import { toast } from 'svelte-sonner';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { Promotion } from '$lib/promotionsController';

	type Props = {
		dj?: DJ;
		promo?: Promotion;
		file_type: string;
		submitFile: (selected_file: File) => void;
	};

	let { dj = $bindable(), promo = $bindable(), file_type, submitFile }: Props = $props();

	let file_sheet_open = $state(false);
	let files: File[] = $state([]);
	let files_promise: Promise<File[]> = $state(Promise.resolve([]));
	let selected_file: File = $state({} as File);

	let filtered_files: File[] = $derived.by(() =>
		files.filter((file: File) => file.name.toLowerCase().includes(file_search))
	);
	let file_search = $state('');

	let create_file_open = $state(false);
	let create_file_name = $state('');

	let localFileBrowserInstance: LocalFileBrowser;

	const selectFile = (file: File) => {
		selected_file = file;
	};

	const isImageSource = (source_path: string) => {
		return source_path.match(/\.(jpeg|jpg|gif|png)$/) != null;
	};

	function sortFiles(a: File, b: File) {
		return a.name.localeCompare(b.name);
	}

	export const openFileSheet = async () => {
		selected_file = {} as File;
		file_sheet_open = false;
		file_sheet_open = true;
		if (dj !== undefined) {
			if (file_type === 'logos') {
				files_promise = getAllLogos();
				files_promise
					.then((logos) => {
						files = logos.slice().sort(sortFiles);
						if (dj.logo) {
							selected_file = logos.filter((logo) => logo.name === dj.logo)[0];
						}
					})
					.catch((e) => console.log(e));
			} else {
				files_promise = getAllRecordings();
				files_promise
					.then((recs) => {
						files = recs.slice().sort(sortFiles);
						if (dj.recording) {
							selected_file = recs.filter((rec) => rec.name === dj.recording)[0];
						}
					})
					.catch((e) => console.log(e));
			}
		} else if (promo !== undefined) {
			files_promise = getAllRecordings();
			files_promise
				.then((recs) => {
					files = recs.slice().sort(sortFiles);
					if (promo.promo_file) {
						selected_file = recs.filter((rec) => rec.name === promo.promo_file)[0];
					}
				})
				.catch((e) => console.log(e));
		}
	};

	export const reloadData = async () => {
		if (file_type === 'logos') {
			files_promise = getAllLogos();
			files_promise
				.then((logos) => {
					files = logos.slice().sort(sortFiles);
					if (selected_file) {
						selected_file = logos.filter((logo) => logo.name === selected_file.name)[0];
					}
				})
				.catch((e) => console.log(e));
		} else {
			files_promise = getAllRecordings();
			files_promise
				.then((recs) => {
					files = recs.slice().sort(sortFiles);
					if (selected_file) {
						selected_file = recs.filter((rec) => rec.name === selected_file.name)[0];
					}
				})
				.catch((e) => console.log(e));
		}
	};

	const deleteFile = async () => {
		await deleteSingleFile(selected_file.name);
		if (dj !== undefined) {
			if (file_type === 'logos' && dj.logo === selected_file.name) {
				dj.logo = '';
			} else if (dj.recording === selected_file.name) {
				dj.recording = '';
			}
		} else if (promo !== undefined) {
			if (promo.promo_file === selected_file.name) promo.promo_file = '';
		}
		reloadData();
	};

	const submitFileObject = () => {
		file_sheet_open = false;
		submitFile(selected_file);
	};

	const editFile = async () => {
		localFileBrowserInstance.openDialogue();
	};

	const submitLocalFile = (file_path: string[], local_file: LocalFile) => {
		let local_path = '';
		if (file_path.length > 0) {
			local_path = file_path.join('/') + '/';
		}
		local_path += `${local_file.name + local_file.ext}`;
		updateSingleFile(selected_file.name, selected_file.root, local_path, selected_file.url_path)
			.then(() => {
				toast.success('File Updated', {
					description: 'New local file set.',
					action: {
						label: 'OK',
						onClick: () => console.info('Yay')
					}
				});
				reloadData();
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const createFileOpen = () => {
		create_file_open = true;
		create_file_name = '';
	};

	const createFile = async () => {
		if (dj !== undefined) {
			if (file_type === 'logos') {
				dj.logo = create_file_name;
				await addLogoFile(create_file_name);
			} else {
				dj.recording = create_file_name;
				await addRecordingFile(create_file_name);
			}
		} else if (promo !== undefined) {
			promo.promo_file = create_file_name;
			await addRecordingFile(create_file_name);
		}
		reloadData();
		create_file_open = false;
	};
</script>

<Sheet.Root open={file_sheet_open}>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>
				<div class="flex flex-row items-center justify-between">
					Select {file_type}
					<Input class="w-40" type="text" placeholder="Search" bind:value={file_search} />
				</div>
			</Sheet.Title>
			<Sheet.Description>
				{#await files_promise}
					<LoaderCircle class="animate-spin" />
				{:then}
					<div class="h-96 overflow-y-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Name</Table.Head>
									<Table.Head>Local</Table.Head>
									<Table.Head>URL</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each filtered_files as file, i}
									<Table.Row
										class={selected_file.name === file.name ? 'bg-muted/50' : ''}
										onclick={() => selectFile(file)}
										aria-selected={selected_file.name === file.name}
									>
										<Table.Cell class="font-medium">{file.name}</Table.Cell>
										<Table.Cell>
											{#if file.file_path}
												<CircleCheckBig class="mr-2 size-4 text-primary" />
											{:else}
												<Ban class="mr-2 size-4 text-muted" />
											{/if}
										</Table.Cell>
										<Table.Cell>
											{#if file.url_path}
												<CircleCheckBig class="mr-2 size-4 text-primary" />
											{:else}
												<Ban class="mr-2 size-4 text-muted" />
											{/if}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
					<Separator class="my-4"></Separator>
					<p class="text-center text-muted-foreground">Click on a row to select your file</p>
					<Separator class="my-4"></Separator>
					<div class="flex w-full flex-row justify-between gap-1.5">
						{#if selected_file?.name}
							<Button class="w-full" onclick={submitFileObject}>Select</Button>
							<Button class="w-full" variant="secondary" onclick={editFile}>Edit</Button>
							<Button class="w-full" variant="destructive" onclick={deleteFile}>Delete</Button>
						{:else}
							<Button class="w-full" disabled>Select</Button>
							<Button class="w-full" variant="secondary" disabled>Edit</Button>
							<Button class="w-full" variant="destructive" disabled>Delete</Button>
						{/if}
					</div>
					<div class="my-1.5 flex w-full flex-row justify-between gap-1.5">
						<Button class="w-full" onclick={createFileOpen}>Create New</Button>
					</div>
					<Separator class="my-4"></Separator>
					{#if selected_file?.name}
						<div class="flex w-full flex-row justify-center gap-1.5">
							{selected_file.name}
						</div>
						<Separator class="my-4"></Separator>
					{/if}
					{#if selected_file?.file_path}
						{#if isImageSource(selected_file.file_path)}
							<img
								class="w-full"
								src={`${staticAssetsBase}/${file_type}/${selected_file.file_path}`}
								alt="Preview"
							/>
						{:else}
							<video controls src={`${staticAssetsBase}/${file_type}/${selected_file.file_path}`}
								><track kind="captions" /></video
							>
						{/if}
					{/if}
				{/await}
			</Sheet.Description>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>

<LocalFileBrowser {file_type} {submitLocalFile} bind:this={localFileBrowserInstance} />

<Dialog.Root bind:open={create_file_open}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{#if file_type === 'logos'}
					Create a New Logo
				{:else}
					Create a New Recording
				{/if}
			</Dialog.Title>
			<Dialog.Description>
				<div class="flex flex-row items-center justify-between pt-4">
					Name:
					<Input class="w-80" type="text" placeholder="Name" bind:value={create_file_name} />
				</div>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button type="submit" onclick={createFile}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
