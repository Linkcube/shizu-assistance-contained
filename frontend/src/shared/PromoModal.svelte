<script>
  import {
    MaterialButton,
    MaterialInput,
    IconButton,
    MaterialSelect,
  } from "linkcube-svelte-components";
  import Modal from "./Modal.svelte";
  import {
    currentLineup,
    all_events,
    oaPostCreatePromo,
    oaPostUpdatePromo,
    oaDeletePromo,
    oaPostAddEventPromo,
    RECORDING_TYPE,
    error_stack,
    oaFetchPromos,
  } from "$lib/store.js";
  import { createEventDispatcher } from "svelte";
  import { get } from "svelte/store";
  import ErrorMessage from "./ErrorMessage.svelte";
  import FileObjectsDialog from "./FileObjectsDialog.svelte";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  export let index = -1;
  export let name = "";
  export let promo_data;

  const current_lineup = get(currentLineup);
  const lineup_names = get(all_events).map((event) => event.name);
  let target_lineup = lineup_names[0];

  let file_name = promo_data.promo_file;
  let show_file_dialog = false;
  let current_error = null;
  let show_save_message = false;

  error_stack.subscribe((error) => (current_error = error));

  function savePromo() {
    if (index < 0) {
      oaPostCreatePromo(name, file_name).then((_) => oaFetchPromos());
    } else {
      oaPostUpdatePromo(name, file_name).then((_) => oaFetchPromos());
    }
    setTimeout(() => {
      show_save_message = false;
      if (current_error == null) {
        oaFetchPromos();
        close();
      }
    }, 500);
  }

  function selectFile() {
    show_file_dialog = true;
  }

  function updateFile(event) {
    file_name = event.detail.file_name;
  }

  function removePromo() {
    oaDeletePromo(name).then((_) => oaFetchPromos());
    close();
  }

  function addToLineup() {
    oaPostAddEventPromo(target_lineup, name);
  }
</script>

{#if show_file_dialog}
  <FileObjectsDialog
    file_type={RECORDING_TYPE}
    selected_file_name={file_name}
    on:close={() => (show_file_dialog = false)}
    on:submission={updateFile}
  />
{:else}
  <Modal on:close={close} on:submission={savePromo}>
    <div class="central-column">
      <div class="row">
        <MaterialInput label="Promo Name" bind:value={name} />
        {#if index >= 0}
          <div class="delete">
            <IconButton
              icon="delete_forever"
              title="Delete Promo"
              on:click={removePromo}
            />
          </div>
        {/if}
      </div>
      <div class="row">
        <div class="icon-container">
          <IconButton
            icon="video_file"
            title="Select File"
            on:click={selectFile}
          />
        </div>
        <p>{file_name}</p>
      </div>
      {#if index >= 0 && lineup_names.length != 0}
        <div class="row">
          <MaterialButton value="Add to Lineup" on:click={addToLineup} />
          <MaterialSelect label="Lineups" bind:value={target_lineup}>
            {#each lineup_names as name}
              <option value={name}>{name}</option>
            {/each}
          </MaterialSelect>
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
