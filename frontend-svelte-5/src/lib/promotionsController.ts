import { openapiGet, openapiPostBody, openapiDelete } from './utils';

export interface Promotion {
	name: string;
	promo_file: string;
}

export async function getAll(): Promise<Promotion[] | undefined> {
	return await openapiGet('promo/');
}

export async function getSingle(promo_name: string): Promise<Promotion | undefined> {
	return await openapiGet('promo/' + promo_name);
}

export async function addSingle(name: string, promo_file: string): Promise<Promotion | undefined> {
	const body = { name, promo_file };
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
