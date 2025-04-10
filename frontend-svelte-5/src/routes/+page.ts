import type { PageLoad } from './$types';
import { getMin as getDjMin } from '$lib/djController';
import { getMin as getPromoMin } from '$lib/promotionsController';
import { getMin as getEventMin } from '$lib/eventController';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const djs_min = await getDjMin(fetch);
	const promos_min = await getPromoMin(fetch);
	const events_min = await getEventMin(fetch);

	return {
		djs: djs_min.length,
		promos: promos_min.length,
		events: events_min.length
	};
};
