import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './ledger-table-actions.svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { CheckValue, CrossOrValue, NameLink, RawData } from './ledger-snippets.svelte';
import DataTableNameButton from './ledger-table-name-button.svelte';
import type { Event } from '$lib/eventController';

export const createCols = (ledger_path: string, delete_function: (name: string) => void) => {
	const columns: ColumnDef<Event>[] = [
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
			accessorKey: 'djs',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'DJs',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(RawData, row.original.djs ? row.original.djs.length : 0);
			},
			sortingFn: (rowA, rowB) => {
				return rowA.original.djs && rowB.original.djs
					? rowA.original.djs.length - rowB.original.djs.length
					: 0;
			}
		},
		{
			accessorKey: 'promos',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Promotions',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(RawData, row.original.promos ? row.original.promos.length : 0);
			},
			sortingFn: (rowA, rowB) => {
				return rowA.original.promos && rowB.original.promos
					? rowA.original.promos.length - rowB.original.promos.length
					: 0;
			}
		},
		{
			accessorKey: 'theme',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Theme',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(CrossOrValue, row.original.theme);
			},
			sortingFn: (rowA, rowB) => {
				return rowA.original.theme && rowB.original.theme
					? rowA.original.theme.localeCompare(rowB.original.theme)
					: rowA.original.theme
						? -1
						: 1;
			}
		},
		{
			accessorKey: 'date',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Date',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(CrossOrValue, row.original.date);
			},
			sortingFn: 'datetime'
		},
		{
			accessorKey: 'public',
			header: ({ column }) =>
				renderComponent(DataTableNameButton, {
					name: 'Public',
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				}),
			cell: ({ row }) => {
				return renderSnippet(CheckValue, row.original.public);
			},
			sortingFn: (rowA, rowB) => {
				return rowA.original.public && rowB.original.public ? 0 : rowA.original.public ? -1 : 1;
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
