<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Film from 'lucide-svelte/icons/film';
	import FileX from 'lucide-svelte/icons/file-x';
	import type { Promotion } from '$lib/promotionsController';

	type Props = {
		promo: Promotion;
		submitChanges: () => void;
		deletePromotion: () => void;
		selectFile: () => void;
		unsetFile: () => void;
	};
	let {
		promo = $bindable(),
		submitChanges,
		deletePromotion,
		selectFile,
		unsetFile
	}: Props = $props();
</script>

<div class="mx-auto flex min-w-80 max-w-screen-lg flex-col px-10 py-4 md:px-40">
	<div class="flex w-full flex-col justify-between gap-1.5 py-4">
		<Label for="discord-id">Promotion File</Label>
		<div class="flex flex-row">
			<Button class="basis-1/2" variant="outline" onclick={selectFile}>
				<Film class="mr-2 h-4 w-4" />
				Select Promotion File
			</Button>
			<Button class="basis-1/2" variant="secondary" onclick={unsetFile}>
				<FileX class="mr-2 h-4 w-4" />
				Unset
			</Button>
		</div>
		<p class="text-sm text-muted-foreground">
			{promo.promo_file ? `Current: ${promo.promo_file}` : 'No Recording Set'}
		</p>
	</div>
	<div class="flex w-full flex-row justify-between gap-1.5 py-4">
		<Button class="w-full" onclick={submitChanges}>Save</Button>
		<Button variant="destructive" class="w-full" onclick={deletePromotion}>Delete</Button>
	</div>
</div>
