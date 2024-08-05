<script>
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { MaterialButton, MaterialInput, IconButton } from 'linkcube-svelte-components';
    import Modal from './Modal.svelte';
    import FileDialog from './FileDialog.svelte';
    import ErrorMessage from './ErrorMessage.svelte';
    import {
        LOGO_TYPE,
        RECORDING_TYPE,
        EXPORT_TYPE,
        graphqlBase,
        fetchLogoFiles,
        fetchRecordingFiles,
        fetchThemeFiles,
        fetchAddLogoFile,
        fetchAddRecordingFile,
        fetchUpdateFile,
        error_stack,

        fetchDeleteFile

    } from '$lib/store';
	
    export let file_type = LOGO_TYPE;
    export let selected_file_name = "";

	const dispatch = createEventDispatcher();
    const close = () => dispatch('close');
    
    let current_files = [];
    let current_files_map = new Map();
    let display_files = [];
    let preview_path = "";
    let new_url_path = "";
    let new_file_name = "";
    let selected_file = {};
    let current_error = null;

    let selecting_local_file = false;
    let selecting_url = false;
    let adding_file = false;

	/**
     * @type {HTMLDivElement}
     */
	let modal;

    let sort_direction = false;
    let search_value = "";

	const handle_keydown = e => {
		if (e.key === 'Escape') {
			close();
			return;
		}

		if (e.key === 'Tab') {
			// trap focus
			const nodes = modal.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && e.shiftKey) index = 0;

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			e.preventDefault();
		}
	};

	const previously_focused = typeof document !== 'undefined' && document.activeElement;

	if (previously_focused) {
		onDestroy(() => {
			previously_focused.focus();
		});
	}

    error_stack.subscribe(error => {
        current_error = error;
    });

    function selectFileItem(file) {
        selected_file = file;
        selected_file_name = file.name;
        if (!file.file_path) {
            preview_path = "";
            return;
        }
        if (file_type == LOGO_TYPE) {
            preview_path = `${graphqlBase}/logos/${file.file_path}`;
        } else {
            preview_path = `${graphqlBase}/recordings/${file.file_path}`;
        }
    }

    function selectLocalFile() {
        selecting_local_file = true;
    }

    async function updateLocalFile(event) {
        if (event.detail) {
            const retval = await fetchUpdateFile(selected_file.name, selected_file.root, event.detail.file_path, selected_file.url_path);

            if (retval) {
                selected_file_name = retval.name;
                await fetchFiles();
            }
        }
        selecting_local_file = false;
    }

    function selectUrl() {
        new_url_path = selected_file.url_path;
        selecting_url = true;
    }

    async function updateUrl() {
        const retval = await fetchUpdateFile(selected_file.name, selected_file.root, selected_file.file_path, new_url_path);

        if (retval) {
            selected_file_name = retval.name;
            await fetchFiles();
        }
        selecting_url = false;
    }

    function openAddFile() {
        new_file_name = "";
        adding_file = true;
    }

    async function addFile() {
        if (file_type === LOGO_TYPE) {
            await fetchAddLogoFile(new_file_name, null, null);
        } else if (file_type === RECORDING_TYPE) {
            await fetchAddRecordingFile(new_file_name, null, null);
        } else {
            // Replace with add theme file
            await fetchAddLogoFile(new_file_name, null, null);
        }
        selected_file_name = new_file_name;
        await fetchFiles();
        adding_file = false;
    }

    async function deleteFile() {
        await fetchDeleteFile(selected_file_name);
        selected_file = null;
        selected_file_name = "";
        await fetchFiles();
    }

    function submission() {
        if (!selected_file) return;
        dispatch('submission', {
            file_name: selected_file.name
        });
        close();
    }

    function unset() {
        dispatch('submission', {
            file_name: ""
        });
        close();
    }

    function compareBy(direction) {
        if (direction) return (a, b) => `${a.name}${a.ext}`.localeCompare(`${b.name}${b.ext}`) * -1;
        return (a, b) => `${a.name}${a.ext}`.localeCompare(`${b.name}${b.ext}`);
    }

    function sortByName() {
        display_files = display_files.sort(compareBy(sort_direction));
        sort_direction = !sort_direction;
    }

    const enterSearch = () => {
        if (search_value === "") {
            display_files = current_files;
        } else {
            display_files = current_files.filter(file => `${file.name}${file.ext}`.toUpperCase().includes(search_value.toUpperCase()));
        }
    }

    async function fetchFiles() {
        let files;
        if (file_type === LOGO_TYPE) {
            files = await fetchLogoFiles();
        } else if (file_type === RECORDING_TYPE) {
            files = await fetchRecordingFiles();
        } else {
            files = await fetchThemeFiles();
        }

        if (files) {
            display_files = files;
            current_files = files;
            current_files_map = new Map(files.map((file) => [file.name, file]));
            if (selected_file_name) {
                selected_file = current_files_map.get(selected_file_name);
                selectFileItem(selected_file);
            }
            sort_direction = false;
            sortByName();
        }
    }

    fetchFiles();
    


</script>

<svelte:window on:keydown={handle_keydown}/>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.3);
		z-index: 1;
	}

	.modal {
		position: fixed;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 90%;
		max-height: 90%;
		overflow: auto;
		transform: translate(-50%,-50%);
		padding: 1em;
		border-radius: 0.2em;
		background: var(--background-color, white);
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.29);
		z-index: 2;
	}

    .footer {
        display: flex;
        justify-content: space-between;
        line-height: 40px;
    }

    .user-actions {
        display: flex;
        justify-content: flex-end;
		-webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10+ and Edge */
        user-select: none; /* Standard syntax */
    }

	.cancel {
		--primary-text-color: var(--cancel-text-color, red);
		--secondary-color: var(--secondary-color, rgb(253, 229, 232));
	}

	.submit {
		--primary-text-color: var(--primary-color, blue);
		--secondary-color: var(--secondary-color, rgb(235, 246, 250));
	}

    .disabled {
        --primary-text-color: var(--secondary-color, gray);
        --secondary-color: var(--secondary-color, rgb(253, 229, 232));
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10+ and Edge */
        user-select: none; /* Standard syntax */
        cursor: not-allowed;
    }

    .column {
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        flex-direction: row;
        line-height: 1.5;
    }

    .material-icons {
        font-size: 20px;
        color: var(--secondary-text-color, gray);
        background-color: rgba(0,0,0,0);
        border: none;
        padding-right: 10px;
        transition: 0.3s;
        border-radius:100px;
        margin-bottom: 7px;
        -webkit-transform: scaleX(var(--scaleX)) scaleY(var(--scaleY));
        transform: scaleX(var(--scaleX)) scaleY(var(--scaleY));
        margin-right: auto;
        margin-left: auto;
    }

    .material-icons::-moz-focus-inner {
        border: 0;
    }

    .large-icon {
        font-size: 25px;
    }

    .nav-header {
        height: 60px;
        width: 100%;
        justify-content: flex-start;
    }

    .nav-header-sort {
        cursor: pointer;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
        margin-top: auto;
        margin-bottom: auto;
    }

    .file-selection {
        width: 100%;
        overflow-y: scroll;
        height: 700px;
    }

    .main {
        min-height: 500px;
    }

    .body {
        flex-grow: 1;
    }

    .preview {
        width: 30%;
        min-width: 100px;
    }

    .file-selection-row {
        border-top: 1px solid var(--secondary-text-color, gray);
        justify-content: flex-start;
        cursor: pointer;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }

    .file-selection-row:hover {
        background: var(--secondary-color, lightgray);
        transition-duration: 400ms;
    }

    .file-selection-icon {
        margin: 10px;
    }

    .file-selection-item {
        margin-top: 10px;
        text-overflow: ellipsis;
    }

    .preview-image {
        height: 100%;
        width: 100%;
    }

    .preview-text {
        text-overflow: ellipsis;
    }

    .icon-container {
        margin-top: 10px;
        margin-right: 10px;
    }

    .inline-icon {
        margin-left: 0px;
        margin-right: 0px;
    }

    .check-color {
        color: var(--primary-color, lightblue);
    }

    .cancel-color {
        color: var(--delete-color, red);
    }

    .delete {
        margin-left: auto;
        --secondary-text-color: var(--delete-color, red);
    }
</style>


{#if selecting_local_file}
    <FileDialog
        file_type={file_type}
        on:close={() => selecting_local_file = false}
        on:submission={updateLocalFile}/>
{:else if selecting_url}
    <Modal
        on:close={() => selecting_url = false}
        on:submission={updateUrl}>
        <div class="central-column">
            <div class="row">
                <p>Edit URL for {selected_file.name}</p>
            </div>
            <div class="row">
                <MaterialInput label="URL" bind:value={new_url_path}/>
            </div>
        </div>
    </Modal>
{:else if adding_file}
    <Modal
        on:close={() => adding_file = false}
        on:submission={addFile}>
        <div class="central-column">
            <div class="row">
                <p>Add a New File</p>
            </div>
            <div class="row">
                <MaterialInput label="Name" bind:value={new_file_name}/>
            </div>
        </div>
    </Modal>
{:else}
    <div class="modal-background" on:click={close}></div>
{/if}

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
	<div class="nav-header row">
        <p>Select { file_type === LOGO_TYPE ? "Logo" : "Recording"}</p>
        <div class="display-button icon-container">
            <IconButton icon="add" title="Add File" on:click={openAddFile} />
        </div>
    </div>
    <br>
	<div class="main row">
        <div class="body column">
            <div class="nav-header row">
                <div class="nav-header-sort" on:click={sortByName}>
                    <span>Name</span>
                    <span class="material-icons">swap_vert</span>
                </div>
                <MaterialInput
                    label="Search Files"
                    bind:value={search_value}
                    on:blur={enterSearch}
                    on:enter={enterSearch}/>
            </div>
            <div class="file-selection column">
                {#each display_files as file}
                    <span class="row file-selection-row" on:click={() => selectFileItem(file)}>
                        <span class="material-icons large-icon file-selection-icon">
                            {#if file_type == LOGO_TYPE}
                                photo
                            {:else if file_type === RECORDING_TYPE}
                                video_file
                            {:else}
                                draft
                            {/if}
                        </span>
                        <span class="file-selection-item">{file.name}</span>
                    </span>
                {/each}
            </div>
        </div>
        <div class="preview column">
            <span class="row">File Details</span>
            {#if selected_file}
                <div class="row">
                    <span class="preview-text">{selected_file.name}</span>
                </div>
                <div class="row">
                    {#if selected_file.file_path}
                        <span class="material-icons large-icon check-color inline-icon">check_circle</span>
                    {:else}
                        <span class="material-icons large-icon cancel-color inline-icon">cancel</span>
                    {/if}
                    <span class="preview-text">Local File</span>
                </div>
                <div class="row">
                    {#if selected_file.url_path}
                        <span class="material-icons large-icon check-color inline-icon">check_circle</span>
                    {:else}
                        <span class="material-icons large-icon cancel-color inline-icon">cancel</span>
                    {/if}
                    <span class="preview-text">URL Path</span>
                </div>
                <div class="row icon-container">
                    <div class="row">
                        <IconButton
                            icon="note_add"
                            title="Select Logo"
                            on:click={selectLocalFile} />
                        <IconButton
                            icon="add_link"
                            title="Select URL"
                            on:click={selectUrl} />
                    </div>
                    <div class="delete">
                        <IconButton
                            icon="delete_forever"
                            title="Delete File"
                            on:click={deleteFile} />
                    </div>
                </div>
                {#if file_type == LOGO_TYPE}
                    <div class="preview-image" style={`background: url("${preview_path}"); background-size: contain; background-repeat: no-repeat;`} />
                {:else}
                    <video controls src={preview_path} height=200px/>
                {/if}
                <div class="row">
                    <span>Full Paths:</span>
                </div>
                {#if selected_file.file_path}
                    <div class="row">
                        <span class="preview-text">Local: {selected_file.file_path ? selected_file.file_path : "Not Set"}</span>
                    </div>
                {/if}
                {#if selected_file.url_path}
                    <div class="row">
                        <span class="preview-text">URL: {selected_file.url_path ? selected_file.url_path : "Not Set"}</span>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
    <br>
    <div class="footer">
        <div class="errors cancel-color">
            {#if current_error}
                <span>{current_error.message}</span>
            {/if}
        </div>
        <div class="user-actions">
            <div class="cancel">
                <MaterialButton on:click={close} value="Cancel"/>
            </div>
            <div class="cancel">
                <MaterialButton on:click={unset} value="Unset File"/>
            </div>
            <div class={selected_file ? "submit" : "disabled"}>
                <MaterialButton on:click={submission} value="Select File"/>
            </div>
        </div>
    </div>
    
</div>
