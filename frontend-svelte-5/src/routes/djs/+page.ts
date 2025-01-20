import { getAll } from '$lib/djController';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		djs: await getAll()
	};
};
