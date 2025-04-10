import { getAll } from '$lib/eventController';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	return {
		events: await getAll(fetch)
	};
};
