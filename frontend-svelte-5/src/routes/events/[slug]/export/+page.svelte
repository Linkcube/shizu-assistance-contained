<script lang="ts">
	import type { PageProps } from './$types';
	import * as Table from '$lib/components/ui/table/index.js';
	import FileImage from 'lucide-svelte/icons/file-image';
	import FileVideo from 'lucide-svelte/icons/file-video';
	import Type from 'lucide-svelte/icons/type';
	import Wifi from 'lucide-svelte/icons/wifi';
	import type { DJ } from '$lib/djController';
	import Ban from 'lucide-svelte/icons/ban';
	import type { Promotion } from '$lib/promotionsController';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { exportSingle } from '$lib/eventController';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { toast } from 'svelte-sonner';

	const { data }: PageProps = $props();

	const dj_map: Map<string, DJ> = new Map(data.djs.map((dj) => [dj.name, dj])) || new Map();
	const promo_map: Map<string, Promotion> =
		new Map(data.promotions.map((promo) => [promo.name, promo])) || new Map();

	let exporting = $state(false);
	let export_promise = $state(Promise.resolve(false));
	let export_progress = $state(0);

	const exportEvent = () => {
		exporting = true;
		export_progress = 50;
		export_promise = exportSingle(data.event.name);
		export_promise
			.then((success) => {
				if (success) {
					export_progress = 100;
					toast.success('Success', {
						description: `Exported ${data.event.name}.`,
						action: {
							label: 'OK',
							onClick: () => console.info('OK')
						}
					});
				} else {
					export_progress = 0;
				}
			})
			.catch((_) => (export_progress = 0));
	};
</script>

<div class="items-center px-0 align-middle sm:px-20 lg:px-40">
	<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-3xl">
		Event DJs
	</h1>
	{#if data.event.djs && data.event.djs.length > 0}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Display Name/Logo</Table.Head>
					<Table.Head>Source</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.event.djs as dj, i}
					<Table.Row>
						<Table.Cell>
							<Button
								variant="link"
								class="text-foreground"
								onclick={() => goto(`/djs/${dj.name}`)}
							>
								{dj.name}
							</Button>
						</Table.Cell>
						<Table.Cell class="font-medium">
							<div class="flex flex-row items-center text-center">
								{#if dj_map.get(dj.name)?.logo}
									<FileImage class="mr-2 size-4 text-primary" />
									<span>{dj_map.get(dj.name)?.logo}</span>
								{:else if dj_map.get(dj.name)?.public_name}
									<Type class="mr-2 size-4 text-primary" />
									<span>{dj_map.get(dj.name)?.public_name}</span>
								{:else}
									<Type class="mr-2 size-4 text-primary" />
									<span>{dj.name}</span>
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell class="font-medium">
							<div class="flex flex-row items-center text-center">
								{#if dj.is_live}
									{#if dj_map.get(dj.name)?.rtmp_server && dj_map.get(dj.name)?.rtmp_key}
										<Wifi class="mr-2 size-4 text-primary" />
										<span>{dj_map.get(dj.name)?.rtmp_server}:{dj_map.get(dj.name)?.rtmp_key}</span>
									{:else}
										<Ban class="mr-2 size-4 text-primary" />
									{/if}
								{:else if dj_map.get(dj.name)?.recording}
									<FileVideo class="mr-2 size-4 text-primary" />
									<span>{dj_map.get(dj.name)?.recording}</span>
								{:else}
									<Ban class="mr-2 size-4 text-primary" />
								{/if}
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#await Promise.all(data.dj_errors_promise) then dj_errors}
			{#each dj_errors as dj_error}
				{#if dj_error !== undefined}
					<Alert.Root variant="destructive">
						<CircleAlert class="size-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>{dj_error}</Alert.Description>
					</Alert.Root>
				{/if}
			{/each}
		{/await}
	{:else}
		<Alert.Root variant="default">
			<CircleAlert class="size-4" />
			<Alert.Title>Warning</Alert.Title>
			<Alert.Description>No DJs have been set for this event.</Alert.Description>
		</Alert.Root>
	{/if}

	<h1 class="scroll-m-20 py-2 text-center text-4xl font-bold tracking-tight lg:text-3xl">
		Event Promotions
	</h1>
	{#if data.event.promos && data.event.promos.length > 0}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Source</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.event.promos as promo, i}
					<Table.Row>
						<Table.Cell>
							<Button
								variant="link"
								class="text-foreground"
								onclick={() => goto(`/promotions/${promo}`)}
							>
								{promo}
							</Button>
						</Table.Cell>
						<Table.Cell class="font-medium">
							<div class="flex flex-row items-center text-center">
								{#if promo_map.get(promo) && promo_map.get(promo)?.promo_file}
									<FileVideo class="mr-2 size-4 text-primary" />
									<span>{promo_map.get(promo)?.promo_file}</span>
								{:else}
									<Ban class="mr-2 size-4 text-primary" />
								{/if}
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#await Promise.all(data.promo_errors_promise) then promo_errors}
			{#each promo_errors as promo_error}
				{#if promo_error !== undefined}
					<Alert.Root variant="destructive">
						<CircleAlert class="size-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>{promo_error}</Alert.Description>
					</Alert.Root>
				{/if}
			{/each}
		{/await}
	{:else}
		<Alert.Root variant="default">
			<CircleAlert class="size-4" />
			<Alert.Title>Warning</Alert.Title>
			<Alert.Description>No Promotions have been set for this event.</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="flex flex-col items-center justify-between md:flex-row">
		<Button class="my-2 w-full md:basis-1/3" onclick={exportEvent}>Export Event</Button>
		<Progress class="my-2 md:basis-1/3" value={export_progress} />
		{#if exporting}
			{#await export_promise}
				<span class="text-muted">...</span>
			{:then export_result}
				{#if export_result}
					<span class="text-foreground/50">Exported to {data.event.name}.json</span>
				{:else}
					<span class="text-foreground/50">Export failed..</span>
				{/if}
			{/await}
		{:else}
			<div></div>
		{/if}
	</div>
</div>
