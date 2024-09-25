<script>
  import { error_stack } from "$lib/store";
  import { MaterialInput } from "linkcube-svelte-components";
  import { createEventDispatcher } from "svelte";
  import ErrorMessage from "./ErrorMessage.svelte";
  import Modal from "./Modal.svelte";
  import NewMatTable from "./NewMatTable.svelte";
  import NewMatTableRow from "./NewMatTableRow.svelte";

  export let all_items = [];
  export let items_type = "DJs";

  let add_item_confirmation = false;
  let search_value = null;
  let current_error = null;
  let displayed_items = all_items;

  error_stack.subscribe((error) => (current_error = error));

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  const enterSearch = () => {
    if (search_value === "") {
      displayed_items = all_items;
    } else {
      displayed_items = all_items.filter((item) =>
        item.name.toUpperCase().includes(search_value.toUpperCase()),
      );
    }
  };

  const dispatchAddItem = (name) => {
    dispatch("item_added", {
      name: name,
    });
    add_item_confirmation = true;
  };
</script>

{#if add_item_confirmation}
  <Modal
    on:close={() => (add_item_confirmation = false)}
    use_submission={false}
    z_index={7}
  >
    {#if current_error}
      <ErrorMessage error={current_error} />
    {:else}
      <span>Event Updated!</span>
    {/if}
  </Modal>
{/if}
<Modal on:close={close} use_submission={false} z_index={5}>
  <div class="column">
    <div class="row">
      <span>Add DJs to Event</span>
      <MaterialInput
        label="Search {items_type}"
        bind:value={search_value}
        on:blur={enterSearch}
        on:enter={enterSearch}
      />
    </div>
    <div class="row">
      <NewMatTable
        items={displayed_items}
        columnSizes={["10%", "90%"]}
        height="500px"
      >
        <div slot="header">
          <NewMatTableRow values={["#", "name"]} type="header" />
        </div>
        <div slot="item" let:item let:index>
          <NewMatTableRow
            values={[`${index + 1}`, item.name]}
            type="click row"
            on:click={() => dispatchAddItem(item.name)}
          />
        </div>
      </NewMatTable>
    </div>
  </div>
</Modal>

<style>
  .column {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    flex-direction: row;
  }
</style>
