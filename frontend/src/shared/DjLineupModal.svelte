<script>
    import {
        IconButton,
        MaterialSelect,
        MaterialInput
    } from 'linkcube-svelte-components';
    import Modal from './Modal.svelte';
    import { 
        fetchLineup,
        fetchUpdateLineupDj,
        fetchRemoveLineupDj,
        ledger,
        toFileName,
        error_stack
    } from '$lib/store.js';
    import { createEventDispatcher } from 'svelte';
    import { get } from 'svelte/store';

    export let index = 0;
    export let current_lineup = "";
    export let name = "";
    export let is_live = false;
    export let vj = "";
    export let dj_data;

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    const rtmp_conversion = {
        "us-west": "US West",
        "us-east": "US East",
        "jp": "Japan",
        "europe": "Europe"
    };
    let logo_name = dj_data.logo;
    let recording_name = dj_data.recording;
    let rtmp_server = dj_data.rtmp_server;
    let stream_key = dj_data.rtmp_key;
    let error_on_init = false;

    if (dj_data.rtmp_server) {
        rtmp_server = rtmp_conversion[dj_data.rtmp_server];
    }
    stream_key = dj_data.rtmp_key;

    export const removeDj = () => {
        fetchRemoveLineupDj(current_lineup, name).then(_ => fetchLineup(current_lineup));
        close();
    }

    export const saveDj = () => {
        fetchUpdateLineupDj(current_lineup, dj_data.name, is_live, vj).then(_ => fetchLineup(current_lineup));
        close();
    }
</script>

<style>
    .central-column {
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .delete {
        margin-left: auto;
        --secondary-text-color: var(--delete-color, red);
    }
</style>

{#if !error_on_init}
    <Modal on:close={close} on:submission={saveDj}>
        <div class="central-column">
            <div class="row">
                <p>Name: {name}</p>
                <div class="delete">
                    <IconButton icon="delete" title="Remove from lineup" on:click={removeDj} />
                </div>
            </div>
            <div class="row">
                <p>Logo: {logo_name ? logo_name : "Not Set"}</p>
            </div>
            <div class="row">
                <p>Recording: {recording_name ? recording_name : "Not Set"}</p>
            </div>
            <div class="row">
                <p>RTMP Server: {rtmp_server ? rtmp_server : "Not Set"}</p>
            </div>
            <div class="row">
                <p>Stream Key: {stream_key ? stream_key : "Not Set"}</p>
            </div>
            <div class="row">
                <MaterialSelect label="Is Live" bind:value={is_live}>
                    <option value={false}>False</option>
                    <option value={true}>True</option>
                </MaterialSelect>
            </div>
            <div class="row">
                <MaterialInput label="VJ Name" bind:value={vj}/>
            </div>
        </div>
    </Modal>
{/if}