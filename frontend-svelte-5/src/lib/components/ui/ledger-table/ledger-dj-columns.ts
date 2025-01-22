import type { ColumnDef } from '@tanstack/table-core';
import { type DJ } from '$lib/djController';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './ledger-table-actions.svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { CheckValue, CrossOrValue, NameLink } from './ledger-snippets.svelte';
import DataTableNameButton from './ledger-table-name-button.svelte';

export const createCols = (ledger_path: string, delete_function: (name: string) => void) => {
	const columns: ColumnDef<DJ>[] = [
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
			accessorKey: 'logo',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Logo',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(CheckValue, row.original.logo);
			}
		},
		{
			accessorKey: 'rtmp_server',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'RTMP',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				let val = '';
				if (row.original.rtmp_server && row.original.rtmp_key)
					val = row.original.rtmp_server.toUpperCase();
				return renderSnippet(CrossOrValue, val);
			}
		},
		{
			accessorKey: 'recording',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Recording',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(CheckValue, row.original.recording);
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
