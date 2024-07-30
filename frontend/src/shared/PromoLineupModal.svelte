<script>
    import {
        IconButton
    } from 'linkcube-svelte-components';
    import Modal from './Modal.svelte';
    import { 
        fetchLineup,
        ledger,
        toFileName,
        fetchRemoveLineupPromo,
        error_stack
    } from '$lib/store.js';
    import { createEventDispatcher } from 'svelte';
    import { get } from 'svelte/store';

    export let index = 0;
    export let current_lineup = "";
    export let name = "";

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    let error_on_init = false;
    let file_name;

    const ledger_data = get(ledger);
    const promo_data = ledger_data.promos.filter(promo => promo.name === name)[0];

    if (promo_data === undefined) {
        error_stack.set({
            message: `Could not find Promo ${name} in ledger.`,
            extensions: {
                statusCode: 404,
                errorType: "PromoNotFoundError"
            }
        });
        error_on_init = true;
        close();
    } else {
        file_name = toFileName(promo_data.path);
    }

    export const removePromo = () => {
        fetchRemoveLineupPromo(current_lineup, name).then(_ => fetchLineup(current_lineup));
        close();
    }
</script>

<style>
    .central-column {
        display: flex;
        flex-direction: column;
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

{#if !error_on_init}
    <Modal on:close={close} use_submission={false}>
        <div class="central-column">
            <div class="row">
                <p>Name: {name}</p>
                <div class="delete">
                    <IconButton icon="delete" title="Remove from lineup" on:click={removePromo} />
                </div>
            </div>
            <div class="row">
                <p>Promo File: {file_name ? file_name : "Not Set"}</p>
            </div>
        </div>
    </Modal>
{/if}