import { openapiGet, openapiPostBody, openapiDelete } from './utils';

export interface File {
	name: string;
	root: 'LOGOS' | 'RECORDINGS' | 'THEMES';
	file_path: string;
	url_path: string;
}

export interface LocalFile {
	name: string;
	ext: string;
	is_dir: boolean;
}

export interface Permissions {
	files: LocalFile[];
	path: string[];
	top_dir: string;
}

export async function getAllLogos(): Promise<File[]> {
	return await openapiGet('file/logos');
}

export async function getAllRecordings(): Promise<File[]> {
	return await openapiGet('file/recordings');
}

export async function getAllThemes(): Promise<File[]> {
	return await openapiGet('file/themes');
}

export async function getSingle(file_name: string): Promise<File> {
	return await openapiGet(`file/${file_name}`);
}

const filePermissionsHelper = (url: string, sub_dirs: string[]): Promise<Permissions> => {
	if (sub_dirs.length > 0) {
		url += '/' + encodeURIComponent(sub_dirs.join('/'));
	}
	console.log(url);
	return openapiGet(url);
};

export const getLogoPermissions = async (sub_dirs: string[]) => {
	localStorage.setItem('last_logo_path', JSON.stringify(sub_dirs));
	return await filePermissionsHelper('file/logo-permissions', sub_dirs);
};

export const getRecordingPermissions = async (sub_dirs: string[]) => {
	localStorage.setItem('last_recording_path', JSON.stringify(sub_dirs));
	return await filePermissionsHelper('file/recording-permissions', sub_dirs);
};
export const getThemePermissions = async (sub_dirs: string[]) => {
	localStorage.setItem('last_theme_path', JSON.stringify(sub_dirs));
	return await filePermissionsHelper('file/theme-permissions', sub_dirs);
};

export const addLogoFile = async (
	name: string,
	file_path?: string,
	url_path?: string
): Promise<File> => {
	const body = {
		name: name,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/logos', body);
};

export const addRecordingFile = async (
	name: string,
	file_path?: string,
	url_path?: string
): Promise<File> => {
	const body = {
		name: name,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/recordings', body);
};

export const addThemeFile = async (
	name: string,
	file_path: string,
	url_path: string
): Promise<File> => {
	const body = {
		name: name,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/themes', body);
};

export const updateSingleFile = async (
	name: string,
	root: string,
	file_path: string,
	url_path: string
): Promise<File> => {
	const body = {
		root: root,
		file_path: file_path,
		url_path: url_path
	};

	return await openapiPostBody('file/' + name, body);
};

export const deleteSingleFile = async (name: string): Promise<void> => {
	return await openapiDelete('file/' + name);
};
