import { openapiGet, openapiPostBody, openapiDelete } from './utils';

/**
 * Represents a Promotion object containing name and promo_file properties.
 * @typedef {Object} Promotion
 * @property {string} name - The name of the promotion.
 * @property {string|null} promo_file - File associated with the promotion, can be null.
 */
export interface Promotion {
	name: string;
	promo_file: string | null;
}

/**
 * Represents a minimal Promotion object containing only the name property.
 * @typedef {Object} PromotionMin
 * @property {string} name - The name of the promotion.
 */
export interface PromotionMin {
	name: string;
}

/**
 * Fetches all promotions from the API.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Promise<Promotion[]>} Array of Promotion objects.
 */
export async function getAll(fetch_fn?: typeof fetch): Promise<Promotion[]> {
	if (fetch_fn) return await openapiGet('promo/', undefined, fetch_fn);
	return await openapiGet('promo/');
}

/**
 * Fetches minimal promotion data from the API.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Promise<PromotionMin[]>} Array of PromotionMin objects.
 */
export async function getMin(fetch_fn?: typeof fetch): Promise<PromotionMin[]> {
	if (fetch_fn) return await openapiGet('promo/min', undefined, fetch_fn);
	return await openapiGet('promo/min');
}

/**
 * Fetches a single promotion by its name from the API.
 * @param {string} promo_name - The name of the promotion to fetch.
 * @param {typeof fetch} [fetch_fn] - Optional custom fetch function for testing purposes.
 * @returns {Promise<Promotion|undefined>} A Promotion object or undefined if not found.
 */
export async function getSingle(
	promo_name: string,
	fetch_fn?: typeof fetch
): Promise<Promotion | undefined> {
	if (fetch_fn) return await openapiGet('promo/' + promo_name, undefined, fetch_fn);
	return await openapiGet('promo/' + promo_name);
}

/**
 * Adds a new promotion to the API.
 * @param {string} name - The name of the promotion to add.
 * @returns {Promise<Promotion|undefined>} A Promotion object if successful, otherwise undefined.
 */
export async function addSingle(name: string): Promise<Promotion | undefined> {
	const body = { name };
	return await openapiPostBody('promo', body);
}

/**
 * Updates an existing promotion in the API.
 * @param {string} name - The name of the promotion to update.
 * @param {string|null} promo_file - File associated with the promotion, can be null.
 * @returns {Promise<Promotion|undefined>} A Promotion object if successful, otherwise undefined.
 */
export async function updateSingle(
	name: string,
	promo_file: string | null
): Promise<Promotion | undefined> {
	const body = { name, promo_file };
	return await openapiPostBody('promo/' + name, body);
}

/**
 * Deletes a promotion by its name from the API.
 * @param {string} name - The name of the promotion to delete.
 * @returns {Promise<void>} Resolves when the deletion is complete.
 */
export async function deleteSingle(name: string) {
	return await openapiDelete('promo/' + name);
}
