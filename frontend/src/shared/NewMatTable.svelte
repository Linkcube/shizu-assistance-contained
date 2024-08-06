<script>
    import { setContext } from 'svelte';
    import { flip } from 'svelte/animate';

    export let items;
    export let columnSizes;
    export let height = "100%";

    let animated = false;
    if (items.length > 0) {
        animated = items[0].hasOwnProperty("name");
    }

    setContext('sizes', columnSizes);
</script>

<style>
    .table-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        background: var(--background-color, white);
    }

    .row {
        width: 100%;
        flex-direction: row;
    }

    .items-container {
        width: 100%;
        height: var(--height);
        flex-direction: column;
        overflow-y: auto;
    }
</style>

<div class="table-container">
    <span class="row">
        <slot name="header"></slot>
    </span>
    <span class="items-container" style="--height: {height};">
        {#if animated}
            {#each items as item, index (item.name)}
                <div animate:flip>
                    <slot name="item" {item} {index}></slot>
                </div>
            {/each}
        {:else}        
            {#each items as item, index}
                    <slot name="item" {item} {index}></slot>
            {/each}
        {/if}
    </span>
    <span class="row">
        <slot name="footer"></slot>
    </span>
</div>