<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronsUp from 'lucide-svelte/icons/chevrons-up';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { log, type ErrorMessage } from '$lib/utils';
	import { afterNavigate } from '$app/navigation';

	let show_log = $state(false);

	let image_state: string = $state('sway');
	let message_state: string = $state('');

	let state_dictionary = new Map<string, string>([
		['cheer', '/shizu/shizu_cheer.png'],
		['dance', '/shizu/shizu_dance.gif'],
		['drink', '/shizu/shizu_drink.png'],
		['sway', '/shizu/shizu_sway.gif'],
		['wave', '/shizu/shizu_wave.png'],
		['graffiti_1', '/shizu/graffiti_1.png'],
		['graffiti_2', '/shizu/graffiti_2.png']
	]);

	const toggle_log = () => {
		show_log = !show_log;
	};
	let message_interval: number;
	let page_messages: string[] = [];

	message_interval = setInterval(() => {
		message_state = page_messages[Math.floor(Math.random() * page_messages.length)];
	}, 10000);

	afterNavigate((navigation) => {
		if (navigation.to) {
			const path = navigation.to.route.id;
			console.log(navigation);

			if (path === '/djs') {
				page_messages = [
					'You can select DJs to edit on this page!',
					'You can create and delete DJs from here!'
				];
			} else if (path === '/djs/[slug]') {
				const name: string = navigation.to.params?.slug || '';
				page_messages = [
					`If you don't have a logo, use Public Name if you don't want ${name}.`,
					'Live DJs need both RTMP Server and RTMP Values.',
					'Updating a DJ? Make sure to check the file server for any new assets!',
					`${name} huh...? Pretty cool DJ ya'know!`
				];
			} else if (path === '/promotions') {
				page_messages = [
					'You can select Promotions to edit on this page!',
					'You can create and delete Promotions from here!'
				];
			} else if (path === '/promotions/[slug]') {
				const name: string = navigation.to.params?.slug || '';
				page_messages = [
					"Promotions are only as good as their recording, make sure it's set!",
					'Updating a Promotion? Make sure to check the file server/discord channels for any new versions!',
					`People are gonna go crazy for ${name}!`
				];
			} else if (path === '/events') {
				page_messages = [
					'You can select Event to edit on this page!',
					'You can create and delete Events from here!',
					'Clicking on the export dropdown takes you to a summary page instead of directly exporting.'
				];
			} else if (path === '/events/[slug]') {
				const name: string = navigation.to.params?.slug || '';
				page_messages = [
					'DJs and Promotions can be re-arranged by clicking and dragging.',
					'Make sure to set a theme if you plan on using an overlay, it saves time!',
					'Save and Export will try to save and take you to the export summary page.',
					`Can't wait to see ${name}!`
				];
			} else if (path === '/events/[slug]/export') {
				const name: string = navigation.to.params?.slug || '';
				page_messages = [
					"Check for any errors before exporting, it'll likely fail!",
					'Logos, Recordings, and Theme assets can be previewed by hovering!'
				];
			} else if (path === '/help') {
				page_messages = [
					"It's a little dense, but it covers just about everything!",
					"Take your time reading, it'll 'help' in the long-term!"
				];
			} else if (path === '/') {
				page_messages = ["Ababababa! You're here!!", 'This should be a piece of cake!'];
			} else {
				page_messages = [
					"Ah! I don't recognize this page",
					'Are you sure you should be here?',
					'If you think this is a valid page, make sure to report this!'
				];
			}

			message_state = page_messages[Math.floor(Math.random() * page_messages.length)];
		}
	});

	log.subscribe((messages) => {
		if (messages.length === 0) return;
		const message = messages[messages.length - 1];
		console.log(message);

		if (message.statusCode === 200) {
			image_state = 'dance';
		} else {
			image_state = 'drink';
			message_state = "D'oh!";
		}

		if (message.errorType === 'Event Exported' && message.statusCode === 200) {
			page_messages = ["You're all set to continue in OBS!"];
		}

		setTimeout(() => (image_state = 'sway'), 2000);
	});
</script>

<footer
	class="fixed bottom-0 z-50 flex h-10 w-full flex-row border-b border-border/40 ring-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/60"
>
	<div
		class="pointer-events-none fixed -bottom-20 z-50 h-80 w-80 translate-y-80 transition duration-300 ease-in-out sm:-translate-y-0"
	>
		<img
			class="pointer-events-none w-full transform {image_state !== 'sway'
				? '-scale-x-100'
				: ''} transition duration-300 ease-in-out"
			src={state_dictionary.get(image_state)}
			alt="Preview"
		/>
	</div>
	<div
		class="ml-80 flex max-w-lg translate-y-20 items-center transition duration-300 ease-in-out lg:translate-y-0 xl:max-w-full"
	>
		{message_state}
	</div>
	<Card.Root
		class="-bottom-70 fixed right-0 z-50 h-80 w-80 {show_log === true
			? '-translate-y-80'
			: 'translate-y-0'} 
    {show_log === true ? 'bg-primary/60' : 'bg-primary/0'} 
    rounded-none border-0 transition delay-150 duration-300 ease-in-out"
	>
		<Button variant="ghost" class="h-10 w-full justify-start hover:bg-primary" onclick={toggle_log}>
			<ChevronsUp
				class="mr-2 h-4 w-4 {show_log === true
					? 'rotate-180'
					: 'rotate-0'} transition delay-150 duration-300 ease-in-out"
			/>
			Log
		</Button>
		<Card.Content class="h-72 p-0">
			<ScrollArea class="h-72 w-80 p-0" orientation="vertical">
				<div class="p-4">
					{#each [...$log].reverse() as log_entry}
						<div class="text-sm font-thin">
							{log_entry.statusCode}: {log_entry.errorType}
						</div>
						<div class="text-sm font-thin">
							{log_entry.message}
						</div>
						<Separator class="my-2" />
					{/each}
				</div>
			</ScrollArea>
		</Card.Content>
	</Card.Root>
</footer>
