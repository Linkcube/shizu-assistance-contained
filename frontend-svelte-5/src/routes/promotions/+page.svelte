<script lang="ts">
	import type { PageProps } from './$types';
	import { addSingle, deleteSingle, getAll, type Promotion } from '$lib/promotionsController';
	import LedgerTable from '$lib/components/ui/ledger-table/ledger-table.svelte';
	import { createCols } from '$lib/components/ui/ledger-table/ledger-promo-columns';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Plus from 'lucide-svelte/icons/plus';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { goto } from '$app/navigation';
	import DeleteConfirmation from '$lib/components/ui/delete-confirmation/delete-confirmation.svelte';

	let { data }: PageProps = $props();

	let base_promos: Promotion[] = $state([]);
	let create_promo_name = $state('');
	let create_promo_open = $state(false);

	let delete_instance: DeleteConfirmation;
	let delete_promo_name = $state('');

	const updatePromos = async () => {
		const promos = await getAll();
		if (promos != undefined) base_promos = promos;
	};

	export const deletePromoAction = () => {
		deleteSingle(delete_promo_name).then((success) => {
			if (success) {
				toast.success('Success', {
					description: `Deleted ${delete_promo_name}.`,
					action: {
						label: 'OK',
						onClick: () => console.info('OK')
					}
				});
			}
			updatePromos();
		});
	};

	const createPromoOpen = () => {
		create_promo_name = '';
		create_promo_open = true;
	};

	const createPromo = async () => {
		let response = await addSingle(create_promo_name);
		if (response) {
			toast.success('Success', {
				description: `Created ${create_promo_name}.`,
				action: {
					label: 'Edit',
					onClick: () => goto(`/promotions/${create_promo_name}`)
				}
			});
		}
		create_promo_open = false;
		updatePromos();
	};

	const openDeleteConfirmation = (promo_name: string) => {
		delete_promo_name = promo_name;
		delete_instance.open();
	};

	if (data.promos !== undefined) base_promos = data.promos;
</script>

<div class="flex flex-row items-center justify-around">
	<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">
		Promotions
	</h1>
	<Button onclick={createPromoOpen}>
		<Plus class="mr-2 h-4 w-4" />
		New Promotion
	</Button>
</div>

<LedgerTable data={base_promos} columns={createCols('promotions', openDeleteConfirmation)} />

<Dialog.Root bind:open={create_promo_open}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new Promotion</Dialog.Title>
			<Dialog.Description>
				<div class="flex flex-row items-center justify-between pt-4">
					Name:
					<Input class="w-80" type="text" placeholder="Name" bind:value={create_promo_name} />
				</div>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button type="submit" onclick={createPromo}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<DeleteConfirmation
	type="promotion"
	item_name={delete_promo_name}
	callbackFunc={deletePromoAction}
	bind:this={delete_instance}
/>
