<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import { MaterialButton, MaterialInput } from "linkcube-svelte-components";
  import {
    LOGO_TYPE,
    RECORDING_TYPE,
    oaFetchLogoPermissions,
    oaFetchRecordingPermissions,
    serverUrl,
    THEME_TYPE,
    oaFetchThemePermissions,
    isImageSource,
  } from "$lib/store";

  export let file_type = LOGO_TYPE;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  let selected_file = false;
  let selected_file_ext = "";
  let preview_path = "";
  /**
   * @type {string[]}
   */
  let current_path = [];
  let current_files = [];
  let top_level_dir = [];
  let display_files = [];

  /**
   * @type {HTMLDivElement}
   */
  let modal;

  let sort_direction = false;
  let sort_type = "name";
  let search_value = "";

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
      previously_focused.focus();
    });
  }

  async function fetchFileBlob() {
    if (file_type == LOGO_TYPE) {
      const file_blob = await oaFetchLogoPermissions(current_path);
      if (file_blob) {
        current_files = file_blob.files;
        display_files = current_files;
        current_path = file_blob.path;
        top_level_dir = file_blob.top_dir;
      }
    }
    if (file_type == RECORDING_TYPE) {
      const file_blob = await oaFetchRecordingPermissions(current_path);
      if (file_blob) {
        current_files = file_blob.files;
        display_files = current_files;
        current_path = file_blob.path;
        top_level_dir = file_blob.top_dir;
      }
    }
    if (file_type == THEME_TYPE) {
      const file_blob = await oaFetchThemePermissions(current_path);
      if (file_blob) {
        current_files = file_blob.files;
        display_files = current_files;
        current_path = file_blob.path;
        top_level_dir = file_blob.top_dir;
      }
    }
    sort_direction = false;
    sort_type = "name";
  }

  function selectTopDir(dir) {
    current_path = [];
    selected_file = false;
    preview_path = "";
    fetchFileBlob();
  }

  function navUp() {
    if (current_path.length == 0) return;

    current_path.pop();
    selected_file = false;
    preview_path = "";
    fetchFileBlob();
  }

  function selectFileItem(file_name, ext, is_dir) {
    if (is_dir) {
      current_path.push(file_name);
      selected_file = false;
      preview_path = "";
      fetchFileBlob();
    } else {
      // Update preview and selected item
      selected_file = file_name;
      selected_file_ext = ext;
      if (file_type === LOGO_TYPE) {
        preview_path = `${serverUrl}/logos/${current_path.join("/")}/${file_name + ext}`;
      } else if (file_type === RECORDING_TYPE) {
        preview_path = `${serverUrl}/recordings/${current_path.join("/")}/${file_name + ext}`;
      } else {
        preview_path = `${serverUrl}/themes/${current_path.join("/")}/${file_name + ext}`;
      }
    }
  }

  function submission() {
    if (
      file_type === LOGO_TYPE ||
      file_type === RECORDING_TYPE ||
      file_type === THEME_TYPE
    ) {
      let return_path = "";
      if (current_path.length > 0) {
        return_path = current_path.join("/") + "/";
      }
      return_path += `${selected_file + selected_file_ext}`;
      dispatch("submission", {
        file_name: selected_file,
        file_path: return_path,
      });
      close();
    }
  }

  function compareBy(field, direction) {
    switch (field) {
      case "name":
        if (direction)
          return (a, b) =>
            `${a.name}${a.ext}`.localeCompare(`${b.name}${b.ext}`) * -1;
        return (a, b) => `${a.name}${a.ext}`.localeCompare(`${b.name}${b.ext}`);
      case "type":
        if (direction) return (a, b) => a.is_dir < b.is_dir;
        return (a, b) => a.is_dir > b.is_dir;
    }
  }

  function sortByName() {
    if (sort_type != "name") sort_direction = false;
    display_files = display_files.sort(compareBy("name", sort_direction));
    sort_direction = !sort_direction;
    sort_type = "name";
  }

  function sortByType() {
    if (sort_type != "type") sort_direction = false;
    display_files = display_files.sort(compareBy("type", sort_direction));
    sort_direction = !sort_direction;
    sort_type = "type";
  }

  const enterSearch = () => {
    if (search_value === "") {
      display_files = current_files;
    } else {
      display_files = current_files.filter((file) =>
        `${file.name}${file.ext}`
          .toUpperCase()
          .includes(search_value.toUpperCase()),
      );
    }
  };

  fetchFileBlob();
</script>

<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" on:click={close}></div>

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
  <div class="nav-header row">
    <p>Current Directory: /{top_level_dir}/{current_path.join("/")}</p>
  </div>
  <br />
  <div class="main row">
    <div class="top-dir column">
      {#if current_path.length > 0}
        <span class="top-dir-item column" on:click={navUp}>
          <span class="material-icons large-icon">arrow_upward</span>
          <p>Nav Up</p>
        </span>
      {/if}
      <span
        class="top-dir-item column"
        on:click={() => selectTopDir(top_level_dir)}
      >
        <span class="material-icons large-icon"
          >{current_path.length === 0 ? "folder_open" : "folder"}</span
        >
        <p>{top_level_dir}</p>
      </span>
    </div>
    <div class="body column">
      <div class="nav-header row">
        <div class="nav-header-sort" on:click={sortByName}>
          <span>Name</span>
          <span class="material-icons">swap_vert</span>
        </div>
        <div class="nav-header-sort" on:click={sortByType}>
          <span>Type</span>
          <span class="material-icons">swap_vert</span>
        </div>
        <MaterialInput
          label="Search Files"
          bind:value={search_value}
          on:blur={enterSearch}
          on:enter={enterSearch}
        />
      </div>
      <div class="file-selection column">
        {#each display_files as file}
          <span
            class="row file-selection-row"
            on:click={() => selectFileItem(file.name, file.ext, file.is_dir)}
          >
            <span class="material-icons large-icon file-selection-icon">
              {#if file.is_dir}
                folder
              {:else if file_type == LOGO_TYPE}
                photo
              {:else}
                video_file
              {/if}
            </span>
            <span class="file-selection-item">{file.name}{file.ext}</span>
          </span>
        {/each}
      </div>
    </div>
    <div class="preview column">
      <span class="row">File Preview</span>
      {#if selected_file}
        <span class="preview-text">{selected_file}</span>
        {#if isImageSource(preview_path)}
          <div
            class="preview-image"
            style={`background: url("${preview_path}"); background-size: contain; background-repeat: no-repeat;`}
          />
        {:else}
          <video controls src={preview_path} />
        {/if}
      {/if}
    </div>
  </div>
  <br />
  <div class="user-actions">
    <div class="cancel">
      <MaterialButton on:click={close} value="Cancel" />
    </div>
    <div class={selected_file ? "submit" : "disabled"}>
      <MaterialButton on:click={submission} value="Select File" />
    </div>
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
    z-index: 9;
  }

  .modal {
    position: fixed;
    left: 50%;
    top: 50%;
    width: calc(100vw - 4em);
    max-width: 80%;
    max-height: 70%;
    overflow: auto;
    transform: translate(-50%, -50%);
    padding: 1em;
    border-radius: 0.2em;
    background: var(--background-color, white);
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.3),
      0 6px 20px 0 rgba(0, 0, 0, 0.29);
    z-index: 10;
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

  .disabled {
    --primary-text-color: var(--secondary-color, gray);
    --secondary-color: var(--secondary-color, rgb(253, 229, 232));
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10+ and Edge */
    user-select: none; /* Standard syntax */
    cursor: not-allowed;
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    flex-direction: row;
  }

  .top-dir {
    justify-content: start;
    gap: 20px;
    height: 100%;
    width: 80px;
  }

  .material-icons {
    font-size: 20px;
    color: var(--secondary-text-color, gray);
    background-color: rgba(0, 0, 0, 0);
    border: none;
    padding-right: 10px;
    transition: 0.3s;
    border-radius: 100px;
    margin-bottom: 7px;
    -webkit-transform: scaleX(var(--scaleX)) scaleY(var(--scaleY));
    transform: scaleX(var(--scaleX)) scaleY(var(--scaleY));
    margin-right: auto;
    margin-left: auto;
  }

  .material-icons::-moz-focus-inner {
    border: 0;
  }

  .large-icon {
    font-size: 25px;
  }

  .nav-header {
    height: 60px;
    width: 100%;
    justify-content: flex-start;
  }

  .nav-header-sort {
    cursor: pointer;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    margin-top: auto;
    margin-bottom: auto;
  }

  .file-selection {
    width: 100%;
    overflow-y: scroll;
    height: 700px;
  }

  .main {
    min-height: 500px;
  }

  .top-dir-item {
    text-align: center;
    & p {
      margin: 0px;
    }
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10+ and Edge */
    user-select: none; /* Standard syntax */
    cursor: pointer;
  }

  .body {
    flex-grow: 1;
  }

  .preview {
    width: 30%;
    min-width: 100px;
  }

  .file-selection-row {
    border-top: 1px solid var(--secondary-text-color, gray);
    justify-content: flex-start;
    cursor: pointer;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .file-selection-row:hover {
    background: var(--secondary-color, lightgray);
    transition-duration: 400ms;
  }

  .file-selection-icon {
    margin: 10px;
  }

  .file-selection-item {
    margin-top: 10px;
    text-overflow: ellipsis;
  }

  .preview-image {
    height: 100%;
    width: 100%;
  }

  .preview-text {
    text-overflow: ellipsis;
  }
</style>
