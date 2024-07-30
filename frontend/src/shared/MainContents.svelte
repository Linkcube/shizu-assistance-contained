<script>
	import {
        fetchSettings,
        fetchLedger,
        fetchLineups,
		fetchGetAppThemes
    } from '$lib/store';
	import LedgerTable from '../shared/LedgerTable.svelte';
	import LineupsTable from "../shared/LineupsTable.svelte"

	fetchGetAppThemes();
    fetchSettings();
    fetchLedger();
    fetchLineups();
</script>

<style>
	.content {
		flex-grow: 1;
        overflow-y: auto;
		background: var(--background-color, white);
        display: flex;
        flex-direction: column;
        height: 100%;
	}

	.flex-display {
		display: flex;
		flex-direction: row;
	}

	@media (max-width: 800px) {
		.flex-display {
			flex-direction: column;
			margin-right: 60px;
		}
	}
</style>

<div class="content">
    <div class="flex-display">
        <LedgerTable />
        <LineupsTable />
    </div>
</div>