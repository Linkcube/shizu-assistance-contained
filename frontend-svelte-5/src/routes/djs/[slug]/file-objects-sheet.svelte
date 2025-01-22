<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { type File } from '$lib/fileController';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';
	import Ban from 'lucide-svelte/icons/ban';
	import { staticAssetsBase } from '$lib/utils';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	let {
		file_sheet_open,
		files,
		file_type,
		files_promise,
		selected_file = $bindable(),
		submitFile,
		editFile,
		deleteFile,
		createFileOpen,
		unsetFile
	} = $props();

	let filtered_files: File[] = $derived.by(() =>
		files.filter((file: File) => file.name.toLowerCase().includes(file_search))
	);
	let file_search = $state('');

	const selectFile = (file: File) => {
		selected_file = file;
	};

	const isImageSource = (source_path: string) => {
		return source_path.match(/\.(jpeg|jpg|gif|png)$/) != null;
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
					<div class="flex w-full flex-row justify-between gap-1.5">
						<Button class="w-full" onclick={submitFile}>Submit</Button>
						<Button class="w-full" variant="secondary" onclick={editFile}>Edit</Button>
						<Button class="w-full" variant="destructive" onclick={deleteFile}>Delete</Button>
					</div>
					<div class="my-1.5 flex w-full flex-row justify-between gap-1.5">
						<Button class="w-full" onclick={createFileOpen}>Create New</Button>
						<Button class="w-full" variant="secondary" onclick={unsetFile}>Unset</Button>
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
