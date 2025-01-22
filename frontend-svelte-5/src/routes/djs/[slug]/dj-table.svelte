<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import FileImage from 'lucide-svelte/icons/file-image';
	import Film from 'lucide-svelte/icons/film';
	import FileX from 'lucide-svelte/icons/file-x';
	import * as Select from '$lib/components/ui/select/index.js';
	import { RTMP_SERVERS } from '$lib/utils';
	import type { DJ } from '$lib/djController';

	type Props = {
		dj: DJ;
		submitChanges: () => void;
		deleteDj: () => void;
		selectLogo: () => void;
		selectRecording: () => void;
		unsetLogoFile: () => void;
		unsetRecordingFile: () => void;
	};

	let {
		dj = $bindable(),
		submitChanges,
		deleteDj,
		selectLogo,
		selectRecording,
		unsetLogoFile,
		unsetRecordingFile
	}: Props = $props();

	const rtmpTriggerContent = $derived(
		RTMP_SERVERS.find((r) => r.id === dj.rtmp_server && r.id !== '')?.name ?? 'RTMP Server'
	);
</script>

<div class="mx-auto flex min-w-80 max-w-screen-lg flex-col px-10 py-4 md:px-40">
	<div class="flex w-full flex-col justify-between md:flex-row">
		<div class="w-full max-w-md basis-2/5 items-center gap-1.5">
			<Label for="public-name">Public Name</Label>
			<Input type="text" id="public-name" placeholder="Public Name" bind:value={dj.public_name} />
			<p class="text-sm text-muted-foreground">Alternate Public Name.</p>
		</div>

		<div class="w-full max-w-md basis-2/5 items-center gap-1.5">
			<Label for="discord-id">Discord ID</Label>
			<Input type="text" id="discord-id" placeholder="Discord ID" bind:value={dj.discord_id} />
			<p class="text-sm text-muted-foreground">Ex. Shizu#42069.</p>
		</div>
	</div>
	<div class="flex w-full flex-col justify-between gap-1.5 py-4">
		<Label for="discord-id">DJ Logo</Label>
		<div class="flex flex-row">
			<Button class="basis-1/2" variant="outline" onclick={selectLogo}>
				<FileImage class="mr-2 h-4 w-4" />
				Select Logo
			</Button>
			<Button class="basis-1/2" variant="secondary" onclick={unsetLogoFile}>
				<FileX class="mr-2 h-4 w-4" />
				Unset
			</Button>
		</div>
		<p class="text-sm text-muted-foreground">{dj.logo ? `Current: ${dj.logo}` : 'No Logo Set'}</p>
	</div>
	<div class="flex w-full flex-col justify-between gap-1.5 py-4">
		<Label for="discord-id">DJ Recording</Label>
		<div class="flex flex-row">
			<Button class="basis-1/2" variant="outline" onclick={selectRecording}>
				<Film class="mr-2 h-4 w-4" />
				Select Recording
			</Button>
			<Button class="basis-1/2" variant="secondary" onclick={unsetRecordingFile}>
				<FileX class="mr-2 h-4 w-4" />
				Unset
			</Button>
		</div>
		<p class="text-sm text-muted-foreground">
			{dj.recording ? `Current: ${dj.recording}` : 'No Recording Set'}
		</p>
	</div>

	<div class="flex w-full flex-row justify-between gap-1.5 py-4">
		<div class="basis-1/5 flex-col">
			<Label for="server-select">RTMP Server</Label>
			<Select.Root type="single" name="server-select" bind:value={dj.rtmp_server}>
				<Select.Trigger class="w-[120px]">
					{rtmpTriggerContent}
				</Select.Trigger>
				<Select.Content>
					{#each RTMP_SERVERS as rtmp_config}
						<Select.Item value={rtmp_config.id}>
							{rtmp_config.name}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<p class="text-sm text-muted-foreground">Closest Zone.</p>
		</div>
		<div class="basis-4/5 flex-col">
			<div class="flex w-full flex-col justify-between gap-1.5">
				<Label for="rtmp-key">RTMP Key</Label>
				<Input
					disabled={dj.rtmp_server === null || dj.rtmp_server === ''}
					type="text"
					id="rtmp-key"
					placeholder="RTMP Key"
					bind:value={dj.rtmp_key}
				/>
				<p class="text-sm text-muted-foreground">Personal Live Streaming Key.</p>
			</div>
		</div>
	</div>
	<div class="flex w-full flex-row justify-between gap-1.5 py-4">
		<Button class="w-full" onclick={submitChanges}>Save</Button>
		<Button variant="destructive" class="w-full" onclick={deleteDj}>Delete</Button>
	</div>
</div>
