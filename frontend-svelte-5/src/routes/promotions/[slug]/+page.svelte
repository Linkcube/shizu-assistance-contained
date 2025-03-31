<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { type File } from '$lib/fileController';
	import FileObjectsSheet from '$lib/components/ui/file-objects-sheet/file-objects-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { deleteSingle, updateSingle } from '$lib/promotionsController';
	import PromotionTable from './promotion-table.svelte';
	import { pushToLog } from '$lib/utils';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let promo = $state(data.promo);
	const file_type = 'recordings';

	let fileObjectSheetInstance: FileObjectsSheet;

	const submitChanges = () => {
		updateSingle(promo.name, promo.promo_file)
			.then(() => {
				pushToLog({
					statusCode: 200,
					errorType: 'Promotion Saved',
					message: `Changes made to ${promo.name} were successfully saved.`
				});
				if (previousPage) {
					toast.success('Promotion Saved', {
						description: `Changes made to ${promo.name} were successfully saved.`,
						action: {
							label: 'OK',
							onClick: () => console.info('Yay')
						}
					});
					goto(previousPage);
				} else {
					toast.success('Promotion Saved', {
						description: `Changes made to ${promo.name} were successfully saved.`,
						action: {
							label: 'Back',
							onClick: () => window.close()
						}
					});
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const deletePromotion = () => {
		deleteSingle(promo.name).then((success) => {
			if (!success) return;
			pushToLog({
				statusCode: 200,
				errorType: 'Promotion Deleted',
				message: `Deleted ${promo.name} successfully.`
			});
			if (previousPage) {
				toast.success('Promotion Deleted', {
					description: `Deleted ${promo.name} successfully.`,
					action: {
						label: 'OK',
						onClick: () => console.info('Yay')
					}
				});
				goto(previousPage);
			} else {
				toast.success('Promotion Deleted', {
					description: `Deleted ${promo.name} successfully.`,
					action: {
						label: 'Back',
						onClick: () => window.close()
					}
				});
			}
		});
	};

	const selectFile = () => {
		fileObjectSheetInstance.openFileSheet();
	};

	const submitFile = (selectedFile: File) => {
		promo.promo_file = selectedFile.name;
	};

	const unsetFile = () => {
		promo.promo_file = null;
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{promo.name}
</h1>

<PromotionTable bind:promo {submitChanges} {deletePromotion} {selectFile} {unsetFile} />

<FileObjectsSheet bind:promo {file_type} {submitFile} bind:this={fileObjectSheetInstance} />
