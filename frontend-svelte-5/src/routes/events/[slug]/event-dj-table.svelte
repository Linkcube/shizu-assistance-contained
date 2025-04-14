<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { type EventDj } from '$lib/eventController';
	import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';
	import Ban from 'lucide-svelte/icons/ban';
	import Plus from 'lucide-svelte/icons/plus';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash2 from 'lucide-svelte/icons/trash';
	import Wifi from 'lucide-svelte/icons/wifi';
	import WifiOff from 'lucide-svelte/icons/wifi-off';
	import UserPen from 'lucide-svelte/icons/user-pen';
	import Film from 'lucide-svelte/icons/film';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { flip } from 'svelte/animate';
	import { cn } from '$lib/utils.js';
	import { type File } from '$lib/fileController';
	import FileObjectsSheet from '$lib/components/ui/file-objects-sheet/file-objects-sheet.svelte';

	type Props = {
		event_djs: EventDj[];
		openDjLineup: () => void;
	};

	let { event_djs = $bindable(), openDjLineup }: Props = $props();

	if (!event_djs) event_djs = [];

	let edit_vj_dialogue_open = $state(false);
	let edit_vj_text = $state('');
	let edit_vj_dj: EventDj = $state({} as EventDj);

	let edit_recording_dj: EventDj = $state({} as EventDj);

	let dragging_index = 0;
	let last_dragover_index = 0;
	let is_dragging = false;

	let fileObjectSheetInstance: FileObjectsSheet;

	const changeEventDjLive = async (dj: EventDj) => {
		dj.is_live = !dj.is_live;
		if (!dj.is_live) changeEventDjRecording(dj);
	};

	const changeEventDjVj = async (dj: EventDj) => {
		edit_vj_dj = dj;
		edit_vj_dialogue_open = false;
		edit_vj_text = dj.vj;
		edit_vj_dialogue_open = true;
	};

	const changeEventDjRecording = async (dj: EventDj) => {
		edit_recording_dj = dj;
		fileObjectSheetInstance.openFileSheet();
	};

	const submitFile = (selected_file: File) => {
		edit_recording_dj.recording = selected_file.name;
	};

	function handleDragStart(index: number, event: DragEvent) {
		is_dragging = true;
		dragging_index = index;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	function handleDragOver(index: number, event: DragEvent) {
		if (!is_dragging) return;
		last_dragover_index = index;
		event.preventDefault();
	}

	function handleDjDragEnd() {
		is_dragging = false;
		// In browser for svelte animation
		if (dragging_index < 0 || last_dragover_index < 0) return;
		if (dragging_index === last_dragover_index) return;
		let moving_value = event_djs[dragging_index];
		let target_value = event_djs[last_dragover_index];
		event_djs.splice(dragging_index, 1);
		if (dragging_index > last_dragover_index) {
			event_djs.splice(event_djs.indexOf(target_value), 0, moving_value);
		} else {
			event_djs.splice(event_djs.indexOf(target_value) + 1, 0, moving_value);
		}
	}

	const deleteEventDjItem = async (dj_name: string) => {
		event_djs = event_djs.filter((dj) => dj.name !== dj_name);
	};

	const saveVjDialogue = async () => {
		edit_vj_dj.vj = edit_vj_text;
		edit_vj_dialogue_open = false;
	};

	const handleKeyUp = (index: number, event: KeyboardEvent) => {
		if (event.key === 'ArrowUp') {
			if (index === 0) return;
			dragging_index = index;
			last_dragover_index = index - 1;
			handleDjDragEnd();
		}
		if (event.key === 'ArrowDown') {
			if (index === event_djs.length - 1) return;
			dragging_index = index;
			last_dragover_index = index + 1;
			handleDjDragEnd();
		}
	};
</script>

<div class="flex w-full flex-col px-5">
	<div class="mx-auto mt-4 flex w-full max-w-4xl flex-row justify-between">
		<h1 class="scroll-m-20 py-2 text-center text-xl font-bold tracking-tight">DJ Lineup</h1>
		<Button variant="outline" onclick={openDjLineup}>
			<Plus class="mr-2 h-4 w-4" />
			Add DJs
		</Button>
	</div>
	<Table.Root>
		<Table.Caption>Drag and Drop DJs to change order.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">#</Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head>Source</Table.Head>
				<Table.Head>VJ</Table.Head>
				<Table.Head></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each event_djs as event_dj, i (event_dj)}
				<!-- Broke out Table.Row for animation -->
				<tr
					class={cn(
						'cursor-move border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
					)}
					draggable="true"
					ondragstart={(event) => handleDragStart(i, event)}
					ondragover={(event) => handleDragOver(i, event)}
					ondragend={handleDjDragEnd}
					onkeyup={(event) => handleKeyUp(i, event)}
					animate:flip
				>
					<Table.Cell class="font-medium">{i + 1}.</Table.Cell>
					<Table.Cell>{event_dj.name}</Table.Cell>
					<Table.Cell>
						{#if event_dj.is_live}
							<div class="flex flex-row items-center text-center">
								<Wifi class="mr-2 size-4 text-primary" />
								<span>Live</span>
							</div>
						{:else if event_dj.recording}
							<div class="flex flex-row items-center text-center">
								<Film class="mr-2 size-4 text-primary" />
								<span>{event_dj.recording}</span>
							</div>
						{:else}
							<div class="flex flex-row items-center text-center">
								<Ban class="mr-2 size-4 text-muted" />
							</div>
						{/if}
					</Table.Cell>
					<Table.Cell>{event_dj.vj}</Table.Cell>
					<Table.Cell>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
										<span class="sr-only">Open menu</span>
										<Ellipsis />
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
									<DropdownMenu.Item onclick={() => changeEventDjLive(event_dj)}>
										{#if event_dj.is_live}
											<WifiOff class="mr-2 size-4" />
											Set Pre-Recorded
										{:else}
											<Wifi class="mr-2 size-4" />
											Set Live
										{/if}
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => changeEventDjVj(event_dj)}>
										<UserPen class="mr-2 size-4" />
										Edit VJ
									</DropdownMenu.Item>
									{#if !event_dj.is_live}
										<DropdownMenu.Item onclick={() => changeEventDjRecording(event_dj)}>
											<Film class="mr-2 size-4" />
											Set Recording
										</DropdownMenu.Item>
									{/if}
								</DropdownMenu.Group>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={() => window.open(`/djs/${event_dj.name}`, '_blank')}>
									<Pencil class="mr-2 size-4" />
									Edit DJ
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={() => deleteEventDjItem(event_dj.name)}>
									<Trash2 class="mr-2 size-4 text-destructive" />
									<span class="text-destructive">Remove</span>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</tr>
			{/each}
		</Table.Body>
	</Table.Root>

	<Dialog.Root bind:open={edit_vj_dialogue_open}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Set the VJ text for {edit_vj_dj.name}</Dialog.Title>
			</Dialog.Header>
			<div class="grid gap-2">
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="width">Edit VJ</Label>
					<Input id="width" class="col-span-2 h-8" bind:value={edit_vj_text} />
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" onclick={saveVjDialogue}>Save changes</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>

<FileObjectsSheet
	event_dj={edit_recording_dj}
	file_type={'recordings'}
	{submitFile}
	bind:this={fileObjectSheetInstance}
/>
