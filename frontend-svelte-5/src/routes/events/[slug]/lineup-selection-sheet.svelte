<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import LedgerTable from '$lib/components/ui/ledger-table/ledger-table.svelte';
	import { createCols } from '$lib/components/ui/ledger-table/ledger-lineup-columns';
	import type { LineupItem } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ColumnDef } from '@tanstack/table-core';

	interface Props {
		event_name: string;
		items_type: 'djs' | 'promos';
		existing_items: string[];
		all_items: string[];
		makeSelection: (items: string[]) => void;
	}

	let { event_name, items_type, existing_items, all_items, makeSelection }: Props = $props();

	let lineup_sheet_open = $state(false);
	let lineup_table: LedgerTable<LineupItem, ColumnDef<LineupItem>>;
	let table_items: LineupItem[] = $state([]);
	let columns = createCols();

	const makeLineupTableItems = (): LineupItem[] => {
		return all_items.map((name) => {
			return {
				name: name,
				selected: existing_items.includes(name)
			};
		});
	};

	const submit = () => {
		makeSelection(
			lineup_table
				.getSelectedRows()
				.map((row) => row.original.name)
				.filter((name) => !existing_items.includes(name))
		);
		lineup_sheet_open = false;
	};

	export const openLineupSheet = async () => {
		table_items = makeLineupTableItems();
		lineup_sheet_open = false;
		lineup_sheet_open = true;
	};
</script>

<Sheet.Root open={lineup_sheet_open}>
	<Sheet.Content side="right">
		<Sheet.Header>
			<Sheet.Title>
				{#if items_type === 'djs'}
					Add DJs
				{:else}
					Add Promotions
				{/if}
			</Sheet.Title>
			<Sheet.Description>
				{#if items_type === 'djs'}
					Select DJs to add to {event_name}.
				{:else}
					Select Promotions to add to {event_name}.
				{/if}
				Clear the search field before clicking "Select".
			</Sheet.Description>
		</Sheet.Header>
		<LedgerTable data={table_items} {columns} bind:this={lineup_table} sidebar={true} />
		<Sheet.Footer>
			<Button class="w-full" onclick={submit}>Select</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
