<script lang="ts">
	import { login, logout } from "$lib/utils";
	import Button from '$lib/components/ui/button/button.svelte';
	import Plus from 'lucide-svelte/icons/plus';

	export const start_login = () => {
		login("test-password");
	}
</script>

<Button onclick={start_login}>
	<Plus class="mr-2 h-4 w-4" />
	Login
</Button>
<Button onclick={logout}>
	<Plus class="mr-2 h-4 w-4" />
	Logout
</Button>