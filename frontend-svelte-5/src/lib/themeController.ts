import { openapiGet, openapiPostBody, openapiDelete } from './utils';

/**
 * Represents a theme object used in an event
 * @interface Theme
 * @property {string} name - The name of the theme.
 * @property {string} overlay_file - Path to the overlay file for the theme.
 * @property {string} stinger_file - Path to the stinger file for the theme.
 * @property {string} starting_file - Path to the starting file for the theme.
 * @property {string} ending_file - Path to the ending file for the theme.
 * @property {number} target_video_width - Target width of the video in pixels.
 * @property {number} target_video_height - Target height of the video in pixels.
 * @property {number} video_offset_x - Horizontal offset for the video in pixels.
 * @property {number} video_offset_y - Vertical offset for the video in pixels.
 * @property {number} chat_width - Width of the chat window in pixels.
 * @property {number} chat_height - Height of the chat window in pixels.
 * @property {number} chat_offset_x - Horizontal offset for the chat window in pixels.
 * @property {number} chat_offset_y - Vertical offset for the chat window in pixels.
 */
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

/**
 * Retrieves all themes from the API.
 * @returns {Promise<Theme[]>} A promise that resolves to an array of Theme objects.
 */
export async function getAll(): Promise<Theme[]> {
	return await openapiGet('theme/');
}

/**
 * Retrieves a single theme by its name.
 * @param {string} theme_name - The name of the theme to retrieve.
 * @returns {Promise<Theme | undefined>} A promise that resolves to a Theme object or undefined if not found.
 */
export async function getSingle(theme_name: string): Promise<Theme | undefined> {
	return await openapiGet('theme/' + theme_name);
}

/**
 * Adds a new theme with the given name.
 * @param {string} name - The name of the new theme.
 * @returns {Promise<Theme | undefined>} A promise that resolves to a Theme object or undefined if creation fails.
 */
export async function addSingle(name: string): Promise<Theme | undefined> {
	return await openapiPostBody('theme', { name: name });
}

/**
 * Updates an existing theme with the provided details.
 * @param {Theme} theme - The Theme object containing updated information.
 * @returns {Promise<Theme | undefined>} A promise that resolves to the updated Theme object or undefined if update fails.
 */
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
