<script>
    import DropdownMenu from "./DropdownMenu.svelte";

</script>

<style>
    header {
		flex-shrink: 0;
        background: var(--primary-color);
        display: inline-flex;
        flex-direction: row;
        justify-content: flex-end;
        line-height: 40px;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10+ and Edge */
        user-select: none; /* Standard syntax */
        -webkit-app-region: drag;
        width: 100%;
    }

    p {
        color: var(--background-color);
        margin: auto;
        text-align: center;
        font-size: 20px;
    }

    .text-alignment {
        display: inline-flex;
        flex-direction: row;
        justify-content: space-around;
        width: 100%;
    }
</style>

<header>
    <div class="text-alignment">
        <div>
            <p>
                Shizu Assistance
            </p>
        </div>
    </div>
    <div>
        <DropdownMenu />
    </div>
</header>