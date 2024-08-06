<script>
    import Modal from './Modal.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');
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

    .header {
        font-size: x-large;
        margin-bottom: 10px;
    }

    .step {
        font-size: larger;
        margin-top: 10px;
        margin-bottom: 5px;
    }

    .text {
        line-height: 25px;
    }
</style>

<Modal on:close={close} use_submission={false}>
    <div class="central-column">
        <div class="row header">
            <span>ReadMe</span>
        </div>
        <div class="row text">
            <span>The goal of this checklist is to run you through all steps when adding new entries and creating a lineup to be exported to OBS.</span>
        </div>
        <div class="row step">
            <span>0. First Time Setup</span>
        </div>
        <div class="row text">
            <span>Modify permissions.json to have the directories you need for logos/recording/exporting. If you are on windows don't forget to replace your '\' with '\\'</span>
        </div>
        <div class="row text">
            <span>Ensure that you have the ledger and lineups directory set where you want before working on this. Unlike the python script this shouldn't require constant loading/saving.</span>
        </div>
        <div class="row step">
            <span>1. Adding New Entries</span>
        </div>
        <div class="row text">
            <span>Add any new DJs/Promos to your ledger that aren't already there, to quickly check if they are you can use the search bar.</span>
        </div>
        <div class="row step">
            <span>2. Updating Existing Entries</span>
        </div>
        <div class="row text">
            <span>Update DJs with logos or recordings specific to the event, as well as any live data that may have changed.</span>
        </div>
        <div class="row step">
            <span>3. Create Your Lineup</span>
        </div>
        <div class="row text">
            <span>On the top level of the lineups table, there is a button to create new lineups. Make sure to not be too undescriptive with the name, include year/month for reoccuring events.</span>
        </div>
        <div class="row step">
            <span>4. Add Your Entries</span>
        </div>
        <div class="row text">
            <span>You should now be able to click into your lineup, while not required it does make it easier when adding entries. In your ledger, click on the DJs/Promos you wish to add, if you don't have a current linup there will be a dropdown to select from. In the lineup table you can rearrange entries to your specific order. For DJ entries, each one can be set to either Live or Not Live depending on if you are using the recording on the DJ entry or their stream data.</span>
        </div>
        <div class="row step">
            <span>5. Export Your Lineup</span>
        </div>
        <div class="row text">
            <span>While still in the lineup table, click on the download button to select a directory to export your file. Don't use your existing lineups directory from the old python program as these files contain different data and could overwrite eachother.</span>
        </div>
        <div class="row step">
            <span>6. Import to OBS</span>
        </div>
        <div class="row text">
            <span>In OBS scripts, use "obs_hijack_script.py" to import the file created in the previous step, you should now have new scenes for each of your DJs as well as a playlist for the promotions.</span>
        </div>
    </div>
</Modal>