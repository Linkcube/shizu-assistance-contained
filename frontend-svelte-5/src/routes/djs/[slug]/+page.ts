import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSingle, getSingleEvents } from '$lib/djController';

export const load: PageLoad = async ({ fetch, params }) => {
	const real_name = decodeURI(params.slug);
	let dj_data;
	try {
		dj_data = await getSingle(real_name, fetch);
	} catch (e) {
		error(404, `DJ ${real_name} not found`);
	}
	if (dj_data === undefined) error(404, `DJ ${real_name} not found`);

	let dj_event_data = await getSingleEvents(real_name, fetch);

	return {
		dj: dj_data,
		events: dj_event_data
	};
};
