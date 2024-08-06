<script>
    import Modal from './Modal.svelte';
    import {
        IconButton
    } from 'linkcube-svelte-components';
    import { 
        fetchUpdateSettings,
        fetchGetFilePath,
        fetchGetDirPath,
        toFileName,
        fetchSettings,
        fetchLedger,
        fetchLineups,
        settings,

        currentLineup

    } from '$lib/store.js';
    import { createEventDispatcher } from 'svelte';
    import { get } from 'svelte/store';

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    const original_settings = get(settings);

    let ledger_path = original_settings.ledger_path;
    let ledger_name = toFileName(ledger_path);
    let lineups_dir = original_settings.lineups_dir;
    let lineups_dir_name = toFileName(lineups_dir);
    let selecting_file = false;

    function updateSettings() {
        fetchUpdateSettings(ledger_path, lineups_dir)
        .then(() => fetchSettings())
        .then(() => fetchLedger())
        .then(() => fetchLineups())
        .then(() => currentLineup.set(null))
        .then(() => close());
    }

    function selectLedger() {
        if (selecting_file) return;
        
        selecting_file = true;
        fetchGetFilePath().then(promise => {
            Promise.resolve(promise).then(response => {
                if (response.hasOwnProperty('data')) {
                    ledger_name = response.data.getFilePath[0];
                    ledger_path = response.data.getFilePath[1];
                }
            }).catch(() => console.log("Dialog closed"))
            .finally(() => selecting_file = false)
        });
    }

    function selectLineupsDir() {
        if (selecting_file) return;
        
        selecting_file = true;
        fetchGetDirPath().then(promise => {
            Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty('data')) {
                selecting_file = false;
                lineups_dir = response.data.getDirPath;
                lineups_dir_name = toFileName(lineups_dir);
            }
        }).catch(() => console.log("Dialog closed"))
            .finally(() => selecting_file = false);
        })
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

    .icon-container {
        margin-top: 20px;
        margin-right: 5px;
    }
</style>


<Modal on:close={close} on:submission={updateSettings}>
    <div class="central-column">
        <div class="row">
            <span>Update Settings</span>
        </div>
        <div class="row">
            <div class="icon-container">
                <IconButton icon=note_add title="Select Ledger File" on:click={selectLedger} />
            </div>
            <p>Ledger File: {ledger_name}</p>
        </div>
        <div class="row">
            <div class="icon-container">
                <IconButton icon=folder title="Select Lineups Directory" on:click={selectLineupsDir} />
            </div>
            <p>Ledger Directory: {lineups_dir_name}</p>
        </div>
        <div class="row">
            <p>This uses a legacy file selection, on certain systems the dialog may appear behind other windows.</p>
        </div>
    </div>
</Modal>