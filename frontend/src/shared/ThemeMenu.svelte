<script>
  import { get } from "svelte/store";
  import {
    IconButton,
    MaterialTable,
    MaterialTableRow,
    MaterialSelect,
    MaterialInput,
  } from "linkcube-svelte-components";
  import Modal from "./Modal.svelte";
  import {
    currentThemeIndex,
    currentTheme,
    oaFetchAppThemes,
    oaPostCreateAppTheme,
    oaPostUpdateAppTheme,
    oaDeleteAppTheme,
    themes,
  } from "$lib/store.js";
  import { createEventDispatcher } from "svelte";

  let styleEdit = false;
  let editIndex = 0;
  let editThemeStyle = {
    title: "",
    style: {},
  };
  let themes_data = [];
  let adding_theme = false;
  let new_theme_name = "";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  function selectStyle(index) {
    editIndex = index;
    editThemeStyle.name = themes_data[editIndex].name;
    Object.assign(editThemeStyle.style, themes_data[editIndex].style);
    styleEdit = true;
  }

  async function changeStyle() {
    let oldIndex = get(currentThemeIndex);
    currentThemeIndex.set(-1);
    updateTheme(editThemeStyle.style);
    await oaPostUpdateAppTheme(editThemeStyle);
    oaFetchAppThemes();
    currentThemeIndex.set(oldIndex);
    styleEdit = false;
  }

  async function addTheme() {
    await oaPostCreateAppTheme(new_theme_name);
    oaFetchAppThemes();
    adding_theme = false;
  }

  async function deleteStyle() {
    let old_name = get(currentTheme).name;
    currentThemeIndex.set(0);
    await oaDeleteAppTheme(editThemeStyle.name);
    await oaFetchAppThemes();
    let prev_theme = get(themes).findIndex((theme) => theme.name === old_name);
    if (prev_theme >= 0) {
      currentThemeIndex.set(prev_theme);
    }
    styleEdit = false;
  }

  function updateTheme(style) {
    currentTheme.set({
      "primary-color": style.primaryColor,
      "secondary-color": style.secondaryColor,
      "background-color": style.backgroundColor,
      "primary-text-color": style.primaryTextColor,
      "secondary-text-color": style.secondaryTextColor,
      "highlight-color": style.highlightColor,
      "focus-color": style.focusColor,
      "active-color": style.activeColor,
      "delete-color": style.deleteColor,
      "cancel-text-color": style.cancelTextColor,
      "cancel-background-color": style.cancelBackgroundColor,
      "submit-text-color": style.submitTextColor,
      "submit-background-color": style.submitBackgroundColor,
    });
  }

  themes.subscribe((value) => (themes_data = value));

  oaFetchAppThemes();
</script>

<div class="modal">
  {#if styleEdit}
    <Modal on:close={() => (styleEdit = false)} on:submission={changeStyle}>
      <div class="top-row">
        <!-- <MaterialInput label="Theme Title" bind:value={editThemeStyle.title}/> -->
        <h2>{editThemeStyle.name}</h2>
        {#if editIndex != 0}
          <div class="delete">
            <IconButton
              icon="delete_forever"
              title="Delete Style"
              on:click={deleteStyle}
            />
          </div>
        {/if}
      </div>
      <div class="bottom-row">
        <div class="bottom-split">
          <div class="color-edit">
            <label>Primary Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.primaryColor}
            />
          </div>
          <div class="color-edit">
            <label>Secondary Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.secondaryColor}
            />
          </div>
          <div class="color-edit">
            <label>Background Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.backgroundColor}
            />
          </div>
          <div class="color-edit">
            <label>Primary Text Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.primaryTextColor}
            />
          </div>
          <div class="color-edit">
            <label>Secondary Text Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.secondaryTextColor}
            />
          </div>
          <div class="color-edit">
            <label>Highlight Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.highlightColor}
            />
          </div>
        </div>
        <div class="bottom-split">
          <div class="color-edit">
            <label>Focus Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.focusColor}
            />
          </div>
          <div class="color-edit">
            <label>Active Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.activeColor}
            />
          </div>
          <div class="color-edit">
            <label>Delete Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.deleteColor}
            />
          </div>
          <div class="color-edit">
            <label>Cancel Text Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.cancelTextColor}
            />
          </div>
          <div class="color-edit">
            <label>Cancel Background Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.cancelBackgroundColor}
            />
          </div>
          <div class="color-edit">
            <label>Submit Text Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.submitTextColor}
            />
          </div>
          <div class="color-edit">
            <label>Submit Background Color </label>
            <input
              type="color"
              class="color-input"
              bind:value={editThemeStyle.style.submitBackgroundColor}
            />
          </div>
        </div>
      </div>
    </Modal>
  {:else if adding_theme}
    <Modal
      on:close={() => (adding_theme = false)}
      on:submission={addTheme}
      z_index={5}
    >
      <div class="central-column">
        <div class="row">
          <MaterialInput label="Theme Name" bind:value={new_theme_name} />
        </div>
      </div>
    </Modal>
  {:else}
    <Modal on:close={() => close()} use_submission={false}>
      <div class="top-row">
        <div class="left-side">
          <span>Style Configuration</span>
          <IconButton
            icon="add_box"
            title="Add Style"
            on:click={() => (adding_theme = true)}
          />
        </div>
        <div class="right-side">
          <MaterialSelect label="Active Theme" bind:value={$currentThemeIndex}>
            {#each themes_data as theme, index}
              <option value={index}>{theme.name}</option>
            {/each}
          </MaterialSelect>
        </div>
      </div>
      <div class="bottom-row">
        <MaterialTable
          items={themes_data}
          columnSizes={["20%", "80%"]}
          height="500px"
        >
          <div slot="header">
            <MaterialTableRow values={["#", "Name"]} type="header" />
          </div>
          <div slot="item" let:item let:index>
            <MaterialTableRow
              values={[`${index + 1}.`, item.name]}
              type="click row"
              on:click={() => selectStyle(index)}
            />
          </div>
        </MaterialTable>
      </div>
    </Modal>
  {/if}
</div>

<style>
  .modal {
    display: flex;
    flex-direction: column;
  }

  .top-row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .bottom-row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .bottom-split {
    display: flex;
    flex-direction: column;
  }

  .left-side {
    display: flex;
    flex-direction: row;
  }

  .color-input {
    width: 40px;
    height: 40px;
    margin-left: 5px;
  }

  .color-edit {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 10px;
  }

  .color-edit label {
    margin: auto;
    margin-left: 0px;
  }

  .left-side span {
    margin: auto;
    margin-right: 10px;
  }

  .delete {
    --secondary-text-color: var(--delete-color, red);
  }
</style>
