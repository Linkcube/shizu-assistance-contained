import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { writable } from 'svelte/store';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// const serverUrl = `${page.url.protocol}//${page.url.hostname}:4004`;
// export const staticAssetsBase = `${page.url.protocol}//${page.url.hostname}:4004`;
const serverUrl = 'http://localhost:4004';
export const staticAssetsBase = 'http://localhost:4004';
const openapiUrl = `${serverUrl}/openapi`;

export interface ErrorMessage {
	statusCode: number;
	message: string;
	errorType: string;
}

export interface LineupItem {
	name: string;
	selected: boolean;
}

export const error_stack = writable({} as ErrorMessage);
export const log = writable([] as ErrorMessage[]);

const errorStackPushHelper = (error: ErrorMessage) => {
	error_stack.set(error);
	log.update((log_val) => {
		log_val.push(error);
		return log_val;
	});
};

export const pushToLog = (message: ErrorMessage) => {
	log.update((log_val) => {
		log_val.push(message);
		return log_val;
	});
};

export const RTMP_SERVERS = [
	{ id: '', name: 'Unset' },
	{ id: 'us-west', name: 'US West' },
	{ id: 'us-east', name: 'US East' },
	{ id: 'jp', name: 'Japan' },
	{ id: 'europe', name: 'Europe' }
];

export function isImageSource(source_path: string) {
	return source_path.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

export async function openapiGet(url: string, bubble_error = true, fetch_fn = fetch) {
	const request = fetch_fn(`${openapiUrl}/${url}`, {
		method: 'GET'
	});

	const response = await request;
	if (response.ok) {
		return await response.json();
	}
	if (bubble_error) return parseOpenapiError(response);
}

export async function openapiPostBody(url: string, body: {}) {
	const request = fetch(`${openapiUrl}/${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	const response = await request;
	if (response.ok) {
		try {
			return await response.json();
		} catch (e) {
			return false;
		}
	}
	parseOpenapiError(response);

	return false;
}

export async function openapiPost(url: string) {
	const request = fetch(`${openapiUrl}/${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({})
	});

	const response = await request;
	if (response.ok) {
		return true;
	}
	parseOpenapiError(response);

	return false;
}

export async function openapiDelete(url: string) {
	const request = fetch(`${openapiUrl}/${url}`, {
		method: 'DELETE'
	});
	const response = await request;
	if (!response.ok) {
		parseOpenapiError(response);
	}
	return response.ok;
}

async function parseOpenapiError(response: Response) {
	console.log(response);
	const jsonbody = await response.json();
	console.log(jsonbody);
	errorStackPushHelper({
		statusCode: response.status,
		message: jsonbody.message,
		errorType: response.statusText
	});

	return Promise.reject();
}
