import type { DJ } from './djController';
import type { File } from './fileController';
import type { Promotion } from './promotionsController';
import type { Theme } from './themeController';
import { openapiGet, openapiPostBody, openapiDelete, openapiPost } from './utils';

export interface EventDj {
	name: string;
	is_live: boolean;
	vj: string;
}

export interface Event {
	name: string;
	djs: EventDj[];
	promos: string[];
	theme: string;
	public: boolean;
	date: string;
	start_time: string;
}

export interface ExportSummary {
	event: Event;
	djs: DJ[];
	promos: Promotion[];
	theme: Theme | undefined;
	files: File[];
}

export async function getAll(): Promise<Event[]> {
	return await openapiGet('event');
}

export async function getMin(): Promise<Event[]> {
	return await openapiGet('event/min');
}

export async function getSingle(name: string): Promise<Event | undefined> {
	return await openapiGet('event/' + name);
}

export async function addSingle(name: string): Promise<Event | undefined> {
	return await openapiPostBody('event', { name: name });
}

export async function updateSingle(event: Event): Promise<Event | undefined> {
	const body = {
		djs: event.djs,
		promos: event.promos,
		theme: event.theme,
		public: event.public,
		date: event.date,
		start_time: event.start_time
	};
	return await openapiPostBody(`event/${event.name}`, body);
}

export async function updateSingleDateTime(
	name: string,
	date: string,
	start_time: string
): Promise<Event | undefined> {
	const body = {
		date: date,
		start_time: start_time
	};
	return await openapiPostBody(`event/${name}/dateTime`, body);
}

export async function updateSingleTheme(name: string, theme: string): Promise<Event | undefined> {
	return await openapiPostBody(`event/${name}/set-theme`, { name: theme });
}

export async function addEventDj(name: string, dj_name: string): Promise<Event | undefined> {
	const body = {
		name: dj_name,
		is_live: false
	};
	return await openapiPostBody(`event/${name}/dj`, body);
}

export async function updateEventDj(name: string, dj: EventDj): Promise<Event | undefined> {
	const body = {
		is_live: dj.is_live,
		vj: dj.vj
	};
	return await openapiPostBody(`event/${name}/dj/${dj.name}`, body);
}

export async function moveEventDj(
	name: string,
	index_a: number,
	index_b: number
): Promise<Event | undefined> {
	const body = {
		index_a: index_a,
		index_b: index_b
	};

	return await openapiPostBody(`event/${name}/move-dj`, body);
}

export async function deleteEventDj(name: string, dj_name: string) {
	return await openapiDelete(`event/${name}/dj/${dj_name}`);
}

export async function addEventPromotion(
	name: string,
	promo_name: string
): Promise<Event | undefined> {
	return await openapiPostBody(`event/${name}/promo`, { name: promo_name });
}

export async function moveEventPromotion(
	name: string,
	index_a: number,
	index_b: number
): Promise<Event | undefined> {
	const body = {
		index_a: index_a,
		index_b: index_b
	};

	return await openapiPostBody(`event/${name}/move-promo`, body);
}

export async function deleteEventPromotion(name: string, promo_name: string) {
	return await openapiDelete(`event/${name}/promo/${promo_name}`);
}

export async function deleteSingle(name: string) {
	return await openapiDelete(`event/${name}`);
}

export async function exportSingle(name: string): Promise<boolean> {
	const response = await openapiPost(`event/${name}/export`);
	return response;
}

export async function getExportSummary(name: string): Promise<ExportSummary | undefined> {
	return await openapiGet('event/' + name + '/export-summary');
}
