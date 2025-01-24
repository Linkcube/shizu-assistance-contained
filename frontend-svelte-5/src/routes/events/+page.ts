import { getAll } from '$lib/eventController';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		events: await getAll()
	};
};
