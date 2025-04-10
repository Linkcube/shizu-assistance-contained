import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './ledger-table-actions.svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { CheckValue, NameLink, RawData } from './ledger-snippets.svelte';
import DataTableNameButton from './ledger-table-name-button.svelte';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import type { LineupItem } from '$lib/utils';

export const createCols = () => {
	const columns: ColumnDef<LineupItem>[] = [
		{
			accessorKey: 'name',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Name',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(RawData, row.original.name);
			}
		},
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value: boolean) => table.toggleAllPageRowsSelected(!!value),
					'aria-label': 'Select all'
				}),
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.original.selected || row.getIsSelected(),
					onCheckedChange: (value: boolean) => row.toggleSelected(!!value),
					disabled: row.original.selected,
					'aria-label': 'Select row'
				}),
			enableSorting: false,
			enableHiding: false
		}
	];

	return columns;
};
