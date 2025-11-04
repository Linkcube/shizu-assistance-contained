import { openapiGet, openapiPostBody, openapiDelete } from './utils';

/**
 * Represents an RTMP Zone.
 * @typedef {Object} RTMP_Zone
 * @property {string} id - ID used when generating an RTMP stream.
 * @property {string} name - The display name of the RTMP zone.
 */
export interface RTMP_Zone {
	id: string;
	name: string;
}

/**
 * Represents RTMP Data.
 * @typedef {Object} RTMP_Data
 * @property {string} rtmp_server - Formatting string used to generate DJ urls.
 * @property {RTMP_Zone[]} rtmp_zones - List of available RTMP zones configured.
 */
export interface RTMP_Data {
	rtmp_server: string;
	rtmp_zones: RTMP_Zone[];
}

/**
 * Represents version data.
 * @typedef {Object} Version_Data
 * @property {string} version - Version string for the currently running shizu-assistance.
 */
export interface Version_Data {
	version: string;
}

/**
 * Fetches version data from the API.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Version_Data>} Version data object.
 */
export async function getVersion(fetch_fn?: typeof fetch): Promise<Version_Data> {
	if (fetch_fn) return await openapiGet('settings/version/', undefined, fetch_fn);
	return await openapiGet('settings/version/');
}

/**
 * Fetches RTMP data from the API.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {RTMP_Data>} RTMP data object.
 */
export async function getRTMP(fetch_fn?: typeof fetch): Promise<RTMP_Data> {
	if (fetch_fn) return await openapiGet('settings/rtmp/', undefined, fetch_fn);
	return await openapiGet('settings/rtmp/');
}
