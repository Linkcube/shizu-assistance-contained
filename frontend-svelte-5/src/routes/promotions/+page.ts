import { getAll } from '$lib/promotionsController';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		promos: await getAll()
	};
};
