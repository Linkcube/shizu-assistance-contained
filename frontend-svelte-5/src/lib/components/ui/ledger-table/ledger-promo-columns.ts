import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './ledger-table-actions.svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { CheckValue, NameLink } from './ledger-snippets.svelte';
import DataTableNameButton from './ledger-table-name-button.svelte';
import type { Promotion } from '$lib/promotionsController';

export const createCols = (ledger_path: string, delete_function: (name: string) => void) => {
	const columns: ColumnDef<Promotion>[] = [
		{
			accessorKey: 'name',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Name',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(NameLink, { path: ledger_path, name: row.original.name });
			}
		},
		{
			accessorKey: 'promo_file',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'File',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(CheckValue, row.original.promo_file);
			},
			sortingFn: (rowA, rowB) => {
				return rowA.original.promo_file && rowB.original.promo_file
					? 0
					: rowA.original.promo_file
						? -1
						: 1;
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					name: row.original.name,
					path: ledger_path,
					delete_item: delete_function
				});
			}
		}
	];

	return columns;
};
