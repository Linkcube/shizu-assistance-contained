<script>
  import { MaterialInput } from "linkcube-svelte-components";
  import Modal from "./Modal.svelte";
  import { oaPostCreateEvent, error_stack, oaFetchEvents } from "$lib/store.js";
  import { createEventDispatcher } from "svelte";
  import ErrorMessage from "./ErrorMessage.svelte";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  let name = "";
  let current_error = null;
  let show_save_message = false;

  error_stack.subscribe((error) => {
    current_error = error;
  });

  function createLineup() {
    show_save_message = true;
    current_error = null;
    oaPostCreateEvent(name);
    setTimeout(() => {
      show_save_message = false;
      if (current_error == null) {
        oaFetchEvents();
        close();
      }
    }, 500);
  }
</script>

<Modal on:close={close} on:submission={createLineup}>
  <MaterialInput label="Event Name" bind:value={name} />
  {#if current_error}
    <ErrorMessage error={current_error} />
  {/if}
  {#if show_save_message && !current_error}
    <div class="row saving">
      <p>Saving...</p>
    </div>
  {/if}
</Modal>

<style>
  .saving {
    color: var(--secondary-text-color, red);
  }
</style>
