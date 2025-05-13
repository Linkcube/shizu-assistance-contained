import { openapiGet, openapiPostBody, openapiDelete } from './utils';

/**
 * Represents a DJ object containing all properties.
 * @typedef {Object} DJ
 * @property {string} name - The name of the DJ.
 * @property {string|null} logo - URL for the DJ's logo, can be null.
 * @property {string} rtmp_server - The RTMP server URL for the DJ.
 * @property {string} rtmp_key - The key used on the RTMP server.
 * @property {string} public_name - A public name or alias of the DJ.
 * @property {string} discord_id - The Discord ID associated with this DJ.
 */
export interface DJ {
	name: string;
	logo: string | null;
	rtmp_server: string;
	rtmp_key: string;
	public_name: string;
	discord_id: string;
}

export interface DjEvent {
	event: string;
	is_live: boolean;
	vj: string;
	date: string;
}

/**
 * Represents a minimal DJ object containing some properties.
 * @typedef {Object} DjMin
 * @property {string} name - The name of the DJ.
 * @property {string} logo - URL for the DJ's logo.
 * @property {string} rtmp_server - The RTMP server URL for the DJ.
 */
export interface DjMin {
	name: string;
	logo: string;
	rtmp_server: string;
}

/**
 * Fetches all DJs from the API.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Promise<DJ[]>} Array of DJ objects.
 */
export async function getAll(fetch_fn?: typeof fetch): Promise<DJ[]> {
	if (fetch_fn) return await openapiGet('dj/', undefined, fetch_fn);
	return await openapiGet('dj/');
}

/**
 * Fetches minimal DJ data from the API.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Promise<DjMin[]>} Array of DjMin objects.
 */
export async function getMin(fetch_fn?: typeof fetch): Promise<DjMin[]> {
	if (fetch_fn) return await openapiGet('dj/min', undefined, fetch_fn);
	return await openapiGet('dj/min');
}

/**
 * Fetches a single DJ by its name from the API.
 * @param {string} dj_name - The name of the DJ to fetch.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Promise<DJ|undefined>} A DJ object if found, otherwise undefined.
 */
export async function getSingle(dj_name: string, fetch_fn?: typeof fetch): Promise<DJ | undefined> {
	if (fetch_fn) return await openapiGet('dj/' + dj_name, undefined, fetch_fn);
	return await openapiGet('dj/' + dj_name);
}

/**
 * Fetches events for a DJ by its name from the API.
 * @param {string} dj_name - The name of the DJ to fetch.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Promise<DjEvent[]>} A list of DjEvent objects.
 */
export async function getSingleEvents(
	dj_name: string,
	fetch_fn?: typeof fetch
): Promise<DjEvent[]> {
	if (fetch_fn) return await openapiGet('dj/' + dj_name + '/events', undefined, fetch_fn);
	return await openapiGet('dj/' + dj_name + '/events');
}

/**
 * Adds a new DJ to the API.
 * @param {string} name - The name of the DJ to add.
 * @returns {Promise<DJ|undefined>} A DJ object if successful, otherwise undefined.
 */
export async function addSingle(name: string): Promise<DJ | undefined> {
	const body = {
		name: name
	};

	return await openapiPostBody('dj', body);
}

/**
 * Updates an existing DJ in the API with optional properties.
 * @param {string} name - The name of the DJ to update.
 * @param {string|null} logo - URL for the DJ's updated logo, can be null.
 * @param {string|null} recording - URL for the updated recording by this DJ, can be null.
 * @param {string} rtmp_server - The updated RTMP server URL for the DJ.
 * @param {string} rtmp_key - The updated key used on the RTMP server.
 * @param {string} public_name - The updated public name or alias of the DJ.
 * @param {string} discord_id - The updated Discord ID associated with this DJ.
 * @returns {Promise<DJ|undefined>} A DJ object if successful, otherwise undefined.
 */
export async function updateSingle(
	name: string,
	logo: string | null,
	rtmp_server: string,
	rtmp_key: string,
	public_name: string,
	discord_id: string
): Promise<DJ | undefined> {
	const body = {
		logo: logo,
		rtmp_server: rtmp_server,
		rtmp_key: rtmp_key,
		public_name: public_name,
		discord_id: discord_id
	};

	return await openapiPostBody('dj/' + name, body);
}

/**
 * Deletes a DJ by its name from the API.
 * @param {string} dj_name - The name of the DJ to delete.
 * @returns {Promise<void>} Resolves when the deletion is complete.
 */
export async function deleteSingle(dj_name: string) {
	return await openapiDelete('dj/' + dj_name);
}
