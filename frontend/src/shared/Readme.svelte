<script>
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
</script>

<Modal on:close={close} use_submission={false}>
  <div class="central-column">
    <div class="row header">
      <span>ReadMe</span>
    </div>
    <div class="row text">
      <span
        >Welcome to Shizu's Assistance! This program is meant to help an
        orginzation manage a ledger of all DJs they have worked with as well as
        create event lineups to be exported to OBS.</span
      >
    </div>
    <div class="row text">
      <span
        >You should see a two tables on the main screen, the left one for your
        ledger and the right for events. Additionally there is a drop-down menu
        accessible by clicking on the icon in the top right of the screen.</span
      >
    </div>
    <div class="row text">
      <span
        >New DJ and promotional entries can be added at the top of the ledger
        (left) table, which can be toggled between which type of entry you wish
        to view. Once an entry has been created, it can be edited by clicking on
        the table row.</span
      >
    </div>
    <div class="row text">
      <span
        >Note: When deleting an entry, the DJ/promo will be removed from all
        events as well.</span
      >
    </div>
    <div class="row text">
      <span
        >Events can be created at the top level of the events table, and clicked
        into once they're initialized. On a selected events entry, entries can
        be added by search and re-arranged by drag-and-dropping an entry to the
        desired location. Additionally events have the ability to export a file
        for use with the OBS script.</span
      >
    </div>
    <div class="row text">
      <span
        >Make sure to read through the checklist for an example runthrough of
        this program.</span
      >
    </div>
    <div class="row text">
      <span
        >There is also a menu option to change the web-app's styling, feel free
        to mess around with it.</span
      >
    </div>
    <div class="row text">
      <span>[WARNING: HERE BE DRAGONS]</span>
    </div>
    <div class="row text">
      <span
        >All configs are defined in the .env file in the top of
        shizu-assistance-contained</span
      >
    </div>
  </div>
</Modal>

<style>
  .central-column {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
  }

  .header {
    font-size: x-large;
    margin-bottom: 10px;
  }

  .text {
    line-height: 25px;
  }
</style>
