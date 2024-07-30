<script>
    import {
        lineups,
        currentLineup,
		currentLineupObjects,
        fetchLineup,
        fetchRemoveLineupDj,
        fetchRemoveLineupPromo,
        fetchSwapLineupDjs,
        fetchSwapLineupPromos,
        fetchExportLineup,
        fetchDeleteLineup,
        fetchLineups,
        EXPORT_TYPE,
        error_stack
    } from '$lib/store';
    import {
        MaterialTable,
        MaterialTableRow,
		IconButton,
        MaterialInput
    } from 'linkcube-svelte-components';
    import AddLineupModal from '../shared/AddLineupModal.svelte';
    import DjLineupModal from '../shared/DjLineupModal.svelte';
    import PromoLineupModal from '../shared/PromoLineupModal.svelte';
    import NewMatTableRow from './NewMatTableRow.svelte';
    import NewMatTable from './NewMatTable.svelte';
    import FileDialog from './FileDialog.svelte';
    import ErrorPopup from './ErrorPopup.svelte';

    const EDIT_DJ_FAILED = "Edit DJ Failed";
    const EDIT_PROMO_FAILED = "Edit Promo Failed";
    const EDIT_DJ_LINEUP_ORDER_FAILED = "Edit DJ Lineup Order Failed";
    const EDIT_PROMO_LINEUP_ORDER_FAILED = "Edit Promo Lineup Order Failed";
    const REMOVE_DJ_FAILED = "Remove DJ Failed";
    const REMOVE_PROMO_FAILED = "Remove DJ Failed";
    const EXPORT_FAILED = "Export Failed";

    let lineups_data = []
    let display_lineups = []
    let show_lineup_djs = true;
	let show_add_lineup = false;
    let lineup_djs = [];
	let lineup_promos = [];
    let current_lineup = null;
    let search_value = null;

    let edit_dj_index = 0;
    let edit_dj_name = "";
    let edit_dj_is_live = false;
    let edit_dj_vj = "";
    let show_edit_dj = false;

    let edit_promo_index = 0;
    let edit_promo_name = "";
    let show_edit_promo = false;

    let dragging_index = -1;
    let last_dragover_index = -1;
    let loading = true;

    let show_export_dialog = false;
    let show_export_error = false;
    let current_error = null;
    let last_action = "";

    error_stack.subscribe(error => current_error = error);
    const close_error = () => {
        show_export_error = false;
        show_edit_dj = false;
        show_edit_promo = false;
    }

    lineups.subscribe(value => {
        lineups_data = value;
        if (lineups_data) {
            display_lineups = lineups_data.map((lineup, index) => {
                return ({
                    index: index,
                    name: lineup
                });
            })
        }
    });
    currentLineup.subscribe(value => current_lineup = value);

	currentLineupObjects.subscribe(value => {
		lineup_djs = value.djs;
        if (value.promos) lineup_promos = value.promos.map(promo => ({name: promo}));
        loading = false;
	});

    const addLineup = () => {
		show_add_lineup = true;
	}

	const selectLineup = (name) => {
		fetchLineup(name).then(_ => {
			currentLineup.set(name);
			current_lineup = name;
            search_value = null;
            display_lineups = lineups_data.map((lineup, index) => {
                return ({
                    index: index,
                    name: lineup
                });
            });
		});
	}

	const backToLineups = () => {
		currentLineup.set(null);
		current_lineup = null;
	}

    const editDj = (index, name, is_live, vj) => {
        show_export_error = true;
        last_action = EDIT_DJ_FAILED;
        edit_dj_index = index;
        edit_dj_name = name;
        edit_dj_is_live = is_live;
        edit_dj_vj = vj;
        show_edit_dj = true;
    }

    const editPromo = (index, name) => {
        show_export_error = true;
        last_action = EDIT_PROMO_FAILED;
        edit_promo_index = index;
        edit_promo_name = name;
        show_edit_promo = true;
    }

    function handleDragStart(index) {
        dragging_index = index;
    }

    function handleDragOver(index) {
        last_dragover_index = index;
    }

    function handleDjDragEnd() {
        last_action = EDIT_DJ_LINEUP_ORDER_FAILED;
        show_export_error = true;
        // In browser for svelte animation
        if (dragging_index < 0 || last_dragover_index < 0) return;
        if (dragging_index === last_dragover_index) return;
        let moving_value = lineup_djs[dragging_index]
        let target_value = lineup_djs[last_dragover_index];
        lineup_djs.splice(dragging_index, 1);
        if (dragging_index > last_dragover_index) {
            lineup_djs.splice(lineup_djs.indexOf(target_value), 0, moving_value);
        } else {
            lineup_djs.splice(lineup_djs.indexOf(target_value) + 1, 0, moving_value);
        }
        
        loading = true;
        fetchSwapLineupDjs(current_lineup, dragging_index, last_dragover_index).then(_ => fetchLineup(current_lineup));
        setTimeout(() => {
            if (current_error == null) show_export_error = false;
        }, 500);
    }

    function handlePromoDragEnd() {
        last_action = EDIT_PROMO_LINEUP_ORDER_FAILED;
        show_export_error = true;
        // In browser for svelte animation
        if (dragging_index < 0 || last_dragover_index < 0) return;
        if (dragging_index === last_dragover_index) return;
        let moving_value = lineup_promos[dragging_index]
        let target_value = lineup_promos[last_dragover_index];
        lineup_promos.splice(dragging_index, 1);
        if (dragging_index > last_dragover_index) {
            lineup_promos.splice(lineup_promos.indexOf(target_value), 0, moving_value);
        } else {
            lineup_promos.splice(lineup_promos.indexOf(target_value) + 1, 0, moving_value);
        }
        
        loading = true;
        fetchSwapLineupPromos(current_lineup, dragging_index, last_dragover_index).then(_ => fetchLineup(current_lineup));
        setTimeout(() => {
            if (current_error == null) show_export_error = false;
        }, 500);
    }

    function toggleLineupObjects() {
        show_lineup_djs = !show_lineup_djs;
        last_dragover_index = -1;
        dragging_index = -1;
    }

    function exportLineup() {
        last_action = EXPORT_FAILED;
        show_export_dialog = true;
        show_export_error = true;
    }

    function exportSelected(event) {
        if (event.detail) {
            fetchExportLineup(current_lineup, event.detail).then(response => {
                if (response) show_export_error = false;
            });
        }
    }

    function deleteLineup() {
        fetchDeleteLineup(current_lineup).then(() => fetchLineups()).then(() => backToLineups());
    }

    function compareBy(field, direction) {
        switch(field) {
            case "#":
                if (direction) return (a, b) => a.index < b.index;
                return (a, b) => a.index > b.index;
            case "name":
                if (direction) return (a, b) => a.name.localeCompare(b.name) * -1;
                return (a, b) => a.name.localeCompare(b.name);
        }
    }

    function sortLineups(event) {
        display_lineups = display_lineups.sort(compareBy(event.detail.value, event.detail.direction));
    }

    const enterSearch = () => {
        if (!search_value || search_value === "") {
            display_lineups = lineups_data.map((lineup, index) => {
                return ({
                    index: index,
                    name: lineup
                });
            })
        } else {
            display_lineups = lineups_data.filter(lineup => lineup.toUpperCase().includes(search_value.toUpperCase()))
            .map((lineup, index) => {
                return ({
                    index: index,
                    name: lineup
                });
            });
        }
    }

    function removeErrorFromLineup() {
        if (last_action == EDIT_DJ_FAILED) {
            console.log(`Lineup: ${current_lineup}, DJ: ${edit_dj_name}`);
            fetchRemoveLineupDj(current_lineup, edit_dj_name).then(_ => fetchLineup(current_lineup));
            last_action = REMOVE_DJ_FAILED;
        } else if (last_action == EDIT_PROMO_FAILED) {
            console.log(`Lineup: ${current_lineup}, Promo: ${edit_promo_name}`);
            fetchRemoveLineupPromo(current_lineup, edit_promo_name).then(_ => fetchLineup(current_lineup));
            last_action = REMOVE_PROMO_FAILED
        } else {
            console.log(`Unexpected error callback for ${last_action}`);
        }

        show_edit_dj = false;
        show_edit_promo = false;
        setTimeout(() => {
            if (current_error == null) show_export_error = false;
        }, 500);
    }

    
</script>

<style>
	.display-button {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
		width: 100%;
        margin-left: 5%;
        margin-right: 5%
	}

	.space-between {
		justify-content: space-between;
	}

    .icon-container {
        margin-top: 10px;
    }

    .delete {
        --secondary-text-color: var(--delete-color, red);
    }

    .fill {
        margin: auto;
    }
</style>

{#if current_error && show_export_error}
    {#if last_action && last_action.startsWith("Edit")}
        <ErrorPopup error={current_error} header={last_action} callback="Remove from Lineup" on:close={close_error} on:callback={removeErrorFromLineup}/>
    {:else}
        <ErrorPopup error={current_error} header={last_action} on:close={close_error} />
    {/if}
{/if}
{#if show_add_lineup}
    <AddLineupModal on:close={() => show_add_lineup = false} />
{/if}
{#if show_edit_dj}
    <DjLineupModal
        index={edit_dj_index}
        name={edit_dj_name}
        is_live={edit_dj_is_live}
        current_lineup={current_lineup}
        vj={edit_dj_vj}
        on:close={() => show_edit_dj = false}
    />
{/if}
{#if show_edit_promo}
    <PromoLineupModal
        index={edit_promo_index}
        name={edit_promo_name}
        current_lineup={current_lineup}
        on:close={() => show_edit_promo = false}
    />
{/if}
{#if show_export_dialog}
    <FileDialog file_type={EXPORT_TYPE} on:close={() => show_export_dialog = false} on:submission={exportSelected}/>
{/if}

<div class="flex-column">
    <div class="flex-row">
        <h1>Lineups</h1>
    </div>
    {#if current_lineup === null}
        <div class="flex-row space-between">
            <MaterialInput label="Search Lineups" bind:value={search_value} on:blur={enterSearch} on:enter={enterSearch}/>
            <div class="fill" />
            <div class="icon-container">
                <IconButton icon="add" title="Add Lineup" on:click={addLineup} />
            </div>
        </div>
        <div class="flex-row">
            <MaterialTable items={display_lineups} columnSizes={["10%", "90%"]} height="500px">
                <div slot="header">
                    <NewMatTableRow values={["#", "name"]} type="header callback" on:callback={sortLineups}/>
                </div>
                <div slot="item" let:item let:index>
                    <MaterialTableRow
                        values={[`${item.index + 1}`, item.name]}
                        type="click row"
                        on:click={() => selectLineup(item.name)}
                    />
                </div>
            </MaterialTable>
        </div>
    {:else}
        <div class="flex-row space-between">
            <p>{current_lineup}</p>
            <div class="display-button icon-container">
                <IconButton icon="sync_alt" title="Show {show_lineup_djs ? 'Promos' : 'DJs'}" on:click={toggleLineupObjects} />
                <IconButton icon="download" title="Export Lineup" on:click={exportLineup} />
                <IconButton icon="reply" title="Back to Lineups" on:click={backToLineups} />
                <div class="delete">
                    <IconButton icon="delete_forever" title="Delete Lineups" on:click={deleteLineup} />
                </div>
            </div>
        </div>
        <div class="flex-row">
            {#if show_lineup_djs}
                <NewMatTable items={lineup_djs} columnSizes={["10%", "70%", "20%"]} height="500px">
                    <div slot="header">
                        <MaterialTableRow values={["#", "name", "Is Live"]} type="header"/>
                    </div>
                    <div slot="item" let:item let:index>
                        <NewMatTableRow
                            values={[`${index + 1}`, item.name, item.is_live]}
                            type="click row draggable"
                            on:click={() => editDj(index, item.name, item.is_live, item.vj)}
                            on:dragstart={() => handleDragStart(index)}
                            on:dragover={() => handleDragOver(index)}
                            on:dragend={() => handleDjDragEnd()}
                        />
                    </div>
                </NewMatTable>
            {:else}
                <NewMatTable items={lineup_promos} columnSizes={["10%", "90%"]} height="500px">
                    <div slot="header">
                        <MaterialTableRow values={["#", "name"]} type="header"/>
                    </div>
                    <div slot="item" let:item let:index>
                        <NewMatTableRow
                            values={[`${index + 1}`, item.name]}
                            type="click row draggable"
                            on:click={() => editPromo(index, item.name)}
                            on:dragstart={() => handleDragStart(index)}
                            on:dragover={() => handleDragOver(index)}
                            on:dragend={() => handlePromoDragEnd()}
                        />
                    </div>
                </NewMatTable>
            {/if}
        </div>
    {/if}
</div>