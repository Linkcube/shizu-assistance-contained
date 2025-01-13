<script>
  import {
    MaterialButton,
    MaterialInput,
    IconButton,
    MaterialSelect,
  } from "linkcube-svelte-components";
  import Modal from "./Modal.svelte";
  import {
    currentLineupObjects,
    oaDeleteEventDj,
    oaDeleteEventPromo,
    oaPostMoveEventDj,
    oaPostMoveEventPromo,
    oaPostExportEvent,
    oaDeleteEvent,
    error_stack,
    oaFetchSingleEvent,
    oaFetchSingleDj,
    oaFetchSinglePromo,
    oaFetchEvents,
    oaPostSetEventTheme,
    oaFetchSingleTheme,
    oaPostUpdateEventDateTime,
    oaPostAddEventDj,
    oaPostAddEventPromo,
    all_djs,
    all_promos,
  } from "$lib/store.js";
  import { createEventDispatcher } from "svelte";
  import ThemesModal from "./ThemesModal.svelte";
  import NewMatTableRow from "./NewMatTableRow.svelte";
  import NewMatTable from "./NewMatTable.svelte";
  import DjLineupModal from "../shared/DjLineupModal.svelte";
  import PromoLineupModal from "../shared/PromoLineupModal.svelte";
  import ErrorPopup from "./ErrorPopup.svelte";
  import { get } from "svelte/store";
  import ErrorMessage from "./ErrorMessage.svelte";
  import EventChecklistModal from "./EventChecklistModal.svelte";
  import EventAdditemModal from "./EventAddItemModal.svelte";
  import DjModal from "../shared/DjModal.svelte";
  import PromoModal from "../shared/PromoModal.svelte";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  const EDIT_DJ_FAILED = "Edit DJ Failed";
  const EDIT_PROMO_FAILED = "Edit Promo Failed";
  const EDIT_DJ_LINEUP_ORDER_FAILED = "Edit DJ Lineup Order Failed";
  const EDIT_PROMO_LINEUP_ORDER_FAILED = "Edit Promo Lineup Order Failed";
  const REMOVE_DJ_FAILED = "Remove DJ Failed";
  const REMOVE_PROMO_FAILED = "Remove DJ Failed";
  const EXPORT_FAILED = "Export Failed";
  const HOURS = Array.from(Array(24).keys()).map((val) => {
    let hour = val.toString();
    if (hour.length === 1) return `0${hour}`;
    return hour;
  });
  const MINUTES = Array.from(Array(60).keys()).map((val) => {
    let minute = val.toString();
    if (minute.length === 1) return `0${minute}`;
    return minute;
  });

  export let event;

  let show_dj_dialog = false;
  let show_promo_dialog = false;
  let show_add_dj_dialog = false;
  let show_add_promo_dialog = false;
  let show_themes_dialog = false;
  let show_time_dialog = false;
  let last_action = "";
  let show_export_error = false;
  let dragging_index = -1;
  let last_dragover_index = -1;
  let loading = true;
  let lineup_djs = [];
  let lineup_promos = [];
  let current_error = null;
  let theme_data = null;
  let show_event_checklist = false;
  let days_to_event = 0;
  let confirm_delete = false;

  let edit_dj_name = "";
  let edit_dj_is_live = false;
  let edit_dj_vj = "";
  let edit_dj_promise = Promise.resolve();
  let show_dj_edit_dialog = false;
  let show_dj_create_dialog = false;

  let edit_promo_index = -1;
  let edit_promo_name = "";
  let edit_promo_promise = Promise.resolve();
  let show_promo_edit_dialog = false;
  let show_promo_create_dialog = false;

  let input_date = "";
  let input_time_hours = "00";
  let input_time_minutes = "00";
  let all_dj_info = [];
  let all_promo_info = [];

  currentLineupObjects.subscribe((objects) => {
    event = objects;
    lineup_djs = event.djs ? event.djs : [];
    if (event.promos)
      lineup_promos = event.promos.map((promo) => ({ name: promo }));
    if (event.date) {
      input_date = event.date;
      let current_date = new Date();
      let event_date = new Date(`${event.date} EST`);
      current_date.setHours(event_date.getHours());
      current_date.setMinutes(event_date.getMinutes());
      current_date.setSeconds(event_date.getSeconds());
      current_date.setMilliseconds(event_date.getMilliseconds());
      let diffTime = event_date - current_date;
      days_to_event = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      days_to_event = 0;
    }
    if (event.start_time) {
      input_time_hours = event.start_time.split(":")[0];
      input_time_minutes = event.start_time.split(":")[1];
    }
    loading = false;
  });
  error_stack.subscribe((error) => (current_error = error));
  const close_error = () => {
    show_export_error = false;
    show_dj_dialog = false;
    show_promo_dialog = false;
  };

  const getThemeData = async () => {
    theme_data = await oaFetchSingleTheme(event.theme);
  };

  const editDj = (index, name, is_live, vj) => {
    show_export_error = true;
    last_action = EDIT_DJ_FAILED;
    edit_dj_name = name;
    edit_dj_is_live = is_live;
    edit_dj_vj = vj;
    edit_dj_promise = oaFetchSingleDj(name);
    show_dj_dialog = true;
  };

  const editPromo = (index, name) => {
    show_export_error = true;
    last_action = EDIT_PROMO_FAILED;
    edit_promo_index = index;
    edit_promo_name = name;
    edit_promo_promise = oaFetchSinglePromo(name);
    show_promo_dialog = true;
  };

  function handleDragStart(index) {
    dragging_index = index;
  }

  function handleDragOver(index) {
    last_dragover_index = index;
  }

  function handleDjDragEnd() {
    last_action = EDIT_DJ_LINEUP_ORDER_FAILED;
    show_export_error = true;
    // In browser for svelte animation
    if (dragging_index < 0 || last_dragover_index < 0) return;
    if (dragging_index === last_dragover_index) return;
    let moving_value = lineup_djs[dragging_index];
    let target_value = lineup_djs[last_dragover_index];
    lineup_djs.splice(dragging_index, 1);
    if (dragging_index > last_dragover_index) {
      lineup_djs.splice(lineup_djs.indexOf(target_value), 0, moving_value);
    } else {
      lineup_djs.splice(lineup_djs.indexOf(target_value) + 1, 0, moving_value);
    }

    loading = true;
    oaPostMoveEventDj(event.name, dragging_index, last_dragover_index).then(
      (_) => oaFetchSingleEvent(event.name),
    );
    setTimeout(() => {
      if (current_error == null) show_export_error = false;
    }, 500);
  }

  function handlePromoDragEnd() {
    last_action = EDIT_PROMO_LINEUP_ORDER_FAILED;
    show_export_error = true;
    // In browser for svelte animation
    if (dragging_index < 0 || last_dragover_index < 0) return;
    if (dragging_index === last_dragover_index) return;
    let moving_value = lineup_promos[dragging_index];
    let target_value = lineup_promos[last_dragover_index];
    lineup_promos.splice(dragging_index, 1);
    if (dragging_index > last_dragover_index) {
      lineup_promos.splice(
        lineup_promos.indexOf(target_value),
        0,
        moving_value,
      );
    } else {
      lineup_promos.splice(
        lineup_promos.indexOf(target_value) + 1,
        0,
        moving_value,
      );
    }

    loading = true;
    oaPostMoveEventPromo(event.name, dragging_index, last_dragover_index).then(
      (_) => oaFetchSingleEvent(event.name),
    );
    setTimeout(() => {
      if (current_error == null) show_export_error = false;
    }, 500);
  }

  function removeErrorFromLineup() {
    if (last_action == EDIT_DJ_FAILED) {
      console.log(`Lineup: ${event.name}, DJ: ${edit_dj_name}`);
      oaDeleteEventDj(event.name, edit_dj_name).then((_) =>
        oaFetchSingleEvent(event.name),
      );
      last_action = REMOVE_DJ_FAILED;
    } else if (last_action == EDIT_PROMO_FAILED) {
      console.log(`Lineup: ${event.name}, Promo: ${edit_promo_name}`);
      oaDeleteEventPromo(event.name, edit_promo_name).then((_) =>
        oaFetchSingleEvent(event.name),
      );
      last_action = REMOVE_PROMO_FAILED;
    } else {
      console.log(`Unexpected error callback for ${last_action}`);
    }

    show_dj_dialog = false;
    show_promo_dialog = false;
    setTimeout(() => {
      if (current_error == null) show_export_error = false;
    }, 500);
  }

  function exportLineup() {
    last_action = EXPORT_FAILED;
    // show_export_dialog = true;
    show_export_error = true;
    oaPostExportEvent(event.name).then((response) => {
      if (response === true) show_export_error = false;
    });
  }

  function deleteLineup() {
    oaDeleteEvent(event.name)
      .then(() => oaFetchEvents())
      .then(() => close());
  }

  async function changeTheme(user_event) {
    oaPostSetEventTheme(event.name, user_event.detail.theme_name)
      .then((_) => oaFetchSingleEvent(event.name))
      .then((_) => getThemeData());
  }

  function closeThemeDialog() {
    show_themes_dialog = false;
    getThemeData();
  }

  function updateEventTime() {
    show_time_dialog = false;
    oaPostUpdateEventDateTime(
      event.name,
      input_date,
      `${input_time_hours}:${input_time_minutes}`,
    ).then((retval) => {
      currentLineupObjects.set(retval);
    });
  }

  function openAddDjDialogue() {
    all_dj_info = get(all_djs);
    show_add_dj_dialog = true;
  }

  function addDjToEvent(dj_event) {
    oaPostAddEventDj(event.name, dj_event.detail.name).then((_) =>
      oaFetchSingleEvent(event.name),
    );
  }

  function openAddPromoDialogue() {
    all_promo_info = get(all_promos);
    show_add_promo_dialog = true;
  }

  function addPromoToEvent(promo_event) {
    oaPostAddEventPromo(event.name, promo_event.detail.name).then((_) =>
      oaFetchSingleEvent(event.name),
    );
  }

  function editDjEntry() {
    show_dj_dialog = false;
    show_dj_edit_dialog = true;
  }

  async function closeEditDj() {
    show_dj_edit_dialog = false;
    try {
      let dj_data = await oaFetchSingleDj(edit_dj_name);
      edit_dj_promise = Promise.resolve(dj_data);
      show_dj_dialog = true;
    } catch {
      show_dj_dialog = false;
      oaFetchSingleEvent(event.name);
    }
  }

  function editPromoEntry() {
    show_promo_dialog = false;
    show_promo_edit_dialog = true;
  }

  async function closeEditPromo() {
    console.log("Called!!");
    show_promo_edit_dialog = false;
    try {
      let promo_data = await oaFetchSinglePromo(edit_promo_name);
      console.log(promo_data);
      edit_promo_promise = Promise.resolve(promo_data);
      show_promo_dialog = true;
    } catch {
      show_promo_dialog = false;
      oaFetchSingleEvent(event.name);
    }
  }

  function openCreateDjDialog() {
    show_dj_create_dialog = true;
    show_add_dj_dialog = false;
  }

  function closeCreateDjDialog() {
    show_dj_create_dialog = false;
    show_add_dj_dialog = true;
    all_dj_info = get(all_djs);
  }

  function openCreatePromoDialog() {
    show_promo_create_dialog = true;
    show_add_promo_dialog = false;
  }

  function closeCreatePromoDialog() {
    show_promo_create_dialog = false;
    show_add_promo_dialog = true;
    all_promo_info = get(all_promos);
  }

  if (event.theme) getThemeData();
</script>

<!-- {#if current_error && show_export_error}
    {#if last_action && last_action.startsWith("Edit")}
        <ErrorPopup error={current_error} header={last_action} callback="Remove from Event" on:close={close_error} on:callback={removeErrorFromLineup}/>
    {:else}
        <ErrorPopup error={current_error} header={last_action} on:close={close_error} />
    {/if} -->
{#if show_dj_dialog}
  {#await edit_dj_promise then dj_data}
    <DjLineupModal
      name={edit_dj_name}
      is_live={edit_dj_is_live}
      current_lineup={event.name}
      vj={edit_dj_vj}
      {dj_data}
      on:close={() => (show_dj_dialog = false)}
      on:edit={editDjEntry}
    />
  {/await}
{:else if show_dj_edit_dialog}
  {#await edit_dj_promise then dj_data}
    <DjModal index={0} name={edit_dj_name} {dj_data} on:close={closeEditDj} />
  {/await}
{:else if show_promo_dialog}
  {#await edit_promo_promise then promo_data}
    <PromoLineupModal
      index={edit_promo_index}
      name={edit_promo_name}
      current_lineup={event.name}
      {promo_data}
      on:close={() => (show_promo_dialog = false)}
      on:edit={editPromoEntry}
    />
  {/await}
{:else if show_promo_edit_dialog}
  {#await edit_promo_promise then promo_data}
    <PromoModal
      index={edit_promo_index}
      name={edit_promo_name}
      {promo_data}
      on:close={closeEditPromo}
    />
  {/await}
{:else if show_themes_dialog}
  <ThemesModal
    selected_theme_name={event.theme}
    on:close={closeThemeDialog}
    on:submission={changeTheme}
  />
{:else if show_time_dialog}
  <Modal
    on:close={() => (show_time_dialog = false)}
    on:submission={updateEventTime}
    z_index={5}
  >
    <div class="column">
      <span class="row">Event Date and Start Time</span>
      <div class="row date-time">
        <span class="margin-right">Date: </span>
        <input type="date" bind:value={input_date} />
      </div>
      <br />
      <div class="row date-time">
        <span class="align margin-right">Start Time (Eastern Time): </span>
        <MaterialSelect label="Hour" bind:value={input_time_hours}>
          {#each HOURS as hour}
            <option value={hour}>{hour}</option>
          {/each}
        </MaterialSelect>
        <div class="margin-left margin-right" />
        <MaterialSelect label="Minute" bind:value={input_time_minutes}>
          {#each MINUTES as minute}
            <option value={minute}>{minute}</option>
          {/each}
        </MaterialSelect>
      </div>
    </div>
  </Modal>
{:else if show_event_checklist}
  <EventChecklistModal
    {days_to_event}
    on:close={() => (show_event_checklist = false)}
  />
{:else if show_add_dj_dialog}
  <EventAdditemModal
    items_type="DJs"
    all_items={all_dj_info}
    on:item_added={addDjToEvent}
    on:close={() => (show_add_dj_dialog = false)}
    on:createNew={openCreateDjDialog}
  />
{:else if show_dj_create_dialog}
  <DjModal index={-1} dj_data={{}} on:close={closeCreateDjDialog} />
{:else if show_add_promo_dialog}
  <EventAdditemModal
    items_type="Promos"
    all_items={all_promo_info}
    on:item_added={addPromoToEvent}
    on:close={() => (show_add_promo_dialog = false)}
    on:createNew={openCreatePromoDialog}
  />
{:else if show_promo_create_dialog}
  <PromoModal index={-1} promo_data={{}} on:close={closeCreatePromoDialog} />
{:else if confirm_delete}
  <Modal
    on:close={() => (confirm_delete = false)}
    on:submission={deleteLineup}
    z_index={5}
  >
    <div class="central-column">
      <h2 class="row">Delete: {event.name}</h2>
      <span class="row"
        >Are you sure you want to permanently delete this event?</span
      >
    </div>
  </Modal>
{/if}

<Modal on:close={close} use_submission={false} max_width="80%">
  <div class="column">
    <div class="header row">
      <span>Event: {event.name}</span>
      <div class="icon-container row">
        <IconButton
          icon="calendar_month"
          title="Event Time"
          on:click={() => (show_time_dialog = true)}
        />
        <IconButton
          icon="wallpaper"
          title="Event Theme"
          on:click={() => (show_themes_dialog = true)}
        />
        <IconButton
          icon="check"
          title="Event Checklist"
          on:click={() => (show_event_checklist = true)}
        />
        <IconButton
          icon="download"
          title="Export Event"
          on:click={exportLineup}
        />
        <div class="delete">
          <IconButton
            icon="delete_forever"
            title="Delete Event"
            on:click={() => (confirm_delete = true)}
          />
        </div>
      </div>
    </div>
    <div class="content row">
      <div class="djs column">
        <div class="header row">
          <div class="title">
            <span>DJs</span>
          </div>
          <IconButton
            icon="add"
            title="Add DJs to Event"
            on:click={openAddDjDialogue}
          />
        </div>
        <div class="row">
          <NewMatTable
            items={lineup_djs}
            columnSizes={["10%", "70%", "20%"]}
            height="500px"
          >
            <div slot="header">
              <NewMatTableRow values={["#", "Name", "Is Live"]} type="header" />
            </div>
            <div slot="item" let:item let:index>
              <NewMatTableRow
                values={[`${index + 1}`, item.name, item.is_live]}
                type="click row draggable"
                on:click={() => editDj(index, item.name, item.is_live, item.vj)}
                on:dragstart={() => handleDragStart(index)}
                on:dragover={() => handleDragOver(index)}
                on:dragend={() => handleDjDragEnd()}
              />
            </div>
          </NewMatTable>
        </div>
      </div>
      <div class="promos column">
        <div class="header row">
          <div class="title">
            <span>Promos</span>
          </div>
          <IconButton
            icon="add"
            title="Add Promos to Event"
            on:click={openAddPromoDialogue}
          />
        </div>
        <div class="row">
          <NewMatTable
            items={lineup_promos}
            columnSizes={["10%", "90%"]}
            height="500px"
          >
            <div slot="header">
              <NewMatTableRow values={["#", "name"]} type="header" />
            </div>
            <div slot="item" let:item let:index>
              <NewMatTableRow
                values={[`${index + 1}`, item.name]}
                type="click row draggable"
                on:click={() => editPromo(index, item.name)}
                on:dragstart={() => handleDragStart(index)}
                on:dragover={() => handleDragOver(index)}
                on:dragend={() => handlePromoDragEnd()}
              />
            </div>
          </NewMatTable>
        </div>
      </div>
      <div class="info column">
        <div class="title row">
          <span>Event Info</span>
        </div>
        {#if theme_data}
          <div class="row">
            <span>Theme: {theme_data.name}</span>
          </div>
          <div class="row margin-left">
            {#if theme_data.overlay_file}
              <span class="material-icons large-icon check-color"
                >check_circle</span
              >
            {:else}
              <span class="material-icons large-icon cancel-color">cancel</span>
            {/if}
            <span>Overlay </span>
          </div>
          <div class="row margin-left">
            {#if theme_data.starting_file}
              <span class="material-icons large-icon check-color"
                >check_circle</span
              >
            {:else}
              <span class="material-icons large-icon cancel-color">cancel</span>
            {/if}
            <span>Starting </span>
          </div>
          <div class="row margin-left">
            {#if theme_data.ending_file}
              <span class="material-icons large-icon check-color"
                >check_circle</span
              >
            {:else}
              <span class="material-icons large-icon cancel-color">cancel</span>
            {/if}
            <span>Ending </span>
          </div>
          <div class="row margin-left">
            {#if theme_data.target_video_width !== null && theme_data.target_video_height !== null && theme_data.video_offset_x !== null && theme_data.video_offset_y !== null}
              <span class="material-icons large-icon check-color"
                >check_circle</span
              >
            {:else}
              <span class="material-icons large-icon cancel-color">cancel</span>
            {/if}
            <span>Video Settings </span>
          </div>
          <div class="row margin-left">
            {#if theme_data.chat_width !== null && theme_data.chat_height !== null && theme_data.chat_offset_x !== null && theme_data.chat_offset_y !== null}
              <span class="material-icons large-icon check-color"
                >check_circle</span
              >
            {:else}
              <span class="material-icons large-icon cancel-color">cancel</span>
            {/if}
            <span>Chat Settings </span>
          </div>
        {:else}
          <div class="row">
            <span>Theme: No Theme Set</span>
          </div>
        {/if}
        <div class="row">
          <span>Date: {event.date ? event.date : "Not Set"}</span>
        </div>
        <div class="row">
          <span
            >Start Time: {event.start_time ? event.start_time : "Not Set"}</span
          >
        </div>
      </div>
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

  .header {
    justify-content: space-between;
  }

  .icon-container {
    margin-top: 10px;
  }

  .delete {
    --secondary-text-color: var(--delete-color, red);
  }

  .djs {
    width: 35%;
    margin: 10px;
  }

  .promos {
    width: 35%;
    margin: 10px;
  }

  .title {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .info {
    width: 30%;
    margin: 10px;
  }

  .check-color {
    color: var(--primary-color, lightblue);
  }

  .cancel-color {
    color: var(--delete-color, red);
  }

  .date-time {
    margin-top: 10px;
  }

  .align {
    align-content: center;
  }

  .margin-right {
    margin-right: 8px;
  }

  .margin-left {
    margin-left: 8px;
  }
</style>
