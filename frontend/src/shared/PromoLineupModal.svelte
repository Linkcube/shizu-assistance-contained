<script>
  import { IconButton } from "linkcube-svelte-components";
  import Modal from "./Modal.svelte";
  import { oaFetchSingleEvent, oaDeleteEventPromo } from "$lib/store.js";
  import { createEventDispatcher } from "svelte";

  export let index = 0;
  export let current_lineup = "";
  export let name = "";
  export let promo_data;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  let error_on_init = false;
  let file_name = promo_data.promo_file;

  export const removePromo = () => {
    oaDeleteEventPromo(current_lineup, name).then((_) =>
      oaFetchSingleEvent(current_lineup),
    );
    close();
  };
</script>

{#if !error_on_init}
  <Modal on:close={close} use_submission={false} z_index={5}>
    <div class="central-column">
      <div class="row">
        <p>Name: {name}</p>
        <div class="delete">
          <IconButton
            icon="delete"
            title="Remove from lineup"
            on:click={removePromo}
          />
        </div>
      </div>
      <div class="row">
        <p>Promo File: {file_name ? file_name : "Not Set"}</p>
      </div>
    </div>
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
</style>
