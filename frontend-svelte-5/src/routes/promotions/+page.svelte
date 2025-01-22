<script lang="ts">
	import type { PageProps } from './$types';
	import { deleteSingle, getAll, type Promotion } from '$lib/promotionsController';
	import LedgerTable from '$lib/components/ui/ledger-table/ledger-table.svelte';
	import { createCols } from '$lib/components/ui/ledger-table/ledger-promo-columns';
	import { toast } from 'svelte-sonner';

	let { data }: PageProps = $props();

	let base_promos: Promotion[] = $state([]);

	const updatePromos = async () => {
		const promos = await getAll();
		if (promos != undefined) base_promos = promos;
	};

	export const deletePromoAction = async (promo_name: string) => {
		deleteSingle(promo_name).then((success) => {
			if (success) {
				toast.success('Success', {
					description: `Deleted ${promo_name}.`,
					action: {
						label: 'OK',
						onClick: () => console.info('OK')
					}
				});
			}
			updatePromos();
		});
	};

	if (data.promos !== undefined) base_promos = data.promos;
</script>

<LedgerTable data={base_promos} columns={createCols('promotions', deletePromoAction)} />
