<script>
    import { IconButton } from "linkcube-svelte-components";
    import ThemeMenu from "./ThemeMenu.svelte";
    import Settings from "./Settings.svelte";
    import Readme from "./Readme.svelte";
    import Checklist from "./Checklist.svelte";

    let menu_open = false;
    let themes_open = false;
    let settings_open = false;
    let readme_open = false;
    let checklist_open = false;

    const openMenu = () => {
        menu_open = true;
    }
    const openThemes = () => {
        themes_open = true;
        menu_open = false;
    }
    const closeThemes = () => {
        themes_open = false;
    }

    function openSettings () {
        settings_open = true;
        menu_open = false;
    }

    function closeSettings () {
        settings_open = false;
    }

    function openReadme () {
        readme_open = true;
        menu_open = false;
    }

    function closeReadme() {
        readme_open = false;
    }

    function openChecklist () {
        checklist_open = true;
        menu_open = false;
    }

    function closeChecklist() {
        checklist_open = false;
    }

</script>



<style>
    .menu-container {
        -webkit-app-region: no-drag;
        padding-left: 10px;
        padding-right: 10px;
        background-color: var(--background-color, white);
    }

    .dropdown-content {
        display: flex;
        flex-direction: column;
        position: absolute;
        background-color: var(--background-color, white);
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        
        z-index: 1;
        right: 30px;
        top: 30px;
    }

    span {
        padding-left: 10px;
        padding-right: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
        text-align: left;
    }

    span:hover {
        background: var(--secondary-color, lightgray);
        transition-duration: 400ms;
    }

    .menu-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0);
	}
</style>

{#if themes_open}
    <ThemeMenu on:close={closeThemes} />
{/if}
{#if settings_open}
    <Settings on:close={closeSettings} />
{/if}
{#if readme_open}
    <Readme on:close={closeReadme} />
{/if}
{#if checklist_open}
    <Checklist on:close={closeChecklist} />
{/if}

<div class="menu-container">
    <IconButton icon="{menu_open ? 'menu_open' : 'menu'}" on:click={openMenu} />

    {#if menu_open}
        <div class="dropdown-content">
            <span on:click={openThemes}>Change Styling</span>
            <span on:click={openSettings}>Settings</span>
            <span on:click={openReadme}>ReadMe</span>
            <span on:click={openChecklist}>Checklist</span>
        </div>
        <div class="menu-background" on:click={() => menu_open = false} />
    {/if}
</div>