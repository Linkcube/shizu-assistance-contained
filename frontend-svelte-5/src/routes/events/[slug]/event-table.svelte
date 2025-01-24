<script lang="ts">
	import { type Event } from '$lib/eventController';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import EventDjTable from './event-dj-table.svelte';
	import EventPromoTable from './event-promo-table.svelte';
	import EventTheme from './event-theme.svelte';
	import { updateSingle as UpdateSingleTheme } from '$lib/themeController';

	type Props = {
		event: Event;
	};

	let { event = $bindable() }: Props = $props();
	let event_theme: EventTheme;

	function submit() {
		let theme = event_theme.getSelectedTheme();
		if (theme) {
			UpdateSingleTheme(theme);
		}
	}
</script>

<div class="mx-auto flex min-w-80 flex-col px-10 py-4 md:px-40">
	<div class="flex flex-col justify-around lg:flex-row">
		<EventDjTable bind:event_djs={event.djs} />
		<Separator class="my-4 lg:hidden"></Separator>
		<EventPromoTable bind:event_promos={event.promos} />
	</div>
	<EventTheme bind:event bind:this={event_theme} />
</div>
