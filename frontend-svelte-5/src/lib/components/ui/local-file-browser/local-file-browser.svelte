<script lang="ts">
	import {
		getLogoPermissions,
		getRecordingPermissions,
		getThemePermissions,
		type LocalFile,
		type Permissions
	} from '$lib/fileController';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import FileImage from 'lucide-svelte/icons/file-image';
	import FileVideo from 'lucide-svelte/icons/file-video';
	import Folder from 'lucide-svelte/icons/folder';
	import { Input } from '$lib/components/ui/input/index.js';

	const isImageSource = (source_path: string) => {
		return source_path.match(/\.(jpeg|jpg|gif|png)$/) != null;
	};

	type Props = {
		file_type: 'logos' | 'recordings' | 'theme-overlay' | 'theme-op' | 'theme-ed';
		submitLocalFile: (file_path: string[], local_file: LocalFile) => void;
	};

	let { file_type, submitLocalFile }: Props = $props();

	let file_browser_open: boolean = $state(false);
	let file_browser_path: string[] = $state([]);
	let file_browser_top_dir: string = $state('');
	let file_browser_search: string = $state('');
	let file_browser_selected_file: LocalFile = $state({} as LocalFile);
	let file_browser_files: LocalFile[] = $state([]);
	let file_browser_preview_path: string = $state('');

	const staticAssetsBase = `http://${location.hostname}:4004`;

	function localfileCompare(a: LocalFile, b: LocalFile) {
		return a.is_dir && b.is_dir ? 0 : a.is_dir ? -1 : 1;
	}

	let file_browser_displayed_files = $derived.by(() =>
		file_browser_files
			.slice()
			.sort(localfileCompare)
			.filter((file: LocalFile) => file.name.toLowerCase().includes(file_browser_search))
	);

	export async function openDialogue() {
		file_browser_selected_file = {} as LocalFile;
		file_browser_open = true;

		let initial_path = [];

		// Remember last used path
		let last_used_path = null;
		if (file_type == 'logos') {
			last_used_path = localStorage.getItem('last_logo_path');
		} else if (file_type == 'recordings') {
			last_used_path = localStorage.getItem('last_recording_path');
		} else {
			last_used_path = localStorage.getItem('last_theme_path');
		}

		if (last_used_path != null) {
			initial_path = JSON.parse(last_used_path);
		}

		let permissions: Permissions;

		if (file_type === 'logos') {
			permissions = await getLogoPermissions(initial_path);
		} else if (file_type == 'recordings') {
			permissions = await getRecordingPermissions(initial_path);
		} else {
			permissions = await getThemePermissions(initial_path);
		}

		file_browser_files = permissions.files;
		file_browser_path = permissions.path;
		file_browser_top_dir = permissions.top_dir;
	}

	const navigateUpFileBrowser = async (index: number) => {
		navigateFileBrowser(file_browser_path.slice(0, index));
	};

	const navigateDownFileBrowser = async (dir: string) => {
		let tmp_path = file_browser_path.slice();
		tmp_path.push(dir);
		navigateFileBrowser(tmp_path);
	};

	const navigateFileBrowser = async (path: string[]) => {
		file_browser_selected_file = {} as LocalFile;
		let permissions: Permissions;
		if (file_type === 'logos') {
			permissions = await getLogoPermissions(path);
		} else if (file_type === 'recordings') {
			permissions = await getRecordingPermissions(path);
		} else {
			permissions = await getThemePermissions(path);
		}
		file_browser_files = permissions.files;
		file_browser_path = permissions.path;
		file_browser_top_dir = permissions.top_dir;
	};

	const selectFileBrowser = (file: LocalFile) => {
		if (file.is_dir) {
			navigateDownFileBrowser(file.name);
		} else {
			file_browser_selected_file = file;
			file_browser_preview_path = `
			${staticAssetsBase}/
			${file_type === 'logos' || file_type === 'recordings' ? file_type : 'themes'}/
			${file_browser_path.join('/')}/${file.name + file.ext}`;
		}
	};

	const submit = () => {
		file_browser_open = false;
		submitLocalFile(file_browser_path, file_browser_selected_file);
	};
</script>

<Dialog.Root bind:open={file_browser_open}>
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
				<div class="flex flex-col items-center justify-between md:flex-row">
					<div class="table-container h-96 overflow-y-auto md:h-[40vh]">
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
					<div class="mx-auto">
						{#if file_browser_selected_file?.name && !file_browser_selected_file.is_dir}
							{#if isImageSource(file_browser_preview_path)}
								<img
									class="h-80 w-80 object-scale-down"
									src={file_browser_preview_path}
									alt="Preview"
								/>
							{:else}
								<video class="h-80 w-80 object-scale-down" controls src={file_browser_preview_path}
									><track kind="captions" /></video
								>
							{/if}
						{/if}
					</div>
				</div>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			{#if file_browser_selected_file?.name}
				<Button onclick={submit}>Select</Button>
			{:else}
				<Button disabled>Select</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
