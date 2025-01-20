import { openapiGet, openapiPostBody, openapiDelete } from './utils';

export interface File {
	name: string;
	root: 'LOGOS' | 'RECORDINGS' | 'THEMES';
	file_path: string;
	url_path: string;
}

export async function getAllLogos() {
	return await openapiGet('file/logos');
}

export async function getAllRecordings() {
	return await openapiGet('file/recordings');
}

export async function getAllThemes() {
	return await openapiGet('file/themes');
}

export async function getSingle(file_name: string): Promise<File> {
	return await openapiGet(`file/${file_name}`);
}
