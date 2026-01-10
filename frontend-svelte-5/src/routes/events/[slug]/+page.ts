import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSingle } from '$lib/eventController';

export const load: PageLoad = async ({ fetch, params }) => {
	console.log(params);
	const real_name = decodeURIComponent(params.slug);
	let event_data;
	try {
		event_data = await getSingle(real_name, fetch);
	} catch (e) {
		error(404, `Event ${real_name} not found.`);
	}
	if (event_data === undefined) error(404, `Event ${real_name} not found.`);

	return {
		event: event_data
	};
};
