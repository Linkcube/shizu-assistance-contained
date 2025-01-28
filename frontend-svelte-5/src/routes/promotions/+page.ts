import { getAll } from '$lib/promotionsController';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	return {
		promos: await getAll(fetch)
	};
};
