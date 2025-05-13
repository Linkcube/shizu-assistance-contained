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
	import Info from 'lucide-svelte/icons/info';
	import { goto } from '$app/navigation';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { exportSingle } from '$lib/eventController';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { toast } from 'svelte-sonner';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import type { File } from '$lib/fileController';
	import { isImageSource, pushToLog } from '$lib/utils';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Input } from '$lib/components/ui/input';
	import Film from 'lucide-svelte/icons/film';

	const { data }: PageProps = $props();

	const dj_map: Map<string, DJ> = new Map(data.djs.map((dj) => [dj.name, dj])) || new Map();
	const promo_map: Map<string, Promotion> =
		new Map(data.promotions.map((promo) => [promo.name, promo])) || new Map();
	const files_map: Map<string, File> =
		new Map(data.files.map((file) => [file.name, file])) || new Map();

	let exporting = $state(false);
	let export_promise = $state(Promise.resolve(false));
	let export_progress = $state(0);
	let exporting_state = $state('');

	const staticAssetsBase = `http://${location.hostname}:4004`;

	const exportEvent = () => {
		exporting = true;
		export_progress = 50;
		export_promise = exportSingle(data.event.name);
		export_promise
			.then((success) => {
				if (success) {
					pushToLog({
						statusCode: 200,
						errorType: 'Event Exported',
						message: `${data.event.name} was successfully exported to ${data.event.name}.json.`
					});
					export_progress = 100;
					toast.success('Success', {
						description: `Exported ${data.event.name}.`,
						action: {
							label: 'OK',
							onClick: () => console.info('OK')
						}
					});
				} else {
					export_progress = 100;
					exporting_state = 'error';
				}
			})
			.catch((_) => (export_progress = 0));
	};
</script>

<div class="items-center px-0 align-middle sm:px-20 lg:px-40">
	<h1 class="scroll-m-20 py-2 text-center text-5xl font-bold tracking-tight lg:text-3xl">
		{data.event.name} Export Summary
	</h1>
	<div class="flex flex-col justify-between gap-4 xl:flex-row">
		<div class="xl:flex-1">
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
						{#each data.event.djs as event_dj}
							<Table.Row>
								<Table.Cell>
									<Button
										variant="link"
										class="text-foreground"
										onclick={() => goto(`/djs/${event_dj.name}`)}
									>
										{event_dj.name}
									</Button>
								</Table.Cell>
								<Table.Cell class="font-medium">
									<div class="flex flex-row items-center text-center">
										{#if dj_map.get(event_dj.name)?.logo}
											<HoverCard.Root>
												<HoverCard.Trigger>
													<div class="flex flex-row items-center text-center">
														<FileImage class="mr-2 size-4 text-primary" />
														<span>{dj_map.get(event_dj.name)?.logo}</span>
													</div>
												</HoverCard.Trigger>
												<HoverCard.Content>
													{#if files_map.get(dj_map.get(event_dj.name)?.logo || '')?.file_path}
														<img
															class="w-full"
															src={`${staticAssetsBase}/logos/${files_map.get(dj_map.get(event_dj.name)?.logo || '')?.file_path}`}
															alt="Preview"
														/>
														<span>
															{files_map
																.get(dj_map.get(event_dj.name)?.logo || '')
																?.file_path.split('/')[
																files_map
																	.get(dj_map.get(event_dj.name)!.logo || '')!
																	.file_path.split('/').length - 1
															]}
														</span>
													{:else if files_map.get(dj_map.get(event_dj.name)?.logo || '')?.url_path}
														<a
															class="hover:underline"
															href={files_map.get(dj_map.get(event_dj.name)?.logo || '')?.url_path}
														>
															{files_map.get(dj_map.get(event_dj.name)?.logo || '')?.url_path}
														</a>
													{:else}
														<span>
															No file/url set for {dj_map.get(event_dj.name)?.logo}
														</span>
													{/if}
												</HoverCard.Content>
											</HoverCard.Root>
										{:else if dj_map.get(event_dj.name)?.public_name}
											<Type class="mr-2 size-4 text-primary" />
											<span>{dj_map.get(event_dj.name)?.public_name}</span>
										{:else}
											<Type class="mr-2 size-4 text-primary" />
											<span>{event_dj.name}</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell class="font-medium">
									<div class="flex flex-row items-center text-center">
										{#if event_dj.is_live}
											{#if dj_map.get(event_dj.name)?.rtmp_server && dj_map.get(event_dj.name)?.rtmp_key}
												<Wifi class="mr-2 size-4 text-primary" />
												<span
													>{dj_map.get(event_dj.name)?.rtmp_server}:{dj_map.get(event_dj.name)
														?.rtmp_key}</span
												>
											{:else}
												<Ban class="mr-2 size-4 text-primary" />
											{/if}
										{:else if event_dj?.recording}
											<HoverCard.Root>
												<HoverCard.Trigger>
													<div class="flex flex-row items-center text-center">
														<FileVideo class="mr-2 size-4 text-primary" />
														<span>{event_dj?.recording}</span>
													</div>
												</HoverCard.Trigger>
												<HoverCard.Content>
													{#if files_map.get(event_dj?.recording || '')?.file_path}
														<video
															controls
															src={`${staticAssetsBase}/recordings/${files_map.get(event_dj?.recording || '')?.file_path}`}
														>
															<track kind="captions" />
														</video>
														<span>
															{files_map.get(event_dj?.recording || '')?.file_path.split('/')[
																files_map.get(event_dj!.recording || '')!.file_path.split('/')
																	.length - 1
															]}
														</span>
													{:else if files_map.get(event_dj?.recording || '')?.url_path}
														<a
															class="hover:underline"
															href={files_map.get(event_dj?.recording || '')?.url_path}
														>
															{files_map.get(event_dj?.recording || '')?.url_path}
														</a>
													{:else}
														<span>
															No file/url set for {event_dj?.recording}
														</span>
													{/if}
												</HoverCard.Content>
											</HoverCard.Root>
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
				<Alert.Root variant="destructive">
					<CircleAlert class="size-4" />
					<Alert.Title>Error</Alert.Title>
					<Alert.Description>No DJs have been set for this event.</Alert.Description>
				</Alert.Root>
			{/if}
		</div>

		<div class="xl:flex-1">
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
											<HoverCard.Root>
												<HoverCard.Trigger>
													<div class="flex flex-row items-center text-center">
														<FileVideo class="mr-2 size-4 text-primary" />
														<span>{promo_map.get(promo)?.promo_file}</span>
													</div>
												</HoverCard.Trigger>
												<HoverCard.Content>
													{#if files_map.get(promo_map.get(promo)?.promo_file || '')?.file_path}
														<video
															controls
															src={`${staticAssetsBase}/recordings/
																${files_map.get(promo_map.get(promo)?.promo_file || '')?.file_path}`}
														>
															<track kind="captions" />
														</video>
														<span>
															{files_map
																.get(promo_map.get(promo)?.promo_file || '')
																?.file_path.split('/')[
																files_map
																	.get(promo_map.get(promo)!.promo_file || '')!
																	.file_path.split('/').length - 1
															]}
														</span>
													{:else if files_map.get(promo_map.get(promo)?.promo_file || '')?.url_path}
														<a
															class="hover:underline"
															href={files_map.get(promo_map.get(promo)?.promo_file || '')?.url_path}
														>
															{files_map.get(promo_map.get(promo)?.promo_file || '')?.url_path}
														</a>
													{:else}
														<span>
															No file/url set for {promo_map.get(promo)?.promo_file}
														</span>
													{/if}
												</HoverCard.Content>
											</HoverCard.Root>
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
		</div>
	</div>

	<Separator class="my-4"></Separator>

	<div class="flex flex-col items-center justify-between py-6 md:flex-row">
		{#if data.event.theme}
			<span>
				Theme: {data.event.theme}
			</span>
			{#if data.theme}
				<HoverCard.Root>
					<HoverCard.Trigger>
						<div class="flex flex-row items-center">
							{#if data.theme.target_video_width !== null && data.theme.target_video_height !== null && data.theme.video_offset_x !== null && data.theme.video_offset_y !== null}
								<Info class="mr-2 size-4 text-primary" />
							{:else if data.theme.target_video_width !== null || data.theme.target_video_height !== null || data.theme.video_offset_x !== null || data.theme.video_offset_y !== null}
								<Info class="mr-2 size-4" />
							{:else}
								<Info class="mr-2 size-4 text-muted" />
							{/if}
							Video Config
						</div>
					</HoverCard.Trigger>
					<HoverCard.Content>
						<div class="grid gap-4">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">Dimensions</h4>
								<p class="text-sm text-muted-foreground">
									Pixel dimensions for the video placement.
								</p>
							</div>
							<div class="grid gap-2">
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="width">Width</Label>
									<Input
										id="width"
										disabled
										value={data.theme.target_video_width}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="height">Height</Label>
									<Input
										id="height"
										disabled
										bind:value={data.theme.target_video_height}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="hOffset">Horizontal Offset</Label>
									<Input
										id="hOffset"
										disabled
										value={data.theme.video_offset_x}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="voOffset">Vertical Offset</Label>
									<Input
										id="voOffset"
										disabled
										value={data.theme.video_offset_y}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
							</div>
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
				<HoverCard.Root>
					<HoverCard.Trigger>
						<div class="flex flex-row items-center">
							{#if data.theme.chat_width !== null && data.theme.chat_height !== null && data.theme.chat_offset_x !== null && data.theme.chat_offset_y !== null}
								<Info class="mr-2 size-4 text-primary" />
							{:else if data.theme.chat_width !== null || data.theme.chat_height !== null || data.theme.chat_offset_x !== null || data.theme.chat_offset_y !== null}
								<Info class="mr-2 size-4" />
							{:else}
								<Info class="mr-2 size-4 text-muted" />
							{/if}
							Chat Config
						</div>
					</HoverCard.Trigger>
					<HoverCard.Content>
						<div class="grid gap-4">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">Dimensions</h4>
								<p class="text-sm text-muted-foreground">
									Set the pixel dimensions for the chat placement.
								</p>
							</div>
							<div class="grid gap-2">
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="width">Width</Label>
									<Input
										id="width"
										disabled
										value={data.theme.chat_width}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="height">Height</Label>
									<Input
										id="height"
										disabled
										value={data.theme.chat_height}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="hOffset">Horizontal Offset</Label>
									<Input
										id="hOffset"
										disabled
										value={data.theme.chat_offset_x}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<Label for="voOffset">Vertical Offset</Label>
									<Input
										id="voOffset"
										disabled
										value={data.theme.chat_offset_y}
										type="number"
										class="col-span-2 h-8"
									/>
								</div>
							</div>
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
				<HoverCard.Root>
					<HoverCard.Trigger>
						<div class="flex flex-row items-center">
							{#if data.theme.starting_file}
								<Film class="mr-2 size-4 text-primary" />
							{:else}
								<Film class="mr-2 size-4 text-muted" />
							{/if}
							Opening
						</div>
					</HoverCard.Trigger>
					<HoverCard.Content>
						<div class="grid gap-4">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">{data.theme.starting_file}</h4>
								<p class="text-sm text-muted-foreground">Media to play before the event starts.</p>
							</div>
							{#if files_map.get(data.theme.starting_file)?.file_path}
								{#if isImageSource(files_map.get(data.theme.starting_file)?.file_path || '')}
									<img
										class="w-full"
										src={`${staticAssetsBase}/themes/
											${files_map.get(data.theme.starting_file)?.file_path}`}
										alt="Preview"
									/>
								{:else}
									<video
										controls
										src={`${staticAssetsBase}/themes/
											${files_map.get(data.theme.starting_file)?.file_path}`}
									>
										<track kind="captions" />
									</video>
								{/if}
								<span>
									{files_map.get(data.theme.starting_file)?.file_path.split('/')[
										files_map.get(data.theme.starting_file)!.file_path.split('/').length - 1
									]}
								</span>
							{:else}
								<span> No file set. </span>
							{/if}
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
				<HoverCard.Root>
					<HoverCard.Trigger>
						<div class="flex flex-row items-center">
							{#if data.theme.ending_file}
								<Film class="mr-2 size-4 text-primary" />
							{:else}
								<Film class="mr-2 size-4 text-muted" />
							{/if}
							Ending
						</div>
					</HoverCard.Trigger>
					<HoverCard.Content>
						<div class="grid gap-4">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">{data.theme.ending_file}</h4>
								<p class="text-sm text-muted-foreground">
									Media to play after the event's last DJ.
								</p>
							</div>
							{#if files_map.get(data.theme.ending_file)?.file_path}
								{#if isImageSource(files_map.get(data.theme.ending_file)?.file_path || '')}
									<img
										class="w-full"
										src={`${staticAssetsBase}/themes/
											${files_map.get(data.theme.ending_file)?.file_path}`}
										alt="Preview"
									/>
								{:else}
									<video
										controls
										src={`${staticAssetsBase}/themes/
											${files_map.get(data.theme.ending_file)?.file_path}`}
									>
										<track kind="captions" />
									</video>
								{/if}
								<span>
									{files_map.get(data.theme.ending_file)?.file_path.split('/')[
										files_map.get(data.theme.ending_file)!.file_path.split('/').length - 1
									]}
								</span>
							{:else}
								<span> No file set. </span>
							{/if}
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
				<HoverCard.Root>
					<HoverCard.Trigger>
						<div class="flex flex-row items-center">
							{#if data.theme.overlay_file}
								<FileImage class="mr-2 size-4 text-primary" />
							{:else}
								<FileImage class="mr-2 size-4 text-muted" />
							{/if}
							Overlay
						</div>
					</HoverCard.Trigger>
					<HoverCard.Content>
						<div class="grid gap-4">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">{data.theme.overlay_file}</h4>
								<p class="text-sm text-muted-foreground">
									Media to overlay DJ sets, typically a layout.
								</p>
							</div>
							{#if files_map.get(data.theme.overlay_file)?.file_path}
								{#if isImageSource(files_map.get(data.theme.overlay_file)?.file_path || '')}
									<img
										class="w-full"
										src={`${staticAssetsBase}/themes/
											${files_map.get(data.theme.overlay_file)?.file_path}`}
										alt="Preview"
									/>
								{:else}
									<video
										controls
										src={`${staticAssetsBase}/themes/
											${files_map.get(data.theme.overlay_file)?.file_path}`}
									>
										<track kind="captions" />
									</video>
								{/if}
								<span>
									{files_map.get(data.theme.overlay_file)?.file_path.split('/')[
										files_map.get(data.theme.overlay_file)!.file_path.split('/').length - 1
									]}
								</span>
							{:else}
								<span> No file set. </span>
							{/if}
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
			{:else}
				<span>
					{data.event.theme} not found!
				</span>
			{/if}
		{:else}
			No theme Set.
		{/if}
	</div>

	{#if data.event.theme}
		<div class="flex flex-row items-center justify-between">
			{#each data.theme_errors as theme_error}
				{#if theme_error !== undefined}
					<Alert.Root variant="destructive">
						<CircleAlert class="size-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>{theme_error}</Alert.Description>
					</Alert.Root>
				{/if}
			{/each}
		</div>
	{/if}

	<Separator class="my-4"></Separator>

	<div class="flex flex-col items-center justify-between md:flex-row">
		<Button class="w-full md:basis-1/3" onclick={exportEvent}>Export Event</Button>
		<Progress class="my-4 md:basis-1/3" value={export_progress} color={exporting_state} />
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
