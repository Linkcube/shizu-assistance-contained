import type { DJ } from './djController';
import type { File } from './fileController';
import type { Promotion } from './promotionsController';
import type { Theme } from './themeController';
import { openapiGet, openapiPostBody, openapiDelete, openapiPost } from './utils';

/**
 * Represents a DJ in an event's lineup.
 * @interface EventDj
 * @property {string} name - The name of the DJ.
 * @property {boolean} is_live - Indicates if the DJ is currently live.
 * @property {string} vj - The VJ associated with the DJ.
 * @property {string|null} recording - The recording file associated with the DJ for this event.
 */
export interface EventDj {
	name: string;
	is_live: boolean;
	vj: string;
	recording: string | null;
}

/**
 * Represents an event, including details about DJs, promotions, and theme.
 * @interface Event
 * @property {string} name - The name of the event.
 * @property {EventDj[]} djs - An array of DJ objects for the event.
 * @property {string[]} promos - An array of promotion names associated with the event.
 * @property {string} theme - The theme or genre of the event.
 * @property {boolean} public - Indicates if the event is public and accessible.
 * @property {string} date - The date of the event in 'YYYY-MM-DD' format.
 * @property {string} start_time - The start time of the event in 'HH:MM' format.
 */
export interface Event {
	name: string;
	djs: EventDj[];
	promos: string[];
	theme: string;
	public: boolean;
	date: string;
	start_time: string;
}

/**
 * Represents a summary for exporting an event, including all related data.
 * @interface ExportSummary
 * @property {Event} event - The event details.
 * @property {DJ[]} djs - An array of DJs associated with the event.
 * @property {Promotion[]} promos - An array of promotions associated with the event.
 * @property {Theme | undefined} theme - The theme or genre of the event (if defined).
 * @property {File[]} files - Files related to the event (e.g., flyers, posters).
 */
export interface ExportSummary {
	event: Event;
	djs: DJ[];
	promos: Promotion[];
	theme: Theme | undefined;
	files: File[];
}

/**
 * Fetches all events from the API.
 * @async
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function to use instead of default global fetch.
 * @returns {Promise<Event[]>} A Promise that resolves to an array of Event objects.
 */
export async function getAll(fetch_fn?: typeof fetch): Promise<Event[]> {
	if (fetch_fn) return await openapiGet('event', undefined, fetch_fn);
	return await openapiGet('event');
}

/**
 * Fetches a minimal list of events from the API.
 * @async
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function to use instead of default global fetch.
 * @returns {Promise<Event[]>} A Promise that resolves to an array of Event objects with limited information.
 */
export async function getMin(fetch_fn?: typeof fetch): Promise<Event[]> {
	if (fetch_fn) return await openapiGet('event/min', undefined, fetch_fn);
	return await openapiGet('event/min');
}

/**
 * Fetches a single event by its name.
 * @async
 * @param {string} name - The name of the event to fetch.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function to use instead of default global fetch.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if found, otherwise undefined.
 */
export async function getSingle(name: string, fetch_fn?: typeof fetch): Promise<Event | undefined> {
	if (fetch_fn) return await openapiGet('event/' + name, undefined, fetch_fn);
	return await openapiGet('event/' + name);
}

/**
 * Adds a new event to the API.
 * @async
 * @param {string} name - The name of the event to add.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
export async function addSingle(name: string): Promise<Event | undefined> {
	return await openapiPostBody('event', { name: name });
}

/**
 * Updates the details of a single event in the API.
 * @async
 * @param {Event} event - The Event object containing updated information.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
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

/**
 * Updates the date and start time of a single event in the API.
 * @async
 * @param {string} name - The name of the event to update.
 * @param {string} date - The new date for the event in 'YYYY-MM-DD' format.
 * @param {string} start_time - The new start time for the event in 'HH:MM' format.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
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

/**
 * Updates the theme of a single event in the API.
 * @async
 * @param {string} name - The name of the event to update.
 * @param {string} theme - The new theme for the event.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
export async function updateSingleTheme(name: string, theme: string): Promise<Event | undefined> {
	return await openapiPostBody(`event/${name}/set-theme`, { name: theme });
}

/**
 * Adds a DJ to an event in the API.
 * @async
 * @param {string} name - The name of the event to add the DJ to.
 * @param {string} dj_name - The name of the DJ to be added.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
export async function addEventDj(name: string, dj_name: string): Promise<Event | undefined> {
	const body = {
		name: dj_name,
		is_live: false
	};
	return await openapiPostBody(`event/${name}/dj`, body);
}

/**
 * Updates the details of a DJ in an event.
 * @async
 * @param {string} name - The name of the event.
 * @param {EventDj} dj - The EventDj object containing updated DJ information.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
export async function updateEventDj(name: string, dj: EventDj): Promise<Event | undefined> {
	const body = {
		is_live: dj.is_live,
		vj: dj.vj
	};
	return await openapiPostBody(`event/${name}/dj/${dj.name}`, body);
}

/**
 * Moves a DJ from one position to another in an event's lineup.
 * @async
 * @param {string} name - The name of the event.
 * @param {number} index_a - The current index of the DJ.
 * @param {number} index_b - The new index for the DJ.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
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

/**
 * Deletes a DJ from an event in the API.
 * @async
 * @param {string} name - The name of the event.
 * @param {string} dj_name - The name of the DJ to be deleted.
 * @returns {Promise<void>} A Promise that resolves when the DJ is successfully deleted.
 */
export async function deleteEventDj(name: string, dj_name: string) {
	return await openapiDelete(`event/${name}/dj/${dj_name}`);
}

/**
 * Adds a promotion to an event in the API.
 * @async
 * @param {string} name - The name of the event.
 * @param {string} promo_name - The name of the promotion to add.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
export async function addEventPromotion(
	name: string,
	promo_name: string
): Promise<Event | undefined> {
	return await openapiPostBody(`event/${name}/promo`, { name: promo_name });
}

/**
 * Moves a promotion from one position to another in an event's lineup.
 * @async
 * @param {string} name - The name of the event.
 * @param {number} index_a - The current index of the promotion.
 * @param {number} index_b - The new index for the promotion.
 * @returns {Promise<Event | undefined>} A Promise that resolves to an Event object if successful, otherwise undefined.
 */
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

/**
 * Deletes a promotion from an event in the API.
 * @async
 * @param {string} name - The name of the event.
 * @param {string} promo_name - The name of the promotion to be deleted.
 * @returns {Promise<void>} A Promise that resolves when the promotion is successfully deleted.
 */
export async function deleteEventPromotion(name: string, promo_name: string) {
	return await openapiDelete(`event/${name}/promo/${promo_name}`);
}

/**
 * Deletes a single event from the API by its name.
 * @async
 * @param {string} name - The name of the event to delete.
 * @returns {Promise<void>} A Promise that resolves when the event is successfully deleted.
 */
export async function deleteSingle(name: string) {
	return await openapiDelete(`event/${name}`);
}

/**
 * Triggers the export process for a single event in the API.
 * @async
 * @param {string} name - The name of the event to be exported.
 * @returns {Promise<boolean>} A Promise that resolves to true if the export is successful, otherwise false.
 */
export async function exportSingle(name: string): Promise<boolean> {
	const response = await openapiPost(`event/${name}/export`);
	return response;
}

/**
 * Fetches a summary of an event's data for exporting purposes.
 * @async
 * @param {string} name - The name of the event to fetch the export summary for.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function to use instead of default global fetch.
 * @returns {Promise<ExportSummary | undefined>} A Promise that resolves to an ExportSummary object if successful, otherwise undefined.
 */
export async function getExportSummary(
	name: string,
	fetch_fn?: typeof fetch
): Promise<ExportSummary | undefined> {
	if (fetch_fn) return await openapiGet('event/' + name + '/export-summary', undefined, fetch_fn);
	return await openapiGet('event/' + name + '/export-summary');
}
