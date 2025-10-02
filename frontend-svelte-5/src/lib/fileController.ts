import { openapiGet, openapiPostBody, openapiDelete, openapiGetReponse } from './utils';

/**
 * Represents a file object with various properties.
 * @interface File
 * @property {string} name - The name of the file.
 * @property {'LOGOS' | 'RECORDINGS' | 'THEMES'} root - The root directory where the file is stored.
 * @property {string} file_path - The path to the file on the server.
 * @property {string} url_path - The URL path for accessing the file.
 */
export interface File {
	name: string;
	root: 'LOGOS' | 'RECORDINGS' | 'THEMES';
	file_path: string | null;
	url_path: string | null;
}

/**
 * Represents a local file object with basic information.
 * @interface LocalFile
 * @property {string} name - The name of the file.
 * @property {string} ext - The extension of the file.
 * @property {boolean} is_dir - Indicates if the file is a directory.
 */
export interface LocalFile {
	name: string;
	ext: string;
	is_dir: boolean;
}

/**
 * Represents permissions for accessing files and directories.
 * @interface Permissions
 * @property {LocalFile[]} files - An array of local file objects.
 * @property {string[]} path - An array of directory paths.
 * @property {string} top_dir - The top-level directory name.
 */
export interface Permissions {
	files: LocalFile[];
	path: string[];
	top_dir: string;
}

/**
 * Retrieves all logos from the server.
 * @async
 * @returns {Promise<File[]>} A promise that resolves to an array of File objects representing logos.
 */
export async function getAllLogos(): Promise<File[]> {
	return await openapiGet('file/logos');
}

/**
 * Retrieves all recordings from the server.
 * @async
 * @returns {Promise<File[]>} A promise that resolves to an array of File objects representing recordings.
 */
export async function getAllRecordings(): Promise<File[]> {
	return await openapiGet('file/recordings');
}

/**
 * Retrieves all themes from the server.
 * @async
 * @returns {Promise<File[]>} A promise that resolves to an array of File objects representing themes.
 */
export async function getAllThemes(): Promise<File[]> {
	return await openapiGet('file/themes');
}

/**
 * Retrieves a single file by its name.
 * @async
 * @param {string} file_name - The name of the file to retrieve.
 * @returns {Promise<File>} A promise that resolves to a File object representing the file.
 */
export async function getSingle(file_name: string): Promise<File> {
	return await openapiGet(`file/${file_name}`);
}

/**
 * Checks if getting a file returns an error or not.
 * @async
 * @param {string} file_name - The name of the file to retrieve.
 * @returns {Promise<boolean>} A promise that resolves to a whether the file is found.
 */
export async function fileExists(file_name: string): Promise<boolean> {
	return await openapiGetReponse(`file/${file_name}`);
}

/**
 * Helper function to retrieve permissions for files and directories, including subdirectories.
 * @param {string} url - The base URL for the request.
 * @param {string[]} sub_dirs - An array of subdirectory names.
 * @returns {Promise<Permissions>} A promise that resolves to a Permissions object.
 */
const filePermissionsHelper = (url: string, sub_dirs: string[]): Promise<Permissions> => {
	if (sub_dirs.length > 0) {
		url += '/' + encodeURIComponent(sub_dirs.join('/'));
	}
	return openapiGet(url);
};

/**
 * Retrieves permissions for logos, storing the last accessed path in localStorage.
 * @async
 * @param {string[]} sub_dirs - An array of subdirectory names.
 * @returns {Promise<Permissions>} A promise that resolves to a Permissions object.
 */
export const getLogoPermissions = async (sub_dirs: string[]) => {
	localStorage.setItem('last_logo_path', JSON.stringify(sub_dirs));
	return await filePermissionsHelper('file/logo-permissions', sub_dirs);
};

/**
 * Retrieves permissions for recordings, storing the last accessed path in localStorage.
 * @async
 * @param {string[]} sub_dirs - An array of subdirectory names.
 * @returns {Promise<Permissions>} A promise that resolves to a Permissions object.
 */
export const getRecordingPermissions = async (sub_dirs: string[]) => {
	localStorage.setItem('last_recording_path', JSON.stringify(sub_dirs));
	return await filePermissionsHelper('file/recording-permissions', sub_dirs);
};

/**
 * Retrieves permissions for themes, storing the last accessed path in localStorage.
 * @async
 * @param {string[]} sub_dirs - An array of subdirectory names.
 * @returns {Promise<Permissions>} A promise that resolves to a Permissions object.
 */
export const getThemePermissions = async (sub_dirs: string[]) => {
	localStorage.setItem('last_theme_path', JSON.stringify(sub_dirs));
	return await filePermissionsHelper('file/theme-permissions', sub_dirs);
};

/**
 * Adds a new logo file to the server.
 * @async
 * @param {string} name - The name of the file.
 * @param {string} [file_path] - Optional file path on the server.
 * @param {string} [url_path] - Optional URL path for accessing the file.
 * @returns {Promise<File>} A promise that resolves to a File object representing the new logo file.
 */
export const addLogoFile = async (
	name: string,
	file_path?: string | null,
	url_path?: string | null
): Promise<File> => {
	const body = {
		name: name,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/logos', body);
};

/**
 * Adds a new recording file to the server.
 * @async
 * @param {string} name - The name of the file.
 * @param {string} [file_path] - Optional file path on the server.
 * @param {string} [url_path] - Optional URL path for accessing the file.
 * @returns {Promise<File>} A promise that resolves to a File object representing the new recording file.
 */
export const addRecordingFile = async (
	name: string,
	file_path?: string | null,
	url_path?: string | null
): Promise<File> => {
	const body = {
		name: name,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/recordings', body);
};

/**
 * Adds a new theme file to the server.
 * @async
 * @param {string} name - The name of the file.
 * @param {string} [file_path] - Optional file path on the server.
 * @param {string} [url_path] - Optional URL path for accessing the file.
 * @returns {Promise<File>} A promise that resolves to a File object representing the new theme file.
 */
export const addThemeFile = async (
	name: string,
	file_path?: string,
	url_path?: string
): Promise<File> => {
	const body = {
		name: name,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/themes', body);
};

/**
 * Updates an existing file's information on the server.
 * @async
 * @param {string} name - The name of the file to update.
 * @param {string} root - The new root directory for the file.
 * @param {string} file_path - The new file path on the server.
 * @param {string} url_path - The new URL path for accessing the file.
 * @returns {Promise<File>} A promise that resolves to a File object representing the updated file.
 */
export const updateSingleFile = async (
	name: string,
	root: string,
	file_path: string | null,
	url_path: string | null
): Promise<File> => {
	const body = {
		root: root,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/' + name, body);
};

/**
 * Deletes a single file from the server.
 * @async
 * @param {string} name - The name of the file to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful, otherwise false.
 */
export const deleteSingleFile = async (name: string): Promise<boolean> => {
	return await openapiDelete('file/' + name);
};
