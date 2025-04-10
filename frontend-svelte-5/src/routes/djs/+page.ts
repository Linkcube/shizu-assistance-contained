import { getAll } from '$lib/djController';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	return {
		djs: await getAll(fetch)
	};
};
