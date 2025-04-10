<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	interface Props {
		type: string;
		item_name: string;
		callbackFunc: () => void;
	}

	let { type, item_name, callbackFunc }: Props = $props();

	let show_alert = $state(false);

	export const open = () => {
		show_alert = true;
	};

	const confirm = () => {
		show_alert = false;
		callbackFunc();
	};
</script>

<AlertDialog.Root bind:open={show_alert}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if type === 'dj' || type === 'promotion'}
					This action cannot be undone. This will permanently delete {item_name}
					and remove related data from all events.
				{:else}
					This action cannot be undone. This will permanently delete {item_name}.
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirm}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
