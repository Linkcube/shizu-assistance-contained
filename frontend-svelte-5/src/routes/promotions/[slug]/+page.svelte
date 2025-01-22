<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { type File } from '$lib/fileController';
	import FileObjectsSheet from '$lib/components/ui/file-objects-sheet/file-objects-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { deleteSingle, updateSingle } from '$lib/promotionsController';
	import PromotionTable from './promotion-table.svelte';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let promo = $state(data.promo);
	let file_type = $state('recordings');

	let fileObjectSheetInstance: FileObjectsSheet;

	const submitChanges = () => {
		updateSingle(promo.name, promo.promo_file)
			.then(() => {
				toast.success('Promotion Saved', {
					description: `Changes made to ${promo.name} were successfully saved.`,
					action: {
						label: 'OK',
						onClick: () => console.info('Yay')
					}
				});
				if (previousPage) {
					goto(previousPage);
				} else {
					goto('/');
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const deletePromotion = () => {
		deleteSingle(promo.name);
		if (previousPage) {
			goto(previousPage);
		} else {
			goto('/');
		}
	};

	const selectFile = () => {
		fileObjectSheetInstance.openFileSheet();
	};

	const submitFile = (selectedFile: File) => {
		promo.promo_file = selectedFile.name;
	};

	const unsetFile = () => {
		promo.promo_file = '';
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{promo.name}
</h1>

<PromotionTable bind:promo {submitChanges} {deletePromotion} {selectFile} {unsetFile} />

<FileObjectsSheet bind:promo {file_type} {submitFile} bind:this={fileObjectSheetInstance} />
