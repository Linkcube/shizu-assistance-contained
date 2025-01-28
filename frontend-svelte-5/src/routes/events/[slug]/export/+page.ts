import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSingle as getSingleEvent } from '$lib/eventController';
import { getAll as getAllDjs, type DJ } from '$lib/djController';
import { getAll as getAllPromos, type Promotion } from '$lib/promotionsController';
import { getSingle as getSingleFile } from '$lib/fileController';

export const load: PageLoad = async ({ params }) => {
	const real_name = decodeURI(params.slug);
	let event_data;
	try {
		event_data = await getSingleEvent(real_name);
	} catch (e) {
		error(404, `Event ${real_name} not found.`);
	}
	if (event_data === undefined) error(404, `Event ${real_name} not found.`);

	let dj_data = (await getAllDjs()) || [];
	let promo_data = (await getAllPromos()) || [];

	const dj_map: Map<string, DJ> = new Map(dj_data.map((dj) => [dj.name, dj])) || new Map();
	const promo_map: Map<string, Promotion> =
		new Map(promo_data.map((promo) => [promo.name, promo])) || new Map();

	let dj_errors_promise: Promise<string | undefined>[] = [];
	let promo_errors_promise: Promise<string | undefined>[] = [];

	if (dj_data.length > 0) {
		dj_errors_promise = event_data.djs.map(async (event_dj) => {
			const dj = dj_map.get(event_dj.name);
			if (!dj) return `${event_dj.name}: Does not exist.`;
			if (event_dj.is_live) {
				if (!dj.rtmp_key && !dj.rtmp_server)
					return `${dj.name}: Live DJ missing RTMP Server and Key`;
				if (!dj.rtmp_key) return `${dj.name}: Live DJ missing RTMP Key`;
				if (!dj.rtmp_server) return `${dj.name}: Live DJ missing RTMP Server`;
			} else {
				if (!dj.recording) return `${dj.name}: Pre-recorded DJ no recording set.`;
				const dj_rec_file = await getSingleFile(dj.recording);
				if (!dj_rec_file) return `${dj.name}: Pre-recorded DJ Invalid file name for recording.`;
				if (!dj_rec_file.file_path && !dj_rec_file.url_path)
					return `${dj.name}: Pre-recorded DJ recording does not have a designated file.`;
			}
		});
	}

	if (promo_data.length > 0) {
		promo_errors_promise = event_data.promos.map(async (event_promo) => {
			const promo = promo_map.get(event_promo);
			if (!promo) return `${event_promo}: Does not exist.`;
			if (promo.promo_file) {
				const promo_recording = await getSingleFile(promo.promo_file);
				if (!promo_recording) return `${event_promo}: Promotion invalid file name.`;
				if (!promo_recording.file_path && !promo_recording.url_path)
					return `${event_promo}: Promotion recording does not have a designated file.`;
			} else {
				return `${event_promo}: Promotion missing file.`;
			}
		});
	}

	return {
		event: event_data,
		djs: dj_data,
		promotions: promo_data,
		dj_errors_promise,
		promo_errors_promise
	};
};
