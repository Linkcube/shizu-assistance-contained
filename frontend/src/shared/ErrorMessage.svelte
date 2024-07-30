<script>
    export let error;
</script>

<style>
    .container {
        margin-top: 20px;
        margin-left: 10px;
    }
    .row {
        display: flex;
        flex-direction: row;
        color: var(--cancel-text-color, red);
    }
</style>

<div class="container">
    <!-- <div class="row">
        {error.extensions.errorType} (HTTP {error.extensions.statusCode})
    </div> -->
    <div class="row">
        {error.message}
    </div> 
</div>