<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { deleteSingle, updateSingle } from '$lib/promotionsController';
	import PromotionTable from './promotion-table.svelte';
	import { pushToLog } from '$lib/utils';
	import PromoFileObjectsSheet from '$lib/components/ui/promo-file-objects-sheet/promo-file-objects-sheet.svelte';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url?.pathname || previousPage;
	});

	let { data }: PageProps = $props();
	let promo = $state(data.promo);

	let promoFileObjectSheetInstance: PromoFileObjectsSheet;

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
		promoFileObjectSheetInstance.openFileSheet();
	};

	const submitPromoRecordingFile = (promoFile: string | null) => {
		promo.promo_file = promoFile;
	};

	const unsetFile = () => {
		promo.promo_file = null;
	};
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
	{promo.name}
</h1>

<PromotionTable bind:promo {submitChanges} {deletePromotion} {selectFile} {unsetFile} />

<PromoFileObjectsSheet
	bind:promo
	{submitPromoRecordingFile}
	bind:this={promoFileObjectSheetInstance}
/>
