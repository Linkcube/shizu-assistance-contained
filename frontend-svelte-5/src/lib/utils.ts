import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { writable } from 'svelte/store';
import { page } from '$app/state';
import { building, dev } from '$app/environment';

/**
 * Represents an error message object containing status information.
 * @interface ErrorMessage
 * @property {number} statusCode - The HTTP status code of the error.
 * @property {string} message - A brief description of the error.
 * @property {string} errorType - The type of error, typically the status text from the response.
 */
export interface ErrorMessage {
	statusCode: number;
	message: string;
	errorType: string;
}

/**
 * Represents an item in a lineup with selectable properties.
 * @interface LineupItem
 * @property {string} name - The name of the lineup item.
 * @property {boolean} selected - Indicates whether the item is selected or not.
 */
export interface LineupItem {
	name: string;
	selected: boolean;
}

// Commenting these out as their references have been replaced with location.hostname, which needs to be called after a page is loaded.
/**
 * The base URL of the server.
 * @type {string}
 */
// export let serverUrl = 'http://localhost:4004';
/**
 * The base URL for static assets, typically the same as the server URL.
 * @type {string}
 */
// export let staticAssetsBase = 'http://localhost:4004';
/**
 * The base URL for OpenAPI requests including protocol and hostname.
 * @type {string}
 */
// const openapiUrl = `${serverUrl}/openapi`;

/**
 * A function to merge class names with Tailwind CSS classes.
 * @param {...ClassValue[]} inputs - An array of class values that can be strings or objects with conditions.
 * @returns {string} - A merged class name string suitable for use in HTML elements.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * A writable Svelte store to manage error messages.
 * @type {Writable<ErrorMessage>}
 */
export const error_stack = writable({} as ErrorMessage);
/**
 * A writable Svelte store to log multiple messages.
 * @type {Writable<ErrorMessage[]>}
 */
export const log = writable([] as ErrorMessage[]);

/**
 * Helper function to push an error message to the error stack and log.
 * @param {ErrorMessage} error - The error message object to be pushed.
 */
const errorStackPushHelper = (error: ErrorMessage) => {
	error_stack.set(error);
	log.update((log_val) => {
		log_val.push(error);
		return log_val;
	});
};

/**
 * Function to push a new error message to the log.
 * @param {ErrorMessage} message - The error message object to be added to the log.
 */
export const pushToLog = (message: ErrorMessage) => {
	log.update((log_val) => {
		log_val.push(message);
		return log_val;
	});
};

/**
 * An array of RTMP server objects, each with an ID and name.
 * @type {Array<{id: string, name: string}>}
 */
export const RTMP_SERVERS = [
	{ id: '', name: 'Unset' },
	{ id: 'us-west', name: 'US West' },
	{ id: 'us-east', name: 'US East' },
	{ id: 'jp', name: 'Japan' },
	{ id: 'europe', name: 'Europe' }
];

/**
 * Function to check if a given source path is an image based on its extension.
 * @param {string} source_path - The path of the file or resource.
 * @returns {boolean} - True if the path matches common image extensions, otherwise false.
 */
export function isImageSource(source_path: string) {
	return source_path.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

export function getFileName(file_path: string) {
	return file_path.split('/')[file_path.split('/').length - 1];
}

/**
 * Generic function to perform a GET request using OpenAPI.
 * @param {string} url - The endpoint URL within the API.
 * @param {boolean} [bubble_error=true] - Whether to bubble up errors as exceptions.
 * @param {function} [fetch_fn=fetch] - The fetch function to use, useful for testing or custom environments.
 * @returns {Promise<any>} - A promise that resolves with the JSON response on success, rejects otherwise.
 */
export async function openapiGet(url: string, bubble_error = true, fetch_fn = fetch) {
	const request = fetch_fn(`http://${location.hostname}:4004/openapi/${url}`, {
		method: 'GET'
	});

	const response = await request;
	if (response.ok) {
		return await response.json();
	}
	if (bubble_error) return parseOpenapiError(response);
}

export async function openapiGetReponse(url: string) {
	const request = fetch(`http://${location.hostname}:4004/openapi/${url}`, {
		method: 'GET'
	});
	const response = await request;
	return response.ok;
}

/**
 * Function to perform a POST request using OpenAPI with a body.
 * @param {string} url - The endpoint URL within the API.
 * @param {Object} body - The data object to be sent in the body of the POST request.
 * @returns {Promise<any>} - A promise that resolves with the JSON response on success, rejects otherwise.
 */
export async function openapiPostBody(url: string, body: {}) {
	const request = fetch(`http://${location.hostname}:4004/openapi/${url}`, {
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

/**
 * Function to perform a simple POST request using OpenAPI without a body.
 * @param {string} url - The endpoint URL within the API.
 * @returns {Promise<boolean>} - A promise that resolves with true on success, rejects otherwise.
 */
export async function openapiPost(url: string) {
	const request = fetch(`http://${location.hostname}:4004/openapi/${url}`, {
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

/**
 * Function to perform a DELETE request using OpenAPI.
 * @param {string} url - The endpoint URL within the API.
 * @returns {Promise<boolean>} - A promise that resolves with true on success, rejects otherwise.
 */
export async function openapiDelete(url: string) {
	const request = fetch(`http://${location.hostname}:4004/openapi/${url}`, {
		method: 'DELETE'
	});
	const response = await request;
	if (!response.ok) {
		parseOpenapiError(response);
	}
	return response.ok;
}

/**
 * Helper function to parse and handle OpenAPI errors.
 * @param {Response} response - The fetch response object that encountered an error.
 */
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
