<script lang="ts">
	import { page } from '$app/state';
	import { ModeWatcher } from 'mode-watcher';
	import Github from 'lucide-svelte/icons/github';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../app.css';
	let { children } = $props();
	import { error_stack } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import Footer from './footer.svelte';

	let path = $derived(page.url.pathname);

	error_stack.subscribe((new_error) => {
		toast.error(`${new_error.statusCode}: ${new_error.errorType}.`, {
			description: new_error.message,
			action: {
				label: 'OK',
				onClick: () => console.info('OK')
			}
		});
	});
</script>

<ModeWatcher />
<Toaster />

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 ring-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/60"
>
	<div class="container flex h-14 max-w-screen-2xl items-center p-0 sm:p-2">
		<a class="mr-6 flex items-center space-x-2" href="/"> Tasukete Shizu! </a>
		<nav class="flex items-center gap-6 text-sm">
			<!-- Needs an implicit #if block for just the first one, tailwind is weird. -->
			{#if path.startsWith('/djs')}
				<a href="/djs" class="text-foreground transition-colors hover:text-foreground/80"> DJs </a>
			{:else}
				<a href="/djs" class="text-foreground/50 transition-colors hover:text-foreground/80">
					DJs
				</a>
			{/if}
			<a
				href="/promotions"
				class="transition-colors hover:text-foreground/80 text-foreground{path.startsWith(
					'/promotions'
				)
					? ''
					: '/50'}"
			>
				Promotions
			</a>
			<a
				href="/events"
				class="transition-colors hover:text-foreground/80 text-foreground{path.startsWith('/events')
					? ''
					: '/50'}"
			>
				Events
			</a>
			<a
				href="/help"
				class="transition-colors hover:text-foreground/80 text-foreground{path.startsWith('/help')
					? ''
					: '/50'}"
			>
				Help
			</a>
		</nav>
		<nav class="flex flex-1 items-center justify-end space-x-2">
			<a aria-label="source code" href="https://github.com/Linkcube/shizu-assistance-contained">
				<Github class="mr-2 size-4" />
			</a>
		</nav>
	</div>
</header>

{@render children()}

<div class="h-80"></div>

<Footer />
