<script>
    import {
        MaterialButton,
        MaterialInput,
        IconButton,
        MaterialSelect
    } from 'linkcube-svelte-components';
    import Modal from './Modal.svelte';
    import {
        fetchGetFilePath,
        currentLineup,
        lineups,
        fetchLineup,
        toFileName,
        fetchAddPromo,
        fetchUpdatePromo,
        fetchDeletePromo,
        fetchAddPromoToLineup,
        RECORDING_TYPE,
        error_stack
    } from '$lib/store.js';
    import { createEventDispatcher } from 'svelte';
    import { get } from 'svelte/store';
    import FileDialog from './FileDialog.svelte';
    import ErrorMessage from './ErrorMessage.svelte';

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    export let index = -1;
    export let name = "";
    export let file_path = "";

    const current_lineup = get(currentLineup);
    const lineup_names = get(lineups);
    let target_lineup = lineup_names[0];

    let file_name = toFileName(file_path);
    let selecting_file = false;
    let show_file_dialog = false;
    let current_error = null;
    let show_save_message = false;

    error_stack.subscribe(error => current_error = error);

    function savePromo() {
        if (index < 0) {
            fetchAddPromo(name, file_path);
        } else {
            fetchUpdatePromo(
                index,
                name,
                file_path
            );
        }
        setTimeout(() => {
            show_save_message = false;
            if (current_error == null) {
                close();
            }
        }, 500);
    }

    function selectFile() {
        show_file_dialog = true;
    }

    function updateFile(event) {
        if (event.detail) {
            let full_path = event.detail;
            file_name = toFileName(full_path);
            file_path = full_path;
        }
    }

    function removePromo() {
        fetchDeletePromo(index).then(() => {
            if (current_lineup) fetchLineup(current_lineup)
        });
        close();
    }

    function addToLineup() {
        let lineup_name = current_lineup ? current_lineup : target_lineup;
        fetchAddPromoToLineup(lineup_name, name).then(_ => {
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

{#if show_file_dialog}
    <FileDialog file_type={RECORDING_TYPE} on:close={() => show_file_dialog = false} on:submission={updateFile}/>
{:else}
    <Modal on:close={close} on:submission={savePromo}>
        <div class="central-column">
            <div class="row">
                <MaterialInput label="Promo Name" bind:value={name}/>
                {#if index >= 0}
                    <div class="delete">
                        <IconButton icon="delete_forever" title="Delete Promo" on:click={removePromo} />
                    </div>
                {/if}
            </div>
            <div class="row">
                <div class="icon-container">
                    <IconButton icon="video_file" title="Select File" on:click={selectFile} />
                </div>
                <p>{file_name}</p>
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
        </div>
        {#if current_error}
            <ErrorMessage error={current_error} />
        {/if}
        {#if show_save_message && !current_error}
            <div class="row saving">
                <p>Saving...</p>
            </div>
        {/if}
    </Modal>
{/if}