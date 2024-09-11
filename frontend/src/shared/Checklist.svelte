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
            <span>Checklist</span>
        </div>
        <div class="row text">
            <span>The goal of this checklist is to run you through all steps when adding new entries and creating an event to be exported to OBS.</span>
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
        <div class="row text">
            <span>When setting a logo/recording/promotion, you will be shown a browser of existing defined files, once a new file is defined it can either be set to use a local file or url.</span>
        </div>
        <div class="row step">
            <span>3. Create Your Event</span>
        </div>
        <div class="row text">
            <span>On the top level of the events (right) table, there is a button to create new events. Make sure to not be too undescriptive with the name, include year/month for reoccuring events.</span>
        </div>
        <div class="row step">
            <span>4. Setup your event</span>
        </div>
        <div class="row text">
            <span>You should now be able to click into your event, in the new popup you can edit event properties such as dj/promotion/time/theme. DJs and promotions that have been added can  be rearranged to your specific order with drag-and-drop. For DJ entries, each one can be set to either Live or Not Live depending on if you are using the recording on the DJ entry or their stream data.</span>
        </div>
        <div class="row text">
            <span>If you have a specific theme you want to use, it an be configuring by clicking the theme button in the event popup. Themes have an overlay, starting, and ending file that can be configuring in the same way logos/recordings are set.</span>
        </div>
        <div class="row text">
            <span>Themes also have target video dimensions, which is the resolution to scale a video to. Video offset are measured from the top left of the screen. Similar settings exist for setting a chat window, which uses the url link provided in the .env file.</span>
        </div>
        <div class="row step">
            <span>5. Export Your Event</span>
        </div>
        <div class="row text">
            <span>While still in the event popup, click on the download button to export your event. This will use the directory defined in .env for /exports. If any files were set only with a url, they will be downloaded and point to the local file in this step. (no progress bar atm, you can check the backend docker container for logging)</span>
        </div>
        <div class="row step">
            <span>6. Import to OBS</span>
        </div>
        <div class="row text">
            <span>Make sure to clear out any old djs/promo scenes, as well as overlay/starting/ending if a theme is set. If you intend to use macros delete all macros set in advanced scene switcher.</span>
        </div>
        <div class="row text">
            <span>In OBS scripts, use "obs_hijack_script.py" to import the file created in the previous step (make sure to check translate to host, unless obs is running in docker [not yet implemented]), you should now have new scenes for each of your DJs as well as a playlist for the promotions.</span>
        </div>
        <div class="row text">
            <span>If using macros, make sure to have that checked in the script, and then in advanced scene switcher import the new config (same name as the event export, and same directory).</span>
        </div>
    </div>
</Modal>