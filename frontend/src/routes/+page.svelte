<script>
	import Theme from '../shared/Theme.svelte';
    import Header from '../shared/Header.svelte';
    import MainContents from '../shared/MainContents.svelte';
	import Footer from "../shared/Footer.svelte";
</script>

<svelte:head>
	<title>Tasukete Shizu!</title>
	<meta name="description" content="Shizu Assistance" />
</svelte:head>

<style>
	.app-container {
		min-height: 100%;
		overflow: hidden;
		margin: 0px;
		display: flex;
		flex-direction: column;
		min-width: 700px;
		display: flex;
		flex-direction: column;
	}
</style>


<Theme>
	<div class="app-container">
		<Header />
		<MainContents />
		<Footer />
	</div>
</Theme>
