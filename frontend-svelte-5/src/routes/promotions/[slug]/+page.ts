import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSingle } from '$lib/promotionsController';

export const load: PageLoad = async ({ fetch, params }) => {
	const real_name = decodeURI(params.slug);
	let promo_data;
	try {
		promo_data = await getSingle(real_name, fetch);
	} catch (e) {
		error(404, `DJ ${real_name} not found`);
	}
	if (promo_data === undefined) error(404, `Promotion ${real_name} not found`);

	return {
		promo: promo_data
	};
};
