<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
    let dj = data.dj
</script>

<h1>{dj.name}</h1>
<div>{dj.logo}</div>