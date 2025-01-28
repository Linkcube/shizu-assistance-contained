import { openapiGet, openapiPostBody, openapiDelete } from './utils';

export interface Promotion {
	name: string;
	promo_file: string;
}

export interface PromotionMin {
	name: string;
}

export async function getAll(fetch_fn?: typeof fetch): Promise<Promotion[]> {
	if (fetch_fn) return await openapiGet('promo/', undefined, fetch_fn);
	return await openapiGet('promo/');
}

export async function getMin(fetch_fn?: typeof fetch): Promise<PromotionMin[]> {
	if (fetch_fn) return await openapiGet('promo/min', undefined, fetch_fn);
	return await openapiGet('promo/min');
}

export async function getSingle(
	promo_name: string,
	fetch_fn?: typeof fetch
): Promise<Promotion | undefined> {
	if (fetch_fn) return await openapiGet('promo/' + promo_name, undefined, fetch_fn);
	return await openapiGet('promo/' + promo_name);
}

export async function addSingle(name: string): Promise<Promotion | undefined> {
	const body = { name };
	return await openapiPostBody('promo', body);
}

export async function updateSingle(
	name: string,
	promo_file: string
): Promise<Promotion | undefined> {
	const body = { name, promo_file };
	return await openapiPostBody('promo/' + name, body);
}

export async function deleteSingle(name: string) {
	return await openapiDelete('promo/' + name);
}
