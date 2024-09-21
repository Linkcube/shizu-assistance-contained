
<script>
    import {
        all_djs,
        all_promos,
        oaFetchSingleDj,
        oaFetchSinglePromo
    } from '$lib/store';
    import {
        MaterialTable,
		IconButton,
		MaterialInput
    } from 'linkcube-svelte-components';
	import DjModal from '../shared/DjModal.svelte';
    import PromoModal from '../shared/PromoModal.svelte';
    import NewMatTableRow from './NewMatTableRow.svelte';

    const dj_table_fields = ["#", "Name", "Logo", "RTMP", "Recording"];

    let show_djs = true;
    let ledger_djs = [];
    let display_ledger_djs = [];
	let ledger_promos = [];
    let display_ledger_promos = [];
    let search_value = null;
    let show_dj_modal = false;
    let show_promo_modal = false;

    let dj_modal_index = -1;
	let dj_modal_name = "";
    let dj_promise = Promise.resolve({});

    let promo_modal_index = -1;
    let promo_modal_name = "";
    let promo_promise = Promise.resolve({});

    all_djs.subscribe(value => {
		if (value.length > 0) {
			ledger_djs = value.map((dj, index) => {
                dj['index'] = index;
                return dj;
            });
            display_ledger_djs = ledger_djs;
		}
	});

    all_promos.subscribe(value => {
		if (value.length > 0) {
			ledger_promos = value.map((promo, index) => {
                promo['index'] = index;
                return promo
            });
            display_ledger_promos = ledger_promos
		}
	});

    const enterSearch = () => {
        if (search_value === "") {
            if (show_djs) {
                display_ledger_djs = ledger_djs;
            } else {
                display_ledger_promos = ledger_promos;
            }
        } else {
            if (show_djs) {
                display_ledger_djs = ledger_djs.filter(dj => dj.name.toUpperCase().includes(search_value.toUpperCase()));
            } else {
                display_ledger_promos = ledger_promos.filter(promo => promo.name.toUpperCase().includes(search_value.toUpperCase()));
            }
        }
    }

    const addItem = () => {
        if (show_djs) {
            show_dj_modal = true;
        } else {
            show_promo_modal = true;
        }
    }

    const editDj = (index, name) => {
		dj_modal_index = (index !== null) ? index : -1;
		dj_modal_name = (name !== null) ? name : "";
        dj_promise = oaFetchSingleDj(name);
		show_dj_modal = true;
	}
	const resetDjModal = () => {
		dj_modal_index = -1;
		dj_modal_name = "";
        dj_promise = Promise.resolve({});
		show_dj_modal = false; 
	}

    const editPromo = (index, name) => {
        promo_modal_index = (index !== null) ? index : -1;
        promo_modal_name = (name !== null) ? name : "";
        promo_promise = oaFetchSinglePromo(name);
        show_promo_modal = true;
    }
    const resetPromoModal = () => {
		promo_modal_index = -1;
		promo_modal_name = "";
        promo_promise = Promise.resolve({});
        show_promo_modal = false;
	}

    function compareBy(field, direction) {
        // TODO: handle nulls
        switch(field) {
            case dj_table_fields[0]:
                if (direction) return (a, b) => a.index < b.index;
                return (a, b) => a.index > b.index;
            case dj_table_fields[1]:
                if (direction) return (a, b) => a.name.localeCompare(b.name) * -1;
                return (a, b) => a.name.localeCompare(b.name);
            case dj_table_fields[2]:
                if (direction) return (a, b) => !(Boolean(a.logo) < Boolean(b.logo));
                return (a, b) => Boolean(a.logo) < Boolean(b.logo);
            case dj_table_fields[3]:
                if (direction) return (a, b) => !(Boolean(a.rtmp_server) < Boolean(b.rtmp_server));
                return (a, b) => Boolean(a.rtmp_server) < Boolean(b.rtmp_server);
            case dj_table_fields[4]:
                if (direction) return (a, b) => !(Boolean(a.recording) < Boolean(b.recording));
                return (a, b) => Boolean(a.recording) < Boolean(b.recording);
        }
    }

    const sortDjsBy = (event) => {
        display_ledger_djs = display_ledger_djs.sort(compareBy(event.detail.value, !event.detail.direction));
    }

    const sortPromosBy = (event) => {
        display_ledger_promos = display_ledger_promos.sort(compareBy(event.detail.value, !event.detail.direction));
    }

    const toggleDisplay = () => {
        show_djs = !show_djs;
        display_ledger_djs = ledger_djs;
        display_ledger_promos = ledger_promos;
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
</style>

{#if show_dj_modal}
    {#await dj_promise then dj_data}
        <DjModal
            index={dj_modal_index}
            name={dj_modal_name}
            dj_data={dj_data}
            on:close={resetDjModal}
        />
    {/await}
{/if}
{#if show_promo_modal}
    {#await promo_promise then promo_data}
        <PromoModal
            index={promo_modal_index}
            name={promo_modal_name}
            promo_data={promo_data}
            on:close={resetPromoModal}
        />
    {/await}
{/if}

<div class="flex-column">
    <div class="flex-row">
        <h1>Ledger</h1>
    </div>
    <div class="flex-row space-between">
        <div class="display-button">
            <MaterialInput label="Search {show_djs ? "DJs": "Promos"}" bind:value={search_value} on:blur={enterSearch} on:enter={enterSearch}/>
        </div>
        <div class="display-button icon-container">
            <IconButton icon="sync_alt" title="Show {show_djs ? 'Promos' : 'DJs'}" on:click={toggleDisplay} />
            <IconButton icon="add" title="Add {show_djs ? 'DJ' : 'Promo'}" on:click={addItem} />
        </div>
    </div>
    
    {#if show_djs}
        <MaterialTable items={display_ledger_djs} columnSizes={["10%", "30%", "20%", "20%", "20%"]} height="500px">
            <div slot="header">
                <NewMatTableRow values={dj_table_fields} type="header callback" on:callback={sortDjsBy}/>
            </div>
            <div slot="item" let:item let:index>
                <NewMatTableRow
                    values={[`${item.index + 1}`, item.name, Boolean(item.logo), item.rtmp_server ? item.rtmp_server: false, Boolean(item.recording)]}
                    type="click row"
                    on:click={() => editDj(item.index, item.name)} />
            </div>
        </MaterialTable>
    {:else}
        <MaterialTable items={display_ledger_promos} columnSizes={["10%", "90%"]} height="500px">
            <div slot="header">
                <NewMatTableRow values={["#", "Name"]} type="header callback" on:callback={sortPromosBy}/>
            </div>
            <div slot="item" let:item let:index>
                <NewMatTableRow
                    values={[`${item.index + 1}`, item.name]}
                    type="click row"
                    on:click={() => editPromo(item.index, item.name)}
                />
            </div>
        </MaterialTable>
    {/if}
</div>