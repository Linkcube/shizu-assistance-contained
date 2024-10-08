<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import { MaterialButton } from "linkcube-svelte-components";
  import { error_stack } from "$lib/store.js";

  export let use_submission = true;
  export let max_width = "38em";
  export let z_index = 3;

  const z_index_modal = z_index + 1;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
  const submission = () => {
    dispatch("submission");
  };

  /**
   * @type {HTMLDivElement}
   */
  let modal;

  const handle_keydown = (e) => {
    if (e.key === "Escape") {
      close();
      return;
    }

    if (e.key === "Tab") {
      // trap focus
      const nodes = modal.querySelectorAll("*");
      const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

      let index = tabbable.indexOf(document.activeElement);
      if (index === -1 && e.shiftKey) index = 0;

      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      e.preventDefault();
    }
  };

  const previously_focused =
    typeof document !== "undefined" && document.activeElement;

  if (previously_focused) {
    onDestroy(() => {
      error_stack.set(null);
      previously_focused.focus();
    });
  }
</script>

<svelte:window on:keydown={handle_keydown} />

<div
  class="modal-background"
  style="--z_index_bg:{z_index};"
  on:click={close}
></div>

<div
  class="modal"
  role="dialog"
  aria-modal="true"
  bind:this={modal}
  style="--max_width:{max_width};--z_index_modal:{z_index_modal};"
>
  <slot name="header"></slot>
  <br />
  <slot></slot>
  <br />
  <div class="user-actions">
    {#if use_submission}
      <div class="cancel">
        <MaterialButton on:click={close} value="Cancel" />
      </div>
      <div class="submit">
        <MaterialButton on:click={submission} value="Accept" />
      </div>
    {:else}
      <div class="submit">
        <MaterialButton on:click={close} value="Close" />
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: var(--z_index_bg);
  }

  .modal {
    position: fixed;
    left: 50%;
    top: 50%;
    width: calc(100vw - 4em);
    max-width: var(--max_width);
    max-height: 70%;
    overflow: auto;
    transform: translate(-50%, -50%);
    padding: 1em;
    border-radius: 0.2em;
    background: var(--background-color, white);
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.3),
      0 6px 20px 0 rgba(0, 0, 0, 0.29);
    z-index: var(--z_index_modal);
  }

  .user-actions {
    display: flex;
    justify-content: flex-end;
    line-height: 40px;
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
</style>
