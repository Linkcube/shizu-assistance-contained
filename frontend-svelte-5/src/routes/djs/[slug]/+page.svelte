<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import DjTable from './dj-table.svelte';
	import {
		addLogoFile,
		addRecordingFile,
		deleteSingleFile,
		type File,
		getAllLogos,
		getAllRecordings,
		getLogoPermissions,
		getRecordingPermissions,
		type LocalFile,
		type Permissions,
		updateSingleFile
	} from '$lib/fileController';
	import FileObjectsSheet from './file-objects-sheet.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FileImage from 'lucide-svelte/icons/file-image';
	import FileVideo from 'lucide-svelte/icons/file-video';
	import Folder from 'lucide-svelte/icons/folder';
	import { staticAssetsBase } from '$lib/utils';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import { updateSingle } from '$lib/djController';
	import LocalFileBrowser from './local-file-browser.svelte';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let dj = $state(data.dj);
	let file_type = $state('logos');
	let file_sheet_open = $state(false);
	let files_promise: Promise<File[]> = $state(Promise.resolve([]));
	let files: File[] = $state([]);
	let selected_file: File = $state({} as File);

	function localfileCompare(a: LocalFile, b: LocalFile) {
		return a.is_dir && b.is_dir ? 0 : a.is_dir ? -1 : 1;
	}

	let file_browser_open = $state(false);
	let file_browser_files = $state([] as LocalFile[]);
	let file_browser_path = $state([] as string[]);
	let file_browser_top_dir = $state('');
	let file_browser_search = $state('');
	let file_browser_displayed_files = $derived.by(() =>
		file_browser_files
			.slice()
			.sort(localfileCompare)
			.filter((file) => file.name.toLowerCase().includes(file_browser_search))
	);
	let file_browser_selected_file = $state({} as LocalFile);
	let file_browser_preview_path = $state('');

	let create_file_open = $state(false);
	let create_file_name = $state('');

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
				toast.error(`Failed to Update DJ`, {
					description: e.message,
					action: {
						label: 'OK',
						onClick: () => console.info('Whelp')
					}
				});
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
		selected_file = {} as File;
		file_type = 'logos';
		file_sheet_open = false;
		file_sheet_open = true;
		files_promise = getAllLogos();
		files_promise
			.then((logos) => {
				files = logos;
				if (dj.logo) {
					selected_file = logos.filter((logo) => logo.name === dj.logo)[0];
				}
			})
			.catch((e) => console.log(e));
	};

	const selectRecording = () => {
		selected_file = {} as File;
		file_type = 'recordings';
		file_sheet_open = false;
		file_sheet_open = true;
		files_promise = getAllRecordings();
		files_promise
			.then((recs) => {
				files = recs;
				if (dj.recording) {
					selected_file = recs.filter((rec) => rec.name === dj.recording)[0];
				}
			})
			.catch((e) => console.log(e));
	};

	const submitFile = () => {
		file_sheet_open = false;
		if (file_type === 'logos') {
			dj.logo = selected_file.name;
		} else {
			dj.recording = selected_file.name;
		}
	};

	const editFile = async () => {
		file_browser_selected_file = {} as LocalFile;
		file_browser_open = true;
		let permissions: Permissions;
		if (file_type === 'logos') {
			permissions = await getLogoPermissions([]);
		} else {
			permissions = await getRecordingPermissions([]);
		}

		file_browser_files = permissions.files;
		file_browser_path = permissions.path;
		file_browser_top_dir = permissions.top_dir;
	};

	const navigateUpFileBrowser = async (index: number) => {
		navigateFileBrowser(file_browser_path.slice(0, index));
	};

	const navigateDownFileBrowser = async (dir: string) => {
		file_browser_path.push(dir);
		navigateFileBrowser(file_browser_path);
	};

	const navigateFileBrowser = async (path: string[]) => {
		file_browser_selected_file = {} as LocalFile;
		let permissions: Permissions;
		if (file_type === 'logos') {
			permissions = await getLogoPermissions(path);
		} else {
			permissions = await getRecordingPermissions(path);
		}
		file_browser_files = permissions.files;
		file_browser_path = permissions.path;
		file_browser_top_dir = permissions.top_dir;
	};

	const deleteFile = async () => {
		await deleteSingleFile(selected_file.name);
		if (file_type === 'logos') {
			dj.logo = '';
			selectLogo();
		} else {
			dj.recording = '';
			selectRecording();
		}
	};

	const unsetFile = () => {
		file_sheet_open = false;
		if (file_type === 'logos') {
			dj.logo = '';
		} else {
			dj.recording = '';
		}
	};

	const createFileOpen = () => {
		create_file_open = true;
		create_file_name = '';
	};

	const createFile = () => {
		if (file_type === 'logos') {
			dj.logo = create_file_name;
			addLogoFile(create_file_name).then(() => selectLogo());
		} else {
			dj.recording = create_file_name;
			addRecordingFile(create_file_name).then(() => selectRecording());
		}
		create_file_open = false;
	};

	const selectFileBrowser = (file: LocalFile) => {
		if (file.is_dir) {
			navigateDownFileBrowser(file.name);
		} else {
			file_browser_selected_file = file;
			file_browser_preview_path = `${staticAssetsBase}/${file_type}/${file_browser_path.join('/')}/${file.name + file.ext}`;
		}
	};

	const isImageSource = (source_path: string) => {
		return source_path.match(/\.(jpeg|jpg|gif|png)$/) != null;
	};

	const submitLocalFile = () => {
		file_browser_open = false;
		let local_path = '';
		if (file_browser_path.length > 0) {
			local_path = file_browser_path.join('/') + '/';
		}
		local_path += `${file_browser_selected_file.name + file_browser_selected_file.ext}`;
		updateSingleFile(selected_file.name, selected_file.root, local_path, selected_file.url_path)
			.then(() => {
				toast.success('File Updated', {
					description: 'New local file set.',
					action: {
						label: 'OK',
						onClick: () => console.info('Yay')
					}
				});
				if (file_type === 'logos') {
					selectLogo();
				} else {
					selectRecording();
				}
			})
			.catch((e) => {
				toast.error(`Failed to update ${file_type}`, {
					description: e.message,
					action: {
						label: 'OK',
						onClick: () => console.info('Whelp')
					}
				});
			});
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{dj.name}
</h1>

<DjTable {dj} {submitChanges} {deleteDj} {selectLogo} {selectRecording} />

<FileObjectsSheet
	{file_sheet_open}
	{files}
	{file_type}
	{files_promise}
	bind:selected_file
	{submitFile}
	{editFile}
	{deleteFile}
	{createFileOpen}
	{unsetFile}
/>

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

<LocalFileBrowser
	{file_browser_open}
	{file_browser_path}
	{file_browser_top_dir}
	{file_browser_search}
	{file_browser_selected_file}
	{file_browser_files}
	{file_browser_preview_path}
	{navigateUpFileBrowser}
	{selectFileBrowser}
	{submitLocalFile}
/>

<!-- <Dialog.Root bind:open={file_browser_open}>
	<Dialog.Content class="max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>
				<div class="flex flex-row items-center justify-between">
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item>
								{#if file_browser_path.length > 0}
									<Breadcrumb.Link onclick={() => navigateUpFileBrowser(0)}
										>{file_browser_top_dir}</Breadcrumb.Link
									>
								{:else}
									<Breadcrumb.Link>{file_browser_top_dir}</Breadcrumb.Link>
								{/if}
							</Breadcrumb.Item>
							{#if file_browser_path.length > 2}
								<Breadcrumb.Separator />
								<Breadcrumb.Item>
									<DropdownMenu.Root>
										<DropdownMenu.Trigger class="flex items-center gap-1">
											<Breadcrumb.Ellipsis class="size-4" />
											<span class="sr-only">Toggle menu</span>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="start">
											{#each file_browser_path.slice(0, file_browser_path.length - 2) as path, i}
												<DropdownMenu.Item onclick={() => navigateUpFileBrowser(i + 1)}
													>{path}</DropdownMenu.Item
												>
											{/each}
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Breadcrumb.Item>
							{/if}
							{#if file_browser_path.length > 1}
								<Breadcrumb.Separator />
								<Breadcrumb.Item>
									<Breadcrumb.Link
										onclick={() => navigateUpFileBrowser(file_browser_path.length - 1)}
									>
										{file_browser_path[file_browser_path.length - 2]}
									</Breadcrumb.Link>
								</Breadcrumb.Item>
							{/if}
							{#if file_browser_path.length > 0}
								<Breadcrumb.Separator />
								<Breadcrumb.Item>
									<Breadcrumb.Page>
										{file_browser_path[file_browser_path.length - 1]}
									</Breadcrumb.Page>
								</Breadcrumb.Item>
							{/if}
						</Breadcrumb.List>
					</Breadcrumb.Root>
					<div class="flex flex-row justify-between gap-2 px-4">
						<Input
							class="w-40 px-4"
							type="text"
							placeholder="Search"
							bind:value={file_browser_search}
						/>
					</div>
				</div>
			</Dialog.Title>
			<Dialog.Description>
				<div class="flex flex-col items-center justify-between sm:flex-row">
					<div class="table-container h-96 basis-1/2 overflow-y-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Type</Table.Head>
									<Table.Head>Name</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each file_browser_displayed_files as file, i}
									<Table.Row
										class={file_browser_selected_file.name === file.name ? 'bg-muted/50' : ''}
										onclick={() => selectFileBrowser(file)}
										aria-selected={file_browser_selected_file.name === file.name}
									>
										<Table.Cell>
											{#if file.is_dir}
												<Folder class="mr-2 size-4 text-primary" />
											{:else if isImageSource(file.ext)}
												<FileImage class="mr-2 size-4 text-primary" />
											{:else}
												<FileVideo class="mr-2 size-4 text-primary" />
											{/if}
										</Table.Cell>
										<Table.Cell class="font-medium">{file.name}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
					<Separator orientation="vertical" class="my-4"></Separator>
					{#if file_browser_selected_file?.name && !file_browser_selected_file.is_dir}
						{#if isImageSource(file_browser_preview_path)}
							<img class="mx-auto max-h-80 max-w-80" src={file_browser_preview_path} alt="Preview" />
						{:else}
							<video class="mx-auto max-h-80 max-w-80" controls src={file_browser_preview_path}><track kind="captions" /></video>
						{/if}
					{/if}
				</div>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button onclick={submitLocalFile}>Submit</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root> -->
