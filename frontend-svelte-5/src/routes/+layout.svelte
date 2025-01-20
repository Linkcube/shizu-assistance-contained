<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import Github from 'lucide-svelte/icons/github';
	import '../app.css';
	let { children } = $props();
</script>

<ModeWatcher />

<header class="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
	<div class="container flex h-14 max-w-screen-2xl items-center">
		<a class="mr-6 flex items-center space-x-2" href="/">
			Tasukete Shizu!
		</a>
		<nav class="flex items-center gap-6 text-sm">
			<a href="/djs" class="hover:text-foreground/80 transition-colors text-foreground/60">
				DJs
			</a>
			<a href="/promos" class="hover:text-foreground/80 transition-colors text-foreground/60">
				Promotions
			</a>
			<a href="/events" class="hover:text-foreground/80 transition-colors text-foreground/60">
				Events
			</a>
			<a href="/help" class="hover:text-foreground/80 transition-colors text-foreground/60">
				Help
			</a>
		</nav>
		<nav class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
			<a aria-label="source code" href="https://github.com/Linkcube/shizu-assistance-contained">
				<Github class="mr-2 size-4" />
			</a>
		</nav>
	</div>
</header>

{@render children()}

<footer></footer>