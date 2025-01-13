<script>
  import {
    IconButton,
    MaterialSelect,
    MaterialInput,
  } from "linkcube-svelte-components";
  import Modal from "./Modal.svelte";
  import {
    oaFetchSingleEvent,
    oaPostUpdateEventDj,
    oaDeleteEventDj,
  } from "$lib/store.js";
  import { createEventDispatcher } from "svelte";

  export let current_lineup = "";
  export let name = "";
  export let is_live = false;
  export let vj = "";
  export let dj_data;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  const rtmp_conversion = {
    "us-west": "US West",
    "us-east": "US East",
    jp: "Japan",
    europe: "Europe",
  };
  let logo_name = dj_data.logo;
  let recording_name = dj_data.recording;
  let rtmp_server = dj_data.rtmp_server;
  let stream_key = dj_data.rtmp_key;
  let error_on_init = false;

  if (dj_data.rtmp_server) {
    rtmp_server = rtmp_conversion[dj_data.rtmp_server];
  }
  stream_key = dj_data.rtmp_key;

  export const removeDj = () => {
    oaDeleteEventDj(current_lineup, name).then((_) =>
      oaFetchSingleEvent(current_lineup),
    );
    close();
  };

  export const saveDj = () => {
    oaPostUpdateEventDj(current_lineup, dj_data.name, is_live, vj).then((_) =>
      oaFetchSingleEvent(current_lineup),
    );
    close();
  };

  const editDj = () => {
    dispatch("edit");
  };
</script>

{#if !error_on_init}
  <Modal on:close={close} on:submission={saveDj} z_index={5}>
    <div class="central-column">
      <div class="row margin-left">
        <p>Name: {name}</p>
        <div class="edit">
          <IconButton icon="edit" title="Edit DJ Values" on:click={editDj} />
        </div>
        <div class="delete">
          <IconButton
            icon="delete"
            title="Remove from lineup"
            on:click={removeDj}
          />
        </div>
      </div>
      <div class="row margin-left">
        <p>Logo: {logo_name ? logo_name : "Not Set"}</p>
      </div>
      <div class="row margin-left">
        <p>Recording: {recording_name ? recording_name : "Not Set"}</p>
      </div>
      <div class="row margin-left">
        <p>RTMP Server: {rtmp_server ? rtmp_server : "Not Set"}</p>
      </div>
      <div class="row margin-left">
        <p>Stream Key: {stream_key ? stream_key : "Not Set"}</p>
      </div>
      <div class="row margin-left margin-top">
        <MaterialSelect label="Is Live" bind:value={is_live}>
          <option value={false}>False</option>
          <option value={true}>True</option>
        </MaterialSelect>
      </div>
      <div class="row">
        <MaterialInput label="VJ Name" bind:value={vj} />
      </div>
    </div>
  </Modal>
{/if}

<style>
  p {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .central-column {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    flex-direction: row;
  }

  .delete {
    --secondary-text-color: var(--delete-color, red);
  }

  .edit {
    margin-left: auto;
    --secondary-text-color: var(--primary-color, lightblue);
  }

  .margin-left {
    margin-left: 8px;
  }

  .margin-top {
    margin-top: 8px;
  }
</style>
