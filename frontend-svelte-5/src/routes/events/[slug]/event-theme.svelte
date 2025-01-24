<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import Check from 'lucide-svelte/icons/check';
	import Pencil from 'lucide-svelte/icons/pencil';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Film from 'lucide-svelte/icons/film';
	import FileImage from 'lucide-svelte/icons/file-image';
	import * as Command from '$lib/components/ui/command/index.js';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import Plus from 'lucide-svelte/icons/plus';
	import { cn } from '$lib/utils.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { getAll, type Theme } from '$lib/themeController';
	import { tick } from 'svelte';
	import type { Event } from '$lib/eventController';

	type Props = {
		event: Event;
	};

	let { event = $bindable() }: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);
	let themes: Theme[] = $state([]);

	const selected_theme = $derived(themes.find((f) => f.name === event.theme));

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	async function updateThemesList() {
		themes = await getAll();
	}

	export function getSelectedTheme() {
		return $state.snapshot(selected_theme);
	}

	updateThemesList();
</script>

{#snippet ThemeSelect()}
	<Popover.Root bind:open>
		<Popover.Trigger bind:ref={triggerRef}>
			{#snippet child({ props })}
				<Button
					variant="outline"
					class="w-[200px] justify-between"
					{...props}
					role="combobox"
					aria-expanded={open}
				>
					{selected_theme?.name || 'Select a theme...'}
					<ChevronsUpDown class="opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[200px] p-0">
			<Command.Root>
				<Command.Input placeholder="Search theme..." />
				<Command.List>
					<Command.Empty>No framework found.</Command.Empty>
					<Command.Group>
						{#each themes as theme}
							<Command.Item
								value={theme.name}
								onSelect={() => {
									event.theme = theme.name;
									closeAndFocusTrigger();
								}}
							>
								<Check class={cn(event.theme !== theme.name && 'text-transparent')} />
								{theme.name}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
{/snippet}

{#snippet StartingFile()}
	{#if selected_theme}
		<div class="flex">
			<Button class="basis-1/2" variant="outline" onclick={() => console.log('hi')}>
				{#if selected_theme.starting_file}
					<Film class="mr-2 h-4 w-4 text-primary" />
				{:else}
					<Film class="mr-2 h-4 w-4 text-muted" />
				{/if}
				Select Opening
			</Button>
		</div>
	{/if}
{/snippet}

{#snippet EndingFile()}
	{#if selected_theme}
		<div class="flex">
			<Button class="basis-1/2" variant="outline" onclick={() => console.log('hi')}>
				{#if selected_theme.ending_file}
					<Film class="mr-2 h-4 w-4 text-primary" />
				{:else}
					<Film class="mr-2 h-4 w-4 text-muted" />
				{/if}
				Select Ending
			</Button>
		</div>
	{/if}
{/snippet}

{#snippet OverlayFile()}
	{#if selected_theme}
		<div class="flex">
			<Button class="basis-1/2" variant="outline" onclick={() => console.log('hi')}>
				{#if selected_theme.overlay_file}
					<FileImage class="mr-2 h-4 w-4 text-primary" />
				{:else}
					<FileImage class="mr-2 h-4 w-4 text-muted" />
				{/if}
				Select Overlay
			</Button>
		</div>
	{/if}
{/snippet}

{#snippet VideoConfig()}
	{#if selected_theme}
		<Popover.Root>
			<Popover.Trigger class={buttonVariants({ variant: 'outline' })}>
				{#if selected_theme.target_video_width !== null && selected_theme.target_video_height !== null && selected_theme.video_offset_x !== null && selected_theme.video_offset_y !== null}
					<Pencil class="mr-2 size-4 text-primary" />
				{:else if selected_theme.target_video_width !== null || selected_theme.target_video_height !== null || selected_theme.video_offset_x !== null || selected_theme.video_offset_y !== null}
					<Pencil class="mr-2 size-4" />
				{:else}
					<Pencil class="mr-2 size-4 text-muted" />
				{/if}
				Video Config
			</Popover.Trigger>
			<Popover.Content class="w-80">
				<div class="grid gap-4">
					<div class="space-y-2">
						<h4 class="font-medium leading-none">Dimensions</h4>
						<p class="text-sm text-muted-foreground">
							Set the pixel dimensions for the video placement.
						</p>
					</div>
					<div class="grid gap-2">
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="width">Width</Label>
							<Input
								id="width"
								bind:value={selected_theme.target_video_width}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="height">Height</Label>
							<Input
								id="height"
								bind:value={selected_theme.target_video_height}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="hOffset">Horizontal Offset</Label>
							<Input
								id="hOffset"
								bind:value={selected_theme.video_offset_x}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="voOffset">Vertical Offset</Label>
							<Input
								id="voOffset"
								bind:value={selected_theme.video_offset_y}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	{/if}
{/snippet}

{#snippet ChatConfig()}
	{#if selected_theme}
		<Popover.Root>
			<Popover.Trigger class={buttonVariants({ variant: 'outline' })}>
				{#if selected_theme.chat_width !== null && selected_theme.chat_height !== null && selected_theme.chat_offset_x !== null && selected_theme.chat_offset_y !== null}
					<Pencil class="mr-2 size-4 text-primary" />
				{:else if selected_theme.chat_width !== null || selected_theme.chat_height !== null || selected_theme.chat_offset_x !== null || selected_theme.chat_offset_y !== null}
					<Pencil class="mr-2 size-4" />
				{:else}
					<Pencil class="mr-2 size-4 text-muted" />
				{/if}
				Chat Config
			</Popover.Trigger>
			<Popover.Content class="w-80">
				<div class="grid gap-4">
					<div class="space-y-2">
						<h4 class="font-medium leading-none">Dimensions</h4>
						<p class="text-sm text-muted-foreground">
							Set the pixel dimensions for the chat placement.
						</p>
					</div>
					<div class="grid gap-2">
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="width">Width</Label>
							<Input
								id="width"
								bind:value={selected_theme.chat_width}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="height">Height</Label>
							<Input
								id="height"
								bind:value={selected_theme.chat_height}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="hOffset">Horizontal Offset</Label>
							<Input
								id="hOffset"
								bind:value={selected_theme.chat_offset_x}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="voOffset">Vertical Offset</Label>
							<Input
								id="voOffset"
								bind:value={selected_theme.chat_offset_y}
								type="number"
								class="col-span-2 h-8"
							/>
						</div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	{/if}
{/snippet}

<div class="mx-auto mt-4 flex w-full max-w-4xl flex-row justify-between">
	<h1 class="scroll-m-20 py-2 text-center text-xl font-bold tracking-tight">Event Theme</h1>
	<Button variant="outline" onclick={() => console.log('hi')}>
		<Plus class="mr-2 h-4 w-4" />
		New Theme
	</Button>
</div>
<Separator class="my-4 flex lg:hidden" orientation="horizontal" />
{#if selected_theme}
	<div class="flex flex-col justify-around lg:flex-row">
		<div class="flex w-full justify-between lg:justify-around">
			{@render ThemeSelect()}
			{@render VideoConfig()}
		</div>
		<div class="flex w-full justify-between lg:justify-around">
			{@render ChatConfig()}
			{@render StartingFile()}
		</div>
		<div class="flex w-full justify-between lg:justify-around">
			{@render EndingFile()}
			{@render OverlayFile()}
		</div>
	</div>
{:else}
	<div class="flex flex-col justify-start lg:flex-row">
		{@render ThemeSelect()}
	</div>
{/if}
