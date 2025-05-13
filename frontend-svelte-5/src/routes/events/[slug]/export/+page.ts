import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getExportSummary } from '$lib/eventController';
import { type DJ } from '$lib/djController';
import { type Promotion } from '$lib/promotionsController';
import { type File } from '$lib/fileController';

export const load: PageLoad = async ({ fetch, params }) => {
	const real_name = decodeURI(params.slug);

	let export_summary;
	try {
		export_summary = await getExportSummary(real_name, fetch);
	} catch (e) {
		error(404, `Event ${real_name} not found.`);
	}
	if (export_summary === undefined) error(404, `Event ${real_name} not found.`);

	const dj_map: Map<string, DJ> =
		new Map(export_summary.djs.map((dj) => [dj.name, dj])) || new Map();
	const promo_map: Map<string, Promotion> =
		new Map(export_summary.promos.map((promo) => [promo.name, promo])) || new Map();
	const files_map: Map<string, File> =
		new Map(export_summary.files.map((file) => [file.name, file])) || new Map();

	let dj_errors_promise: string[] = [];
	let promo_errors_promise: string[] = [];
	let theme_errors: string[] = [];

	if (export_summary.djs.length > 0) {
		dj_errors_promise = export_summary.event.djs
			.map((event_dj) => {
				const dj = dj_map.get(event_dj.name);
				if (!dj) return `${event_dj.name}: Does not exist.`;
				if (event_dj.is_live) {
					if (!dj.rtmp_key && !dj.rtmp_server)
						return `${dj.name}: Live DJ missing RTMP Server and Key`;
					if (!dj.rtmp_key) return `${dj.name}: Live DJ missing RTMP Key`;
					if (!dj.rtmp_server) return `${dj.name}: Live DJ missing RTMP Server`;
				} else {
					if (!event_dj.recording) return `${dj.name}: Pre-recorded DJ no recording set.`;
					const dj_rec_file = files_map.get(event_dj.recording);
					if (!dj_rec_file) return `${dj.name}: Pre-recorded DJ Invalid file name for recording.`;
					if (!dj_rec_file.file_path && !dj_rec_file.url_path)
						return `${dj.name}: Pre-recorded DJ recording does not have a designated file.`;
				}
			})
			.filter((error) => error !== undefined);
	}

	if (export_summary.promos.length > 0) {
		promo_errors_promise = export_summary.event.promos
			.map((event_promo) => {
				const promo = promo_map.get(event_promo);
				if (!promo) return `${event_promo}: Does not exist.`;
				if (promo.promo_file) {
					const promo_recording = files_map.get(promo.promo_file);
					if (!promo_recording) return `${event_promo}: Promotion invalid file name.`;
					if (!promo_recording.file_path && !promo_recording.url_path)
						return `${event_promo}: Promotion recording does not have a designated file.`;
				} else {
					return `${event_promo}: Promotion missing file.`;
				}
			})
			.filter((error) => error !== undefined);
	}

	if (export_summary.theme) {
		if (export_summary.theme.starting_file) {
			let starting_file = files_map.get(export_summary.theme.starting_file);
			if (starting_file === undefined) {
				theme_errors.push(`${export_summary.theme.name}: Invalid file name for Opening.`);
			} else if (!starting_file.file_path && !starting_file.url_path) {
				theme_errors.push(`${export_summary.theme.name}: Opening does not have a designated file.`);
			}
		}
		if (export_summary.theme.ending_file) {
			let ending_file = files_map.get(export_summary.theme.ending_file);
			if (ending_file === undefined) {
				theme_errors.push(`${export_summary.theme.name}: Invalid file name for Ending.`);
			} else if (!ending_file.file_path && !ending_file.url_path) {
				theme_errors.push(`${export_summary.theme.name}: Ending does not have a designated file.`);
			}
		}
		if (export_summary.theme.overlay_file) {
			let overlay_file = files_map.get(export_summary.theme.overlay_file);
			if (overlay_file === undefined) {
				theme_errors.push(`${export_summary.theme.name}: Invalid file name for Overlay.`);
			} else if (!overlay_file.file_path && !overlay_file.url_path) {
				theme_errors.push(`${export_summary.theme.name}: Overlay does not have a designated file.`);
			}
		}
	}

	return {
		event: export_summary.event,
		djs: export_summary.djs,
		promotions: export_summary.promos,
		files: export_summary.files,
		dj_errors_promise,
		promo_errors_promise,
		theme: export_summary.theme,
		theme_errors
	};
};
