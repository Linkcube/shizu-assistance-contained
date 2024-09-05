<script>
    import {
        lineups,
        currentLineup,
		currentLineupObjects,
        all_events,
        oaFetchSingleEvent,
    } from '$lib/store';
    import {
        MaterialTable,
        MaterialTableRow,
		IconButton,
        MaterialInput
    } from 'linkcube-svelte-components';
    import AddLineupModal from '../shared/AddLineupModal.svelte';
    import NewMatTableRow from './NewMatTableRow.svelte';
    import EventModal from './EventModal.svelte';
    import { get } from 'svelte/store';

    let lineups_data = []
    let display_lineups = []
	let show_add_lineup = false;
    let current_lineup = null;
    let search_value = null;

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
    all_events.subscribe(value => {
        lineups_data = value;
        if (lineups_data) {
            display_lineups = lineups_data.map((lineup, index) => {
                return ({
                    index: index,
                    name: lineup.name
                });
            })
        }
    });
    currentLineup.subscribe(value => current_lineup = value);

    const addLineup = () => {
		show_add_lineup = true;
	}

	const selectLineup = (name) => {
		oaFetchSingleEvent(name).then(_ => {
			currentLineup.set(name);
			current_lineup = name;
            search_value = null;
		});
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
                    name: lineup.name
                });
            })
        } else {
            display_lineups = lineups_data.filter(lineup => lineup.name.toUpperCase().includes(search_value.toUpperCase()))
            .map((lineup, index) => {
                return ({
                    index: index,
                    name: lineup.name
                });
            });
        }
    }

    
</script>

<style>
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

{#if show_add_lineup}
    <AddLineupModal on:close={() => show_add_lineup = false} />
{/if}
{#if current_lineup}
    <EventModal
        event={get(currentLineupObjects)} on:close={() => current_lineup = null}
    />
{/if}

<div class="flex-column">
    <div class="flex-row">
        <h1>Events</h1>
    </div>
    <div class="flex-row space-between">
        <MaterialInput label="Search Events" bind:value={search_value} on:blur={enterSearch} on:enter={enterSearch}/>
        <div class="fill" />
        <div class="icon-container">
            <IconButton icon="add" title="Add Event" on:click={addLineup} />
        </div>
    </div>
    <div class="flex-row">
        <MaterialTable items={display_lineups} columnSizes={["10%", "90%"]} height="500px">
            <div slot="header">
                <NewMatTableRow values={["#", "Name"]} type="header callback" on:callback={sortLineups}/>
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
</div>