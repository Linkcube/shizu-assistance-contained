<script>
    import {
        MaterialButton,
        MaterialInput,
        IconButton,
        MaterialSelect
    } from 'linkcube-svelte-components';
    import Modal from './Modal.svelte';
    import { 
        fetchAddDj,
        fetchUpdateDj,
        fetchDeleteDj,
        RTMP_SERVERS,
        currentLineup,
        fetchAddDjToLineup,
        fetchLineup,
        RECORDING_TYPE,
        LOGO_TYPE,
        error_stack,
        all_events,
        fetchFileExists

    } from '$lib/store.js';
    import { createEventDispatcher } from 'svelte';
    import { get } from 'svelte/store';
    import ErrorMessage from './ErrorMessage.svelte';
    import FileObjectsDialog from './FileObjectsDialog.svelte';

    export let index = -1;
    export let name = "";

    const current_lineup = get(currentLineup);
    const lineup_names = get(all_events).map(event => event.name);
    let target_lineup = lineup_names[0];
    let show_logo_dialog = false;
    let show_recording_dialog = false;
    let current_error = null;
    let show_save_message = false;

    export let dj_data;

    let logo_name = dj_data.logo;
    let recording_name = dj_data.recording;
    let rtmp_server = dj_data.rtmp_server;
    let stream_key = dj_data.rtmp_key;
    let logo_data = {};
    let recording_data = {};

    fetchFileExists(logo_name).then(file => {
        if (file) {
            logo_data = file;
        }
    });
    fetchFileExists(recording_name).then(file => {
        if (file) {
            recording_data = file;
        }
    });
    
    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    error_stack.subscribe(error => {
        current_error = error;
    });

    function saveDj() {
        current_error = null;
        show_save_message = true;
        if (index < 0) {
            fetchAddDj(
                name,
                logo_name,
                recording_name,
                rtmp_server,
                stream_key
            )
        } else {
            fetchUpdateDj(
                index,
                name,
                logo_name,
                recording_name,
                rtmp_server,
                stream_key
            )
        }
        setTimeout(() => {
            show_save_message = false;
            if (current_error == null) {
                close();
            }
        }, 500);
    }

    function selectLogo() {
        show_logo_dialog = true;
    }

    function updateLogo(event) {
        logo_name = event.file_name;
    }

    function selectRecording() {
        show_recording_dialog = true;
    }

    function updateRecording(event) {
        recording_name = event.file_name;
    }

    function removeDj() {
        fetchDeleteDj(index).then(() => {
            if (current_lineup) fetchLineup(current_lineup)
        });
        close();
    }

    function addToLineup() {
        let lineup_name = current_lineup ? current_lineup : target_lineup;
        fetchAddDjToLineup(lineup_name, name).then(_ => {
            if (current_lineup) fetchLineup(current_lineup)
        });
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

    .icon-container {
        margin-top: 10px;
        margin-right: 10px;
    }

    .saving {
        color: var(--secondary-text-color, red);
    }
</style>


{#if show_logo_dialog}
    <FileObjectsDialog
        file_type={LOGO_TYPE}
        selected_file_name={logo_name}
        on:close={() => show_logo_dialog = false}
        on:submission={updateLogo}/>
{:else if show_recording_dialog}
    <FileObjectsDialog
        file_type={RECORDING_TYPE}
        selected_file_name={recording_name}
        on:close={() => show_recording_dialog = false}
        on:submission={updateRecording}/>
{:else}
    <Modal on:close={close} on:submission={saveDj}>
        <div class="central-column">
            <div class="row">
                <MaterialInput label="DJ Name" bind:value={name}/>
                {#if index >= 0}
                    <div class="delete">
                        <IconButton icon="delete_forever" title="Delete DJ" on:click={removeDj} />
                    </div>
                {/if}
            </div>
            <div class="row">
                <div class="icon-container">
                    <IconButton icon="photo" title="Select Logo" on:click={selectLogo} />
                </div>
                <p>Logo: {dj_data ? logo_name : "Not Set"}</p>
            </div>
            <div class="row">
                <MaterialSelect label="RTMP Server" bind:value={rtmp_server}>
                    {#each RTMP_SERVERS as { id, name}}
                        <option value={id}>{name}</option>
                    {/each}
                </MaterialSelect>
                <MaterialInput label="Stream Key" bind:value={stream_key} />
            </div>
            <div class="row">
                <div class="icon-container">
                    <IconButton icon="video_file" title="Select Recording" on:click={selectRecording} />
                </div>
                <p>Recording: {recording_name ? recording_name : "Not Set"}</p>
            </div>
            {#if index >= 0 && lineup_names.length != 0}
                <div class="row">
                    <MaterialButton value="Add to{current_lineup ? ' current ' : ' '}Lineup" on:click={addToLineup} />
                    {#if !current_lineup}
                        <MaterialSelect label="Lineups" bind:value={target_lineup}>
                            {#each lineup_names as name}
                                <option value={name}>{name}</option>
                            {/each}
                        </MaterialSelect>
                    {/if}
                </div>
            {/if}
            {#if current_error}
                <ErrorMessage error={current_error} />
            {/if}
            {#if show_save_message && !current_error}
                <div class="row saving">
                    <p>Saving...</p>
                </div>
            {/if}
        </div>
    </Modal>
{/if}