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

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    const rtmp_conversion = {
        "us-west": "US West",
        "us-east": "US East",
        "jp": "Japan",
        "europe": "Europe"
    };
    let logo_name = "";
    let recording_name = "";
    let rtmp_server = "";
    let stream_key = "";
    let error_on_init = false;

    const ledger_data = get(ledger);
    const dj_data = ledger_data.djs.filter(dj => dj.name === name)[0];

    if (dj_data === undefined) {
        error_stack.set({
            message: `Could not find DJ ${name} in ledger.`,
            extensions: {
                statusCode: 404,
                errorType: "DjNotFoundError"
            }
        });
        error_on_init = true;
        close();
    } else {
        logo_name = toFileName(dj_data.logo_path);    
        recording_name = toFileName(dj_data.recording_path);

        if (dj_data.rtmp_server) {
            rtmp_server = rtmp_conversion[dj_data.rtmp_server];
        }
        stream_key = dj_data.stream_key;
    }

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
                <p>Logo File: {logo_name ? logo_name : "Not Set"}</p>
            </div>
            <div class="row">
                <p>Recording File: {recording_name ? recording_name : "Not Set"}</p>
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