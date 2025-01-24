<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash2 from 'lucide-svelte/icons/trash';
	import Plus from 'lucide-svelte/icons/plus';
	import { flip } from 'svelte/animate';
	import { cn } from '$lib/utils.js';

	type Props = {
		event_promos: string[];
	};

	let { event_promos = $bindable() }: Props = $props();

	let dragging_index = 0;
	let last_dragover_index = 0;
	let is_dragging = false;

	function handleDragStart(index: number, event: DragEvent) {
		is_dragging = true;
		dragging_index = index;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	function handleDragOver(index: number, event: DragEvent) {
		if (!is_dragging) return;
		last_dragover_index = index;
		event.preventDefault();
	}

	function handleDjDragEnd() {
		is_dragging = false;
		// In browser for svelte animation
		if (dragging_index < 0 || last_dragover_index < 0) return;
		if (dragging_index === last_dragover_index) return;
		let moving_value = event_promos[dragging_index];
		let target_value = event_promos[last_dragover_index];
		event_promos.splice(dragging_index, 1);
		if (dragging_index > last_dragover_index) {
			event_promos.splice(event_promos.indexOf(target_value), 0, moving_value);
		} else {
			event_promos.splice(event_promos.indexOf(target_value) + 1, 0, moving_value);
		}
	}

	const deleteEventPromoItem = async (promo_name: string) => {
		event_promos = event_promos.filter((promo) => promo !== promo_name);
	};
</script>

<div class="flex w-full flex-col px-5">
	<div class="mx-auto mt-4 flex w-full max-w-4xl flex-row justify-between">
		<h1 class="scroll-m-20 py-2 text-center text-xl font-bold tracking-tight">Event Promotions</h1>
		<Button variant="outline" onclick={() => console.log('hi')}>
			<Plus class="mr-2 h-4 w-4" />
			Add Promotions
		</Button>
	</div>
	<Table.Root>
		<Table.Caption>Drag and Drop Promotions to change order.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">#</Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each event_promos as event_promo, i (event_promo)}
				<!-- Broke out Table.Row for animation -->
				<tr
					class={cn(
						'cursor-move border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
					)}
					draggable="true"
					ondragstart={(event) => handleDragStart(i, event)}
					ondragover={(event) => handleDragOver(i, event)}
					ondragend={handleDjDragEnd}
					animate:flip
				>
					<Table.Cell class="font-medium">{i + 1}.</Table.Cell>
					<Table.Cell>{event_promo}</Table.Cell>
					<Table.Cell>
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
								</DropdownMenu.Group>
								<DropdownMenu.Separator />
								<DropdownMenu.Item
									onclick={() => window.open(`/promotions/${event_promo}`, '_blank')}
								>
									<Pencil class="mr-2 size-4" />
									Edit Promo
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={() => deleteEventPromoItem(event_promo)}>
									<Trash2 class="mr-2 size-4 text-destructive" />
									<span class="text-destructive">Delete</span>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</tr>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
