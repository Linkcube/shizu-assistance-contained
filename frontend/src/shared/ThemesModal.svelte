<script>
    import {
        MaterialInput,
        IconButton,
        MaterialSelect
    } from 'linkcube-svelte-components';
    import Modal from './Modal.svelte';
    import { 
        error_stack,
        oaFetchThemes,
        oaPostNewTheme,
        THEME_TYPE,
        oaPostUpdateTheme,
        oaDeleteTheme

    } from '$lib/store.js';
    import { createEventDispatcher } from 'svelte';
    import ErrorMessage from './ErrorMessage.svelte';
    import FileObjectsDialog from './FileObjectsDialog.svelte';

    export let selected_theme_name;

    let themes = [];
    let selected_theme = null;
    let show_file_dialog = false;
    let selected_file_name = "";
    let selecting_file_property = "";
    let adding_theme = false;
    let new_theme_name = "";
    let show_save_message = false;
    let current_error = null;

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    error_stack.subscribe(error => {
        current_error = error;
    });


    async function getThemes() {
        themes = await oaFetchThemes();
        if (selected_theme_name) {
            selected_theme = themes.filter(theme => theme.name === selected_theme_name)[0];
        } else if (themes.length > 0) {
            selected_theme = themes[0];
            selected_theme_name = themes[0].name;
        } else {
            selected_theme = null;
            selected_theme_name = "";
        }
    }

    async function addTheme() {
        await oaPostNewTheme(new_theme_name)
        selected_theme_name = new_theme_name;
        await getThemes();
        adding_theme = false;
    }

    function selectOverlay() {
        selecting_file_property = "overlay_file";
        selected_file_name = selected_theme.overlay_file;
        show_file_dialog = true;
    }

    function selectStinger() {
        selecting_file_property = "stinger_file";
        selected_file_name = selected_theme.stinger_file;
        show_file_dialog = true;
    }

    function selectStarting() {
        selecting_file_property = "starting_file";
        selected_file_name = selected_theme.starting_file;
        show_file_dialog = true;
    }

    function selectEnding() {
        selecting_file_property = "ending_file";
        selected_file_name = selected_theme.ending_file;
        show_file_dialog = true;
    }

    async function updateFile(event) {
        selected_theme_name = selected_theme.name;
        selected_theme[selecting_file_property] = event.detail.file_name
        
        show_save_message = true;
        await makeUpdateCall();
        show_save_message = false;

        await getThemes();
    }

    async function removeTheme() {
        await oaDeleteTheme(selected_theme.name);
        selected_theme_name = "";
        selected_theme = {};
        await getThemes();
    }

    function submitTheme() {
        current_error = null;
        show_save_message = true;
        makeUpdateCall();
        setTimeout(() => {
            show_save_message = false;
            if (current_error == null) {
                dispatch("submission", {
                    theme_name: selected_theme.name
                });
                close();
            }
        }, 500);
    }

    function makeUpdateCall() {
        return oaPostUpdateTheme(
            selected_theme.name,
            selected_theme.overlay_file,
            selected_theme.starting_file,
            selected_theme.ending_file,
            selected_theme.target_video_height,
            selected_theme.target_video_width,
            selected_theme.video_offset_x,
            selected_theme.video_offset_y,
            selected_theme.chat_width,
            selected_theme.chat_height,
            selected_theme.chat_offset_x,
            selected_theme.chat_offset_y
        );
    }

    function selectionChanged() {
        selected_theme_name = selected_theme.name;
    }

    getThemes();
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

    .icon-container {
        margin-top: 13px;
        margin-right: 5px;
    }

    .header {
        justify-content: space-around;
    }

    .delete {
        --secondary-text-color: var(--delete-color, red);
    }
</style>

{#if show_file_dialog}
    <FileObjectsDialog
        file_type={THEME_TYPE}
        selected_file_name={selected_file_name}
        on:close={() => show_file_dialog = false}
        on:submission={updateFile}/>
{:else if adding_theme}
    <Modal on:close={() => adding_theme = false} on:submission={addTheme} z_index={5}>
        <div class="central-column">
            <div class="row">
                <MaterialInput label="Theme Name" bind:value={new_theme_name}/>
            </div>
        </div>
    </Modal>
{:else}
    <Modal on:close={close} on:submission={submitTheme} z_index={5}>
        <div class="central-column">
            <div class="header row">
                <MaterialSelect label="Themes" bind:value={selected_theme} on:change={selectionChanged}>
                    {#each themes as theme}
                        <option value={theme}>{theme.name}</option>
                    {/each}
                </MaterialSelect>
                {#if selected_theme}
                    <span>{selected_theme.name}</span>
                {:else}
                    <span>Add a Theme</span>
                {/if}
                <div class="row">
                    <IconButton icon="add" title="Add Theme" on:click={() => adding_theme = true} />
                    {#if selected_theme}
                        <div class="delete">
                            <IconButton icon="delete_forever" title="Delete Theme" on:click={removeTheme} />
                        </div>
                    {/if}
                </div>
            </div>
            {#if selected_theme}
                <div class="row">
                    <div class="icon-container">
                        <IconButton icon="note_add" title="Select Overlay" on:click={selectOverlay} />
                    </div>
                    <p>Overlay: {selected_theme.overlay_file ? selected_theme.overlay_file : "Not Set"}</p>
                </div>
                <div class="row">
                    <div class="icon-container">
                        <IconButton icon="note_add" title="Select Starting File" on:click={selectStarting} />
                    </div>
                    <p>Starting File: {selected_theme.starting_file ? selected_theme.starting_file : "Not Set"}</p>
                </div>
                <div class="row">
                    <div class="icon-container">
                        <IconButton icon="note_add" title="Select Ending File" on:click={selectEnding} />
                    </div>
                    <p>Ending File: {selected_theme.ending_file ? selected_theme.ending_file : "Not Set"}</p>
                </div>
                <div class="row">
                    <MaterialInput label="Video Height" bind:value={selected_theme.target_video_height}/>
                    <MaterialInput label="Video Width" bind:value={selected_theme.target_video_width}/>
                </div>
                <div class="row">
                    <MaterialInput label="Video X Offset" bind:value={selected_theme.video_offset_x}/>
                    <MaterialInput label="Video Y Offset" bind:value={selected_theme.video_offset_y}/>
                </div>
                <div class="row">
                    <MaterialInput label="Chat Height" bind:value={selected_theme.chat_height}/>
                    <MaterialInput label="Chat Width" bind:value={selected_theme.chat_width}/>
                </div>
                <div class="row">
                    <MaterialInput label="Chat X Offset" bind:value={selected_theme.chat_offset_x}/>
                    <MaterialInput label="Chat Y Offset" bind:value={selected_theme.chat_offset_y}/>
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