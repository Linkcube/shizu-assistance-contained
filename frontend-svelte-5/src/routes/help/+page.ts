import type { PageLoad } from './$types';
import { getVersion } from '$lib/settingsController';

export const load: PageLoad = async ({ fetch, params }) => {
	let version_data = await getVersion(fetch);
	return {
		version_data
	};
};
