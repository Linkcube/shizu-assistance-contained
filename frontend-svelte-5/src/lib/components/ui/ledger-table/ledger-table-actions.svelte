<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash2 from 'lucide-svelte/icons/trash';
	import Download from 'lucide-svelte/icons/download';
	import { goto } from '$app/navigation';

	interface Props {
		name: string;
		path: string;
		delete_item: (name: string) => void;
	}

	let { name, path, delete_item }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item onclick={() => goto(`/${path}/${name}`)}>
				<Pencil class="mr-2 size-4" />
				Edit
			</DropdownMenu.Item>
			{#if path === 'events'}
				<DropdownMenu.Item onclick={() => goto(`/${path}/${name}/export`)}>
					<Download class="mr-2 size-4" />
					Export
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={() => delete_item(name)}>
			<Trash2 class="mr-2 size-4 text-destructive" />
			<span class="text-destructive">Delete</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
