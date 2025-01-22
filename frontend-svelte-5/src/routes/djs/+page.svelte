<script lang="ts">
	import type { PageProps } from './$types';
	import { deleteSingle, type DJ, getAll as getAllDjs } from '$lib/djController';
	import LedgerTable from '$lib/components/ui/ledger-table/ledger-table.svelte';
	import { createCols } from '$lib/components/ui/ledger-table/ledger-dj-columns';
	import { toast } from 'svelte-sonner';

	let { data }: PageProps = $props();

	let base_djs: DJ[] = $state([]);

	const updateDjs = async () => {
		const djs = await getAllDjs();
		if (djs !== undefined) {
			base_djs = djs;
		}
	};

	export const deleteDjAction = async (dj_name: string) => {
		deleteSingle(dj_name).then((success) => {
			if (success) {
				toast.success('Success', {
					description: `Deleted ${dj_name}.`,
					action: {
						label: 'OK',
						onClick: () => console.info('OK')
					}
				});
			}
			updateDjs();
		});
	};

	if (data.djs !== undefined) {
		base_djs = data.djs;
	}
</script>

<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">DJs</h1>
<LedgerTable data={base_djs} columns={createCols('djs', deleteDjAction)} />
