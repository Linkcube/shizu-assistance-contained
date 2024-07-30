<script>
    import { createEventDispatcher } from 'svelte';
    import {
        error_stack
    } from '$lib/store';
    import Modal from './Modal.svelte';
    import ErrorMessage from './ErrorMessage.svelte';
    import {
        IconButton
    } from 'linkcube-svelte-components';

    export let error;
    export let header;
    export let callback;

    let show_modal = true;

    const dispatch = createEventDispatcher();

    function close() {
        error_stack.set(null);
        show_modal = false;
        dispatch("close");
    }

    function make_callback() {
        error_stack.set(null);
        show_modal = false;
        dispatch("callback");
    }
</script>

<style>
    h1 {
        color: var(--cancel-text-color, red);
        text-align: center;
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

{#if show_modal}
    <Modal on:close={close} use_submission={false}>
        <div class="row">
            <h1>{header}</h1>
            {#if callback}
                <div class="delete">
                    <IconButton icon="delete" title={callback} on:click={make_callback} />
                </div>
            {/if}
        </div>
        <ErrorMessage error={error} />
    </Modal>
{/if}