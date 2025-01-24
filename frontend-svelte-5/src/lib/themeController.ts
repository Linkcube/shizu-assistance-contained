import { openapiGet, openapiPostBody, openapiDelete } from './utils';

export interface Theme {
	name: string;
	overlay_file: string;
	stinger_file: string;
	starting_file: string;
	ending_file: string;
	target_video_width: number;
	target_video_height: number;
	video_offset_x: number;
	video_offset_y: number;
	chat_width: number;
	chat_height: number;
	chat_offset_x: number;
	chat_offset_y: number;
}

export async function getAll(): Promise<Theme[]> {
	return await openapiGet('theme/');
}

export async function getSingle(theme_name: string): Promise<Theme | undefined> {
	return await openapiGet('theme/' + theme_name);
}

export async function addSingle(name: string): Promise<Theme | undefined> {
	return await openapiPostBody('theme', { name: name });
}

export async function updateSingle(theme: Theme): Promise<Theme | undefined> {
	const body = {
		name: theme.name,
		overlay_file: theme.overlay_file,
		starting_file: theme.starting_file,
		ending_file: theme.ending_file,
		target_video_height: theme.target_video_height,
		target_video_width: theme.target_video_width,
		video_offset_x: theme.video_offset_x,
		video_offset_y: theme.video_offset_y,
		chat_width: theme.chat_width,
		chat_height: theme.chat_height,
		chat_offset_x: theme.chat_offset_x,
		chat_offset_y: theme.chat_offset_y
	};

	return await openapiPostBody('theme/' + theme.name, body);
}

export async function deleteSingle(name: string) {
	return await openapiDelete('theme/' + name);
}
