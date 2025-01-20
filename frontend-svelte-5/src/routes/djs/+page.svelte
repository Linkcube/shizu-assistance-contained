<script lang="ts">
	import type { PageProps } from './$types';
	import { type DJ, getAll as getAllDjs } from '$lib/djController';
	import DataTable from './data-table.svelte';
	import { columns } from './columns.js';

	let { data }: PageProps = $props();

	let base_djs: DJ[] = $state([]);
	let djs_subset: DJ[];

	const updateDjs = async () => {
		const djs = await getAllDjs();
		if (djs !== undefined) {
			base_djs = djs;
			djs_subset = base_djs;
		}
	};

	if (data.djs !== undefined) {
		djs_subset = base_djs = data.djs;
	}
</script>

<DataTable data={base_djs} {columns} />
