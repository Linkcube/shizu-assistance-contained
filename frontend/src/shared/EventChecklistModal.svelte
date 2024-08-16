<script>
    import Modal from './Modal.svelte';
    import { createEventDispatcher } from 'svelte';

    export let days_to_event = 0;

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');
</script>

<style>
    .column {
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .title {
        justify-content: center;
    }

    .check-color {
        color: var(--primary-color, lightblue);
    }

    .cancel-color {
        color: var(--delete-color, red);
    }
</style>


<Modal on:close={close} use_submission={false} z_index={5}>
    <div class="column">
        <div class="title row">
            <h2>Event Checklist ({days_to_event} Days Remaining)</h2>
        </div>
        <div class={days_to_event >= 21 ? "cancel-color" : "check-color"}>
            <h3 class="row">3 Weeks Before</h3>
            <span class="row"> - Flyer complete and released</span>
        </div>
        <div class={days_to_event > 20 ? "" : days_to_event >= 14 ? "cancel-color" : "check-color"}>
            <h3 class="row">2 Weeks Before</h3>
            <span class="row"> - Lineup Complete</span>
            <span class="row"> - If outsourcing VJing, set due to VJ 2 weeks before unless other arrangements made</span>
            <span class="row"> - Update name and images of performers on website</span>
        </div>
        <div class={days_to_event > 13 ? "" : days_to_event >= 7 ? "cancel-color" : "check-color"}>
            <h3 class="row">1 Week Before</h3>
            <span class="row"> - Scheduled soundchecks with live performers</span>
        </div>
        <div class={days_to_event > 6 ? "" : days_to_event >= 3 ? "cancel-color" : "check-color"}>
            <h3 class="row">3 Days Before</h3>
            <span class="row"> - All sets due</span>
        </div>
        <div class={days_to_event > 3 ? "" : days_to_event >= 1 ? "cancel-color" : "check-color"}>
            <h3 class="row">Day Before the Event</h3>
            <span class="row"> - All OBS scenes generated and populated</span>
            <span class="row"> - Change name of stream</span>
            <span class="row"> - All soundchecks complete unless other arrangements made</span>
            <span class="row"> - Check audio levels on pre-recorded sets to ensure not redlining</span>
            <span class="row"> - Check OBS scene alignments</span>
            <span class="row"> - Add Seasonal Transition Stinger</span>
        </div>
        <div class={days_to_event > 0 ? "" : days_to_event === 0 ? "cancel-color" : "check-color"}>
            <h3 class="row">Day of the Event</h3>
            <span class="row"> - Tweet/Insta Post an hour before the show</span>
            <span class="row"> - Commence streaming T-10 minutes prior</span>
        </div>
    </div>
</Modal>