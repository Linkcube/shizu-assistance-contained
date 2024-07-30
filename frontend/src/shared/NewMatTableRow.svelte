<script>
    import { getContext } from 'svelte';
    import {IconButton} from 'linkcube-svelte-components';
    import { createEventDispatcher } from 'svelte';

    export let values = [];
    export let type = 'row';
    export let depth = 0;

    const dispatch = createEventDispatcher();

    const sizes = getContext('sizes');
    const expand = type.includes('expand');
    let expanded = false;
    let callback = type.includes('callback');
    let callback_toggles = values.map(_ => false);
    let draggable = type.includes('draggable');


    function toggle(e) {
        e.preventDefault();
        e.stopPropagation();
        expanded = !expanded;
    }

    function makeCallback(index, value) {
        if (!callback) return;
        dispatch('callback', { value: value, direction: callback_toggles[index] });
        let new_value = !callback_toggles[index];
        callback_toggles = callback_toggles.map(_ => false);
        callback_toggles[index] = new_value;
    }

    function handleDragStart(e) {
        if (draggable) {
            dispatch('dragstart', { values: values});
            e.dataTransfer.dropEffect = "move";
        }
    }

    function handleDragEnd(e) {
        if (draggable) {
            e.preventDefault();
            dispatch('dragend', { event: e});
        }
    }

    function handleDragOver(e) {
        if (draggable) {
            e.preventDefault();
            dispatch('dragover', { event: e});
        }
    }
</script>

<!-- Styling: text-color -->
<style>
    div {
        width: 100%;
        display: flex;
        flex-direction: row;
        line-height: 48px;
        color: var(--primary-text-color, black);
    }

    .row {
        transition-duration: 400ms;
        border-top: 1px solid var(--secondary-text-color, gray);
        
    }

    .click {
        cursor: pointer;
    }

    .click:hover {
        background: rgb(235, 246, 250);
        transition-duration: 400ms;
    }

    .content {
        width: var(--width);
        justify-content: flex-start;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }

    .clickable:hover {
        background: var(--secondary-color, lightgray);
        transition-duration: 400ms;
    }

    .material-icons {
        font-size: 20px;
        color: var(--secondary-text-color, gray);
        background-color: rgba(0,0,0,0);
        border: none;
        margin-top: 15px;
        padding-right: 10px;
        cursor: pointer;
        transition: 0.3s;
        border-radius:100px;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10+ and Edge */
        user-select: none; /* Standard syntax */
        margin-bottom: 7px;
        -webkit-transform: scaleX(var(--scaleX)) scaleY(var(--scaleY));
        transform: scaleX(var(--scaleX)) scaleY(var(--scaleY));
    }

    .material-icons::-moz-focus-inner {
        border: 0;
    }

    .large-icon {
        font-size: 25px;
    }

    .check-color {
        color: var(--primary-color, lightblue);
    }

    .cancel-color {
        color: var(--delete-color, red);
    }
</style>

<div
    class={type}
    draggable="{draggable}"
    on:click
    on:dragstart={handleDragStart}
    on:dragend={handleDragEnd}
    on:dragover={handleDragOver}
>
    <span class="content" style={`--width: ${depth * 15}px`}/>
    {#if expand}
        <span class="content" style="--width:60px">
            <IconButton
                icon={expanded ? "expand_more" : "chevron_right"}
                title={expanded ? "Hide Children" : "Show Children"}
                on:click={toggle}
            />
        </span>
    {/if}
    {#each values as value, index}
        <span
            class="content {callback ? 'clickable' : ''}"
            style="--width: {sizes[index]}"
            title={value}
            on:click={() => makeCallback(index, value)}
        >
            {#if value === "true" || value === true}
                <span class="material-icons large-icon check-color">check_circle</span>
            {:else if value === "false" || value === false}
            <span class="material-icons large-icon cancel-color">cancel</span>
            {:else}
                {value}
            {/if}
            {#if callback}
                <span class="material-icons">swap_vert</span>
            {/if}
        </span>
    {/each}
</div>
{#if expanded}
    <slot name="children"></slot>
{/if}