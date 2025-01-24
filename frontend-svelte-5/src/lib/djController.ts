import { openapiGet, openapiPostBody, openapiDelete } from './utils';

export interface DJ {
	name: string;
	logo: string;
	recording: string;
	rtmp_server: string;
	rtmp_key: string;
	public_name: string;
	discord_id: string;
}

export interface DjMin {
	name: string;
	logo: string;
	recording: string;
	rtmp_server: string;
}

export async function getAll(): Promise<DJ[] | undefined> {
	return await openapiGet('dj/');
}

export async function getMin(): Promise<DjMin[] | undefined> {
	return await openapiGet('dj/min');
}

export async function getSingle(dj_name: string): Promise<DJ | undefined> {
	return await openapiGet('dj/' + dj_name);
}

export async function addSingle(name: string): Promise<DJ | undefined> {
	const body = {
		name: name
	};

	return await openapiPostBody('dj', body);
}

export async function updateSingle(
	name: string,
	logo: string,
	recording: string,
	rtmp_server: string,
	rtmp_key: string,
	public_name: string,
	discord_id: string
): Promise<DJ | undefined> {
	const body = {
		logo: logo,
		recording: recording,
		rtmp_server: rtmp_server,
		rtmp_key: rtmp_key,
		public_name: public_name,
		discord_id: discord_id
	};

	return await openapiPostBody('dj/' + name, body);
}

export async function deleteSingle(dj_name: string) {
	return await openapiDelete('dj/' + dj_name);
}
