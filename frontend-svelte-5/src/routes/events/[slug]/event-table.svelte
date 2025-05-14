<script lang="ts">
	import { type Event } from '$lib/eventController';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import EventDjTable from './event-dj-table.svelte';
	import EventPromoTable from './event-promo-table.svelte';
	import EventTheme from './event-theme.svelte';
	import { updateSingle as updateSingleTheme, type Theme } from '$lib/themeController';
	import LineupSelectionSheet from './lineup-selection-sheet.svelte';
	import { getMin as getMinDjs } from '$lib/djController';
	import { getMin as getMinPromos } from '$lib/promotionsController';
	import FileObjectsSheet from '$lib/components/ui/file-objects-sheet/file-objects-sheet.svelte';
	import type { File } from '$lib/fileController';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import DeleteConfirmation from '$lib/components/ui/delete-confirmation/delete-confirmation.svelte';

	type Props = {
		event: Event;
		saveChanges: () => void;
		deleteEvent: () => void;
		saveAndExport: () => void;
	};

	let { event = $bindable(), saveChanges, deleteEvent, saveAndExport }: Props = $props();
	let event_theme: EventTheme;

	let lineup_type: 'djs' | 'promos' = $state('djs');
	let lineup_existing: string[] = $state([]);
	let lineup_all: string[] = $state([]);
	let lineup_instance: LineupSelectionSheet;

	let fileObjectSheetInstance: FileObjectsSheet;
	let selected_theme: Theme = $state({} as Theme);
	let file_type: 'theme-overlay' | 'theme-op' | 'theme-ed' = $state('theme-overlay');

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let date_value = $state<DateValue | undefined>();
	let contentRef = $state<HTMLElement | null>(null);
	let start_hour = $state('00');
	let start_minute = $state('00');

	let days_to_event = -1;

	if (event.start_time) {
		start_hour = event.start_time.split(':')[0];
		start_minute = event.start_time.split(':')[1];
	}

	const HOURS = Array.from(Array(24).keys()).map((val) => {
		let hour = val.toString();
		if (hour.length === 1) return `0${hour}`;
		return hour;
	});
	const MINUTES = Array.from(Array(60).keys()).map((val) => {
		let minute = val.toString();
		if (minute.length === 1) return `0${minute}`;
		return minute;
	});

	if (event.date) {
		date_value = parseDate(event.date);
	}

	function submit() {
		event.start_time = `${start_hour}:${start_minute}`;
		let theme = event_theme?.getSelectedTheme();
		if (date_value) {
			event.date = date_value.toString();
			updateChecklistDate();
		}
		if (theme) {
			updateSingleTheme(theme);
		}

		saveChanges();
	}

	function submitAndExport() {
		event.start_time = `${start_hour}:${start_minute}`;
		let theme = event_theme?.getSelectedTheme();
		if (date_value) {
			event.date = date_value.toString();
		}
		if (theme) {
			updateSingleTheme(theme);
		}

		saveAndExport();
	}

	const openDjLineup = async () => {
		lineup_type = 'djs';
		lineup_existing = event.djs.map((dj) => dj.name);
		const all_djs = await getMinDjs();
		if (all_djs) {
			lineup_all = all_djs.map((dj) => dj.name);
		}

		lineup_instance.openLineupSheet();
	};

	const openPromoLineup = async () => {
		lineup_type = 'promos';
		lineup_existing = event.promos;
		const all_promos = await getMinPromos();
		if (all_promos) {
			lineup_all = all_promos.map((promo) => promo.name);
		}

		lineup_instance.openLineupSheet();
	};

	const submitLineupSelection = (new_items: string[]) => {
		if (lineup_type === 'djs') {
			new_items.forEach((name) =>
				event.djs.push({
					name: name,
					is_live: false,
					vj: '',
					recording: null,
					visuals: null,
					use_generic_visuals: false
				})
			);
		} else {
			new_items.forEach((name) => event.promos.push(name));
		}
	};

	const submitFile = (selected_file: File) => {
		if (file_type === 'theme-overlay') {
			event_theme.updateThemeOverlay(selected_file.name);
		} else if (file_type === 'theme-op') {
			event_theme.updateThemeOp(selected_file.name);
		} else {
			event_theme.updateThemeEd(selected_file.name);
		}
	};

	const selectOverlay = (theme: Theme) => {
		file_type = 'theme-overlay';
		selected_theme = theme;
		fileObjectSheetInstance.openFileSheet();
	};

	const selectStarting = (theme: Theme) => {
		file_type = 'theme-op';
		selected_theme = theme;
		fileObjectSheetInstance.openFileSheet();
	};

	const selectEnding = (theme: Theme) => {
		file_type = 'theme-ed';
		selected_theme = theme;
		fileObjectSheetInstance.openFileSheet();
	};

	let delete_instance: DeleteConfirmation;

	const openDeleteConfirmation = () => {
		delete_instance.open();
	};

	const updateChecklistDate = () => {
		let current_date = new Date();
		let event_date = new Date(`${event.date} EST`);
		current_date.setHours(event_date.getHours());
		current_date.setMinutes(event_date.getMinutes());
		current_date.setSeconds(event_date.getSeconds());
		current_date.setMilliseconds(event_date.getMilliseconds());
		let diffTime = event_date.valueOf() - current_date.valueOf();
		days_to_event = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	};

	if (event.date) updateChecklistDate();
</script>

<div class="mx-auto flex min-w-80 flex-col px-10 py-4 md:px-40">
	<div class="flex flex-col justify-around lg:flex-row">
		<EventDjTable bind:event_djs={event.djs} bind:event {openDjLineup} />
		<Separator class="my-4 lg:hidden"></Separator>
		<EventPromoTable bind:event_promos={event.promos} {openPromoLineup} />
	</div>
	<EventTheme bind:event bind:this={event_theme} {selectOverlay} {selectStarting} {selectEnding} />
	<!-- Event public and datetime settings -->
	<LineupSelectionSheet
		bind:this={lineup_instance}
		event_name={event.name}
		items_type={lineup_type}
		existing_items={lineup_existing}
		all_items={lineup_all}
		makeSelection={submitLineupSelection}
	/>
	<Separator class="my-4"></Separator>
	<div class="flex flex-col items-center lg:flex-row lg:justify-around">
		<div class="flex items-center space-x-2">
			<Checkbox id="public" bind:checked={event.public} aria-labelledby="terms-label" />
			<Label
				id="public-label"
				for="public"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Event is Public
			</Label>
		</div>
		<Popover.Root>
			<Popover.Trigger
				class={cn(
					buttonVariants({
						variant: 'outline',
						class: 'w-[280px] justify-start text-left font-normal'
					}),
					!date_value && 'text-muted-foreground'
				)}
			>
				<CalendarIcon />
				{date_value ? df.format(date_value.toDate(getLocalTimeZone())) : 'Pick a date'}
			</Popover.Trigger>
			<Popover.Content bind:ref={contentRef} class="w-auto p-0">
				<Calendar type="single" bind:value={date_value} />
			</Popover.Content>
		</Popover.Root>
		<div class="flex flex-row">
			<Label
				class="mx-2 content-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Start Time:
			</Label>
			<Select.Root type="single" bind:value={start_hour}>
				<Select.Trigger class="w-fit">{start_hour}</Select.Trigger>
				<Select.Content>
					{#each HOURS as hour}
						<Select.Item value={hour}>{hour}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={start_minute}>
				<Select.Trigger class="w-fit">{start_minute}</Select.Trigger>
				<Select.Content>
					{#each MINUTES as minute}
						<Select.Item value={minute}>{minute}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>
	<div class="my-1.5 flex w-full flex-row justify-between gap-1.5">
		<Button class="w-full" onclick={submit}>Save Changes</Button>
		<Button class="w-full" variant="destructive" onclick={openDeleteConfirmation}>Delete</Button>
	</div>
	<div class="my-1.5 flex w-full flex-row justify-between gap-1.5">
		<Button class="w-full" onclick={submitAndExport}>Save and Export</Button>
	</div>
</div>

<FileObjectsSheet
	bind:theme={selected_theme}
	{file_type}
	{submitFile}
	bind:this={fileObjectSheetInstance}
/>

<DeleteConfirmation
	type="event"
	item_name={event.name}
	callbackFunc={deleteEvent}
	bind:this={delete_instance}
/>

<div class="mx-auto flex min-w-80 flex-col px-10 py-4 md:px-40">
	<div class="mx-auto mt-4 flex w-full max-w-4xl flex-row items-center justify-between">
		{#if days_to_event >= 0}
			<h1 class="scroll-m-20 py-2 text-center text-xl font-bold tracking-tight">
				{#if days_to_event > 1}
					Event Checklist: {days_to_event} Days Remaining
				{:else if days_to_event == 1}
					Event Checklist: 1 Day Remaining
				{:else}
					Event Checklist: Day of the Event
				{/if}
			</h1>
		{:else}
			<h1 class="scroll-m-20 py-2 text-center text-xl font-bold tracking-tight">Event Checklist</h1>
		{/if}
	</div>

	<div
		class="mx-auto mt-4 flex w-full max-w-4xl flex-col items-start {days_to_event >= 21
			? 'text-primary'
			: 'text-muted'}"
	>
		<h1 class="text-l scroll-m-20 py-2 text-center font-bold tracking-tight">3 Weeks Before</h1>
		<ul class="list-disc">
			<li>Flyer complete and released</li>
		</ul>
	</div>

	<div
		class="mx-auto mt-4 flex w-full max-w-4xl flex-col items-start {days_to_event > 20
			? ''
			: days_to_event >= 14
				? 'text-primary'
				: 'text-muted'}"
	>
		<h1 class="text-l scroll-m-20 py-2 text-center font-bold tracking-tight">2 Weeks Before</h1>
		<ul class="list-disc">
			<li>Lineup Complete</li>
			<li>If outsourcing VJing, set due to VJ 2 weeks before unless other arrangements made</li>
			<li>Update name and images of performers on website</li>
		</ul>
	</div>

	<div
		class="mx-auto mt-4 flex w-full max-w-4xl flex-col items-start {days_to_event > 13
			? ''
			: days_to_event >= 7
				? 'text-primary'
				: 'text-muted'}"
	>
		<h1 class="text-l scroll-m-20 py-2 text-center font-bold tracking-tight">1 Week Before</h1>
		<ul class="list-disc">
			<li>Scheduled soundchecks with live performers</li>
		</ul>
	</div>

	<div
		class="mx-auto mt-4 flex w-full max-w-4xl flex-col items-start {days_to_event > 6
			? ''
			: days_to_event >= 3
				? 'text-primary'
				: 'text-muted'}"
	>
		<h1 class="text-l scroll-m-20 py-2 text-center font-bold tracking-tight">3 Days Before</h1>
		<ul class="list-disc">
			<li>All sets due</li>
		</ul>
	</div>

	<div
		class="mx-auto mt-4 flex w-full max-w-4xl flex-col items-start {days_to_event > 2
			? ''
			: days_to_event >= 1
				? 'text-primary'
				: 'text-muted'}"
	>
		<h1 class="text-l scroll-m-20 py-2 text-center font-bold tracking-tight">Day Before</h1>
		<ul class="list-disc">
			<li>All OBS scenes generated and populated</li>
			<li>Change name of stream</li>
			<li>All soundchecks complete unless other arrangements made</li>
			<li>Check audio levels on pre-recorded sets to ensure not redlining</li>
			<li>Check OBS scene alignments</li>
			<li>Set Seasonal Transition Stinger</li>
		</ul>
	</div>

	<div
		class="mx-auto mt-4 flex w-full max-w-4xl flex-col items-start {days_to_event > 0
			? ''
			: days_to_event >= 0
				? 'text-primary'
				: 'text-muted'}"
	>
		<h1 class="text-l scroll-m-20 py-2 text-center font-bold tracking-tight">Day of the Event</h1>
		<ul class="list-disc">
			<li>Tweet/Insta Post an hour before the show</li>
			<li>Commence streaming T-10 minutes prior</li>
		</ul>
	</div>
</div>
