<script lang="ts">
	import type { PageProps } from './$types';
	import { addSingle, deleteSingle, type DJ, getAll as getAllDjs } from '$lib/djController';
	import LedgerTable from '$lib/components/ui/ledger-table/ledger-table.svelte';
	import { createCols } from '$lib/components/ui/ledger-table/ledger-dj-columns';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import Plus from 'lucide-svelte/icons/plus';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	let base_djs: DJ[] = $state([]);
	let create_dj_open = $state(false);
	let create_dj_name = $state('');

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

	const createDjOpen = () => {
		create_dj_name = '';
		create_dj_open = true;
	};

	const createDj = async () => {
		let response = await addSingle(create_dj_name);
		if (response) {
			toast.success('Success', {
				description: `Created ${create_dj_name}.`,
				action: {
					label: 'Edit',
					onClick: () => goto(`/djs/${create_dj_name}`)
				}
			});
		}
		create_dj_open = false;
		updateDjs();
	};

	if (data.djs !== undefined) {
		base_djs = data.djs;
	}
</script>

<div class="flex flex-row items-center justify-around">
	<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-5xl">DJs</h1>
	<Button onclick={createDjOpen}>
		<Plus class="mr-2 h-4 w-4" />
		New DJ
	</Button>
</div>

<LedgerTable data={base_djs} columns={createCols('djs', deleteDjAction)} />

<Dialog.Root bind:open={create_dj_open}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new DJ</Dialog.Title>
			<Dialog.Description>
				<div class="flex flex-row items-center justify-between pt-4">
					Name:
					<Input class="w-80" type="text" placeholder="Name" bind:value={create_dj_name} />
				</div>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button type="submit" onclick={createDj}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
