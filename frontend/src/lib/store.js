import {
    writable, get
} from 'svelte/store';
import fetchGraphQL from 'fetch-graphql';

export const settings = writable({});
export const ledger = writable({});
export const lineups = writable([]);
export const currentLineup = writable(null);
export const currentLineupObjects = writable({});
export const currentThemeIndex = writable(-1);
export const currentTheme = writable({});
export const themes = writable([]);
export const error_stack = writable(null);

export const all_djs = writable([]);
export const all_promos = writable([]);
export const all_events = writable([]);
export const current_event_object = writable({});

export const serverUrl = `${location.protocol}//${window.location.hostname}:4004`;
export const staticAssetsBase = `${location.protocol}//${window.location.hostname}:4004`;
const graphqlUrl = `${serverUrl}/gui/graphql`;
const openapiUrl = `${serverUrl}/openapi`;

export const RTMP_SERVERS = [
    {id: null, name: "Unset"},
    {id: "us-west", name: "US West"},
    {id: "us-east", name: "US East"},
    {id: "jp", name: "Japan"},
    {id: "europe", name: "Europe"}
]
export const RTMP_BASE = (server) => `rtmp://rtmp-${server}anisonhijack.com/live/`;

export const LOGO_TYPE = 1
export const RECORDING_TYPE = 2
export const THEME_TYPE = 3

export function isImageSource(source_path) {
    return(source_path.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function graphqlFetch(query) {
    return fetchGraphQL(graphqlUrl, query);
}

async function openapiGet(url, bubble_error=true) {
    const request =  fetch(`${openapiUrl}/${url}`, {
        method: "GET"
    });

    const response = await request;
    if (response.ok) {
        return await response.json();
    }
    if (bubble_error) parseOpenapiError(response);
}

function openapiPost(url) {
    return fetch(`${openapiUrl}/${url}`, {
        method: "POST"
    });
}

function openapiPostBody(url, body) {
    return fetch(`${openapiUrl}/${url}`, {
        method: "POST",
        body: body
    });
}

async function parseOpenapiError(response) {
    const jsonbody = await response.json();
    errorStackPushHelper({
        statusCode: response.status,
        message: jsonbody.message,
        errorType: jsonbody.errorType
    });
}

export function updateTheme(style) {
    currentTheme.set({
        "primary-color": style.primaryColor,
        "secondary-color": style.secondaryColor,
        "background-color": style.backgroundColor,
        "primary-text-color": style.primaryTextColor,
        "secondary-text-color": style.secondaryTextColor,
        "highlight-color": style.highlightColor,
        "focus-color": style.focusColor,
        "active-color": style.activeColor,
        "delete-color": style.deleteColor,
        "cancel-text-color": style.cancelTextColor,
        "cancel-background-color": style.cancelBackgroundColor,
        "submit-text-color": style.submitTextColor,
        "submit-background-color": style.submitBackgroundColor
    });
};

currentThemeIndex.subscribe((newTheme) => {
    let themes_data = get(themes);
    if (themes_data.length === 0) {
        return;
    }
    if (themes_data[newTheme]) {
        updateTheme(themes_data[newTheme].style);
        localStorage.setItem("theme_index", newTheme);
    }
});


// Queries
const all_event_properties = `
name,
djs { name, is_live, vj },
promos,
theme,
public,
date,
start_time`;

const logoFileCreateMutation = (name, file_path = null, url_path = null) => {
    let input = `name: "${name}"`;
    if (file_path) {
        input += `, file_path: "${file_path}"`
    }
    if (url_path) {
        input += `, url_path: "${url_path}"`
    }

    return `
    mutation {
        guiAddNewLogoFile(${input}) {
            name,
            root,
            file_path,
            url_path
        }
    }`;
}

const recordingFileCreateMutation = (name, file_path = null, url_path = null) => {
    let input = `name: "${name}"`;
    if (file_path) {
        input += `, file_path: "${file_path}"`
    }
    if (url_path) {
        input += `, url_path: "${url_path}"`
    }

    return `
    mutation {
        guiAddNewRecordingFile(${input}) {
            name,
            root,
            file_path,
            url_path
        }
    }`;
}

const themeFileCreateMutation = (name, file_path = null, url_path = null) => {
    let input = `name: "${name}"`;
    if (file_path) {
        input += `, file_path: "${file_path}"`
    }
    if (url_path) {
        input += `, url_path: "${url_path}"`
    }

    return `
    mutation {
        guiAddNewThemeFile(${input}) {
            name,
            root,
            file_path,
            url_path
        }
    }`;
}

const fileUpdateMutation = (name, root, file_path, url_path) => {
    let input = `name: "${name}", root: "${root}"`;
    if (file_path) {
        input += `, file_path: "${file_path}"`
    }
    if (url_path) {
        input += `, url_path: "${url_path}"`
    }
    return `
    mutation {
        guiUpdateFile(${input}) {
            name,
            root,
            file_path,
            url_path
        }
    }`;
}

const fileDeleteMutation = (name) => `
mutation {
    guiDeleteFile(file_name: "${name}") {
        name,
        root,
        file_path,
        url_path
    }
}`;

const themeCreateMutation = (name) => `
mutation {
    guiAddNewTheme(name: "${name}") { name }
}`

const themeUpdateMutation = (
    name,
    overlay_file,
    starting_file,
    ending_file,
    target_video_height,
    target_video_width,
    video_offset_x,
    video_offset_y,
    chat_width,
    chat_height,
    chat_offset_x,
    chat_offset_y
) => {
    let input = `name: "${name}"`;
    if (overlay_file) input += `, overlay_file: "${overlay_file}"`;
    if (starting_file) input += `, starting_file: "${starting_file}"`;
    if (ending_file) input += `, ending_file: "${ending_file}"`;
    if (target_video_height) input += `, target_video_height: ${target_video_height}`;
    if (target_video_width) input += `, target_video_width: ${target_video_width}`;
    if (video_offset_x) input += `, video_offset_x: ${video_offset_x}`;
    if (video_offset_y) input += `, video_offset_y: ${video_offset_y}`;
    if (chat_width) input += `, chat_width: ${chat_width}`;
    if (chat_height) input += `, chat_height: ${chat_height}`;
    if (chat_offset_x) input += `, chat_offset_x: ${chat_offset_x}`;
    if (chat_offset_y) input += `, chat_offset_y: ${chat_offset_y}`;

    return `
    mutation {
        guiUpdateTheme(${input}) { name }
    }`
}

const themeDeleteMutation = (name) => `
mutation {
    guiDeleteTheme(theme_name: "${name}") { name }
}`;

const eventSetThemeMutation = (event_name, theme_name) => `
mutation {
    guiSetEventTheme(event_name: "${event_name}", theme_name: "${theme_name}") { name }
}`;

const getAppThemesQuery = `
query {
    guiGetAppThemes { 
        name,
        style {
            primaryColor,
            secondaryColor,
            backgroundColor,
            primaryTextColor,
            secondaryTextColor,
            highlightColor,
            focusColor,
            activeColor,
            deleteColor,
            cancelTextColor,
            cancelBackgroundColor,
            submitTextColor,
            submitBackgroundColor
        }
    }
}
`;

const addAppThemeMutation = `
mutation {
    guiAddAppTheme { 
        name,
        style {
            primaryColor,
            secondaryColor,
            backgroundColor,
            primaryTextColor,
            secondaryTextColor,
            highlightColor,
            focusColor,
            activeColor,
            deleteColor,
            cancelTextColor,
            cancelBackgroundColor,
            submitTextColor,
            submitBackgroundColor
        }
    }
}
`;

const editAppThemeMutation = (name, newTheme) => `
mutation {
    guiEditAppTheme(
        name: "${name}",
        newThemeStyle: {
            primaryColor: "${newTheme.style.primaryColor}",
            secondaryColor: "${newTheme.style.secondaryColor}",
            backgroundColor: "${newTheme.style.backgroundColor}",
            primaryTextColor: "${newTheme.style.primaryTextColor}",
            secondaryTextColor: "${newTheme.style.secondaryTextColor}",
            highlightColor: "${newTheme.style.highlightColor}",
            focusColor: "${newTheme.style.focusColor}",
            activeColor: "${newTheme.style.activeColor}",
            deleteColor: "${newTheme.style.deleteColor}",
            cancelTextColor: "${newTheme.style.cancelTextColor}",
            cancelBackgroundColor: "${newTheme.style.cancelBackgroundColor}",
            submitTextColor: "${newTheme.style.submitTextColor}",
            submitBackgroundColor: "${newTheme.style.submitBackgroundColor}"
        }) { 
        name,
        style {
            primaryColor,
            secondaryColor,
            backgroundColor,
            primaryTextColor,
            secondaryTextColor,
            highlightColor,
            focusColor,
            activeColor,
            deleteColor,
            cancelTextColor,
            cancelBackgroundColor,
            submitTextColor,
            submitBackgroundColor
        }
    }
}`;

const deleteAppThemeMutation = (name) => `
mutation {
    guiDeleteAppTheme(name: "${name}") { 
        title,
        style {
            primaryColor,
            secondaryColor,
            backgroundColor,
            primaryTextColor,
            secondaryTextColor,
            highlightColor,
            focusColor,
            activeColor,
            deleteColor,
            cancelTextColor,
            cancelBackgroundColor,
            submitTextColor,
            submitBackgroundColor
        }
    }
}`;

const addDjMutation = (
        name,
        logo_name,
        recording_name,
        rtmp_server,
        rtmp_key,
        public_name,
        discord_id) => {
    let input = `name: "${name}"`;
    if (logo_name) input += `, logo: "${logo_name}"`;
    if (recording_name) input += `, recording: "${recording_name}"`;
    if (rtmp_server) input += `, rtmp_server: "${rtmp_server}"`;
    if (rtmp_key) input += `, rtmp_key: "${rtmp_key}"`;
    if (public_name) input += `, public_name: "${public_name}"`;
    if (discord_id) input += `, discord_id: "${discord_id}"`;
    return `
    mutation {
        guiAddDj(${input}) {
            name, logo, recording, rtmp_server, rtmp_key, public_name, discord_id
        }
    }`;
}

const updateDjMutation = (
    name,
    logo_name,
    recording_name,
    rtmp_server,
    rtmp_key,
    public_name,
    discord_id
) => {
    let input = `name: "${name}"`;
    if (logo_name) input += `, logo: "${logo_name}"`;
    if (recording_name) input += `, recording: "${recording_name}"`;
    if (rtmp_server) input += `, rtmp_server: "${rtmp_server}"`;
    if (rtmp_key) input += `, rtmp_key: "${rtmp_key}"`;
    if (public_name) input += `, public_name: "${public_name}"`;
    if (discord_id) input += `, discord_id: "${discord_id}"`;

    return `
    mutation {
        guiUpdateDj(${input}) {
            name, logo, recording, rtmp_server, rtmp_key, public_name, discord_id
        }
    }`;
}


const deleteDjMutation = (dj_name) => `
mutation {
    guiDeleteDj(dj_name: "${dj_name}") {
        name, logo, recording, rtmp_server, rtmp_key, public_name, discord_id
    }
}`

const addPromoMutation = (name, promo_file) => {
    let input = `name: "${name}"`;
    if (promo_file) input += `, promo_file: "${promo_file}"`;
    return `
    mutation {
        guiAddPromo(${input}) {
            name, promo_file
        }
    }`
}

const updatePromoMutation = (name, promo_file) => {
    let input = `name: "${name}"`;
    if (promo_file) input += `, promo_file: "${promo_file}"`;
    return `
    mutation {
        guiUpdatePromo(${input}) {
            name, promo_file
        }
    }`
}

const deletePromoMutation = (promo_name) => `
mutation {
    guiDeletePromo(promo_name: "${promo_name}") {
        name, promo_file
    }
}`

const createLineupQuery = (name) => `
mutation {
    guiAddEvent(name: "${name}") {
        ${all_event_properties}
    }
}`

const getLineup = (name) => `
query {
    guiGetEvent(event_name: "${name}") {
        ${all_event_properties}
    }
}`

const addDjToLineupMutation = (event_name, dj_name) => `
mutation {
    guiAddEventDj(
        event_name: "${event_name}",
        dj_data: {
            name: "${dj_name}",
            is_live: false
        }
    ) {
        ${all_event_properties}
    }
}`

const addPromoToLineupMutation = (event_name, promo_name) => `
mutation {
    guiAddEventPromo(
        event_name: "${event_name}",
        promo_name: "${promo_name}"
    ) {
        ${all_event_properties}
    }
}`

const updateLineupDjMutation = (event_name, dj_name, is_live, vj) => {
    let input = `event_name: "${event_name}", dj_name: "${dj_name}"`;
    if (is_live) {
        input += ", is_live: true";
    } else {
        input += ", is_live: false";
    }
    if (vj) input += `, vj: "${vj}"`;
    return `
    mutation {
        guiUpdateEventDj(${input}) { ${all_event_properties} }
    }`
}

const updateEventDateTime = (event_name, date, start_time) => {
    let input = `event_name: "${event_name}"`;
    if (date) {
        input += `, date: "${date}"`;
    }
    if (start_time) {
        input += `, start_time: "${start_time}"`;
    }
    return `
    mutation {
        guiUpdateEventDateTime(${input}) {
            ${all_event_properties}
        }
    }`
}

const fetchSwapLineupDjsMutation = (event_name, index_a, index_b) => `
mutation {
    guiMoveEventDj(
        event_name: "${event_name}",
        index_a: ${index_a},
        index_b: ${index_b}
    ) { ${all_event_properties} }
}`

const fetchSwapLineupPromosMutation = (event_name, index_a, index_b) => `
mutation {
    guiMoveEventPromo(
        event_name: "${event_name}",
        index_a: ${index_a},
        index_b: ${index_b}
    ) { ${all_event_properties} }
}`

const removeDjFromLineuppMutation = (event_name, dj_name) => `
mutation {
    guiRemoveEventDj(
        event_name: "${event_name}",
        dj_name: "${dj_name}"
    ) { ${all_event_properties} }
}`

const removePromoFromLineuppMutation = (event_name, promo_name) => `
mutation {
    guiRemoveEventPromo(
        event_name: "${event_name}",
        promo_name: "${promo_name}"
    ) { ${all_event_properties} }
}`

const exportLineupMutation = (event_name) => `
mutation {
    guiExportEvent(event_name: "${event_name}")
}`

const errorStackPushHelper = (error) => {
    error_stack.set(error);
}

// openapi fetch

export const oaFetchLogoFiles = async () => {
    return await openapiGet("files/logos");
}

export const oaFetchRecordingFiles = async () => {
    return await openapiGet("files/recordings");
}

export const oaFetchThemeFiles = async () => {
    return await openapiGet("files/themes");
}

export const oaFetchFileExists = async (file) => {
    const file_data = await openapiGet(`files/single-file/${file}`, false);
    if (file_data) {
        return true;
    }
    
    return false;
}

const filePermissionsHelper = (url, sub_dirs) => {
    if (sub_dirs.length > 0) {
        url += '/' + sub_dirs.join('/');
    }
    console.log(url);
    return openapiGet(url);
}

export const oaFetchLogoPermissions = async (sub_dirs) => {
    return await filePermissionsHelper("files/logo-permissions", sub_dirs);
}

export const oaFetchRecordingPermissions = async (sub_dirs) => {
    return await filePermissionsHelper("files/recording-permissions", sub_dirs);
}
export const oaFetchThemePermissions = async (sub_dirs) => {
    return await filePermissionsHelper("files/theme-permissions", sub_dirs);
}

export const oaFetchDjs = async () => {
    const djs = await openapiGet("djs/min");
    if (djs) {
        all_djs.set(djs);
    }
}

export const oaFetchSingleDj = async (dj_name) => {
    return await openapiGet("djs/single-dj/" + dj_name);
}

export const oaFetchPromos = async () => {
    const promos = await openapiGet("promos/min");
    if (promos) {
        all_promos.set(promos);
    }
}

export const oaFetchSinglePromo = async (promo_name) => {
    return await openapiGet("promos/single-promo/" + promo_name);
}

export const oaFetchEvents = async () => {
    const events = await openapiGet("events/min");
    if (events) {
        all_events.set(events);
    }
}

export const oaFetchSingleEvent = async (event_name) => {
    const event_data = await openapiGet("events/single-event/" + event_name);
    currentLineupObjects.set(event_data);
}

export const oaFetchThemes = async () => {
    return await openapiGet("themes/");
}

export const oaFetchSingleTheme = async (theme_name) => {
    return await openapiGet("themes/single-theme/" + theme_name);
}

export const oaFetchAppThemes = async () => {
    const app_themes =  await openapiGet("app-themes/");
    if (app_themes) {
        themes.set(app_themes);
        let last_theme = localStorage.getItem("theme_index");
        if (last_theme !== null) {
            currentThemeIndex.set(parseInt(last_theme));
        } else {
            currentThemeIndex.set(0);
        }
    }
}


// fetch
export function fetchAddLogoFile(name, file_path=null, url_path=null) {
    return graphqlFetch(logoFileCreateMutation(name, file_path, url_path)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
                return Promise.resolve(false);
            } else if (response.hasOwnProperty("data")) {
				return Promise.resolve(response.data.guiAddNewLogoFile);
			}
		})
    });
}

export function fetchAddRecordingFile(name, file_path=null, url_path=null) {
    return graphqlFetch(recordingFileCreateMutation(name, file_path, url_path)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
                return Promise.resolve(false);
            } else if (response.hasOwnProperty("data")) {
				return Promise.resolve(response.data.guiAddNewRecordingFile);
			}
		})
    });
}

export function fetchAddThemeFile(name, file_path=null, url_path=null) {
    return graphqlFetch(themeFileCreateMutation(name, file_path, url_path)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
                return Promise.resolve(false);
            } else if (response.hasOwnProperty("data")) {
				return Promise.resolve(response.data.guiAddNewThemeFile);
			}
		})
    });
}

export function fetchUpdateFile(name, root, file_path, url_path) {
    return graphqlFetch(fileUpdateMutation(name, root, file_path, url_path)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
                return Promise.resolve(false);
            } else if (response.hasOwnProperty("data")) {
				return Promise.resolve(response.data.guiUpdateFile);
			}
		})
    });
}

export function fetchDeleteFile(name) {
    return graphqlFetch(fileDeleteMutation(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		})
    });
}

export function fetchAddTheme(name) {
    return graphqlFetch(themeCreateMutation(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
                return Promise.resolve(false);
            } else if (response.hasOwnProperty("data")) {
				return Promise.resolve(response.data.guiAddNewTheme);
			}
		})
    });
}

export function fetchUpdateEventDateTime(name, date, start_time) {
    return graphqlFetch(updateEventDateTime(name, date, start_time)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				return Promise.resolve(response.data.guiUpdateEventDateTime);
			}
		})
    });
}

export function fetchUpdateTheme(
    name,
    overlay_file,
    starting_file,
    ending_file,
    target_video_height,
    target_video_width,
    video_offset_x,
    video_offset_y,
    chat_width,
    chat_height,
    chat_offset_x,
    chat_offset_y) {
    return graphqlFetch(themeUpdateMutation(
        name,
        overlay_file,
        starting_file,
        ending_file,
        target_video_height,
        target_video_width,
        video_offset_x,
        video_offset_y,
        chat_width,
        chat_height,
        chat_offset_x,
        chat_offset_y)
    ).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
                return Promise.resolve(false);
            } else if (response.hasOwnProperty("data")) {
				return Promise.resolve(response.data.guiUpdateTheme);
			}
		})
    });
}

export function fetchDeleteTheme(name) {
    return graphqlFetch(themeDeleteMutation(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		})
    });
}

export function fetchEventSetTheme(event_name, theme_name) {
    return graphqlFetch(eventSetThemeMutation(event_name, theme_name)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiSetEventTheme)
            }
		})
    });
}
export function fetchAddAppTheme() {
    return graphqlFetch(addAppThemeMutation);
}

export function fetchEditAppTheme(themeIndex, theme) {
    return graphqlFetch(editAppThemeMutation(themeIndex, theme));
}

export function fetchDeleteAppTheme(themeIndex) {
    return graphqlFetch(deleteAppThemeMutation(themeIndex));
}

export function fetchAddDj(name, logo_path, recording_path, rtmp_server, stream_key, public_name, discord_id) {
    graphqlFetch(addDjMutation(name, logo_path, recording_path, rtmp_server, stream_key, public_name, discord_id)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_djs.set(response.data.guiAddDj);
			}
		})
    });
}

export function fetchUpdateDj(name, logo_path, recording_path, rtmp_server, rtmp_key, public_name, discord_id) {
    graphqlFetch(updateDjMutation(name, logo_path, recording_path, rtmp_server, rtmp_key, public_name, discord_id)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_djs.set(response.data.guiUpdateDj);
			}
		})
    });
}

export function fetchDeleteDj(dj_name) {
    return graphqlFetch(deleteDjMutation(dj_name)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_djs.set(response.data.guiDeleteDj);
                return "done";
			}
		})
    });
}


export function fetchCreateLineup(name) {
    return graphqlFetch(createLineupQuery(name)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		});
    });;
}

export function fetchLineup(name) {
    return graphqlFetch(getLineup(name)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				currentLineupObjects.set(response.data.guiGetEvent);
			}
		})
    });
}

export function fetchAddDjToLineup(lineup_name, dj_name) {
    return graphqlFetch(addDjToLineupMutation(lineup_name, dj_name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiAddEventDj);
            }
		});
    });
}

export function fetchUpdateLineupDj(lineup_name, dj_name, is_live, vj) {
    return graphqlFetch(updateLineupDjMutation(lineup_name, dj_name, is_live, vj)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiUpdateEventDj);
            }
		})
    });
}

export function fetchSwapLineupDjs(lineup_name, index_a, index_b) {
    return graphqlFetch(fetchSwapLineupDjsMutation(lineup_name, index_a, index_b)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiMoveEventDj);
            }
		})
    });
}

export function fetchSwapLineupPromos(lineup_name, index_a, index_b) {
    return graphqlFetch(fetchSwapLineupPromosMutation(lineup_name, index_a, index_b)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiMoveEventPromo);
            }
		})
    });
}

export function fetchRemoveLineupDj(lineup_name, dj_name) {
    return graphqlFetch(removeDjFromLineuppMutation(lineup_name, dj_name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiRemoveEventDj);
            }
		});
    });
}

export function fetchAddPromo(name, file_path) {
    graphqlFetch(addPromoMutation(name, file_path)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_promos.set(response.data.guiAddPromo);
			}
		})
    });
}

export function fetchUpdatePromo(name, file_path) {
    graphqlFetch(updatePromoMutation(name, file_path)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_promos.set(response.data.guiUpdatePromo);
			}
		})
    });
}

export function fetchDeletePromo(index) {
    return graphqlFetch(deletePromoMutation(index)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_promos.set(response.data.deletePromo);
                return "done";
			}
		})
    });
}

export function fetchAddPromoToLineup(lineup_name, promo_name) {
    return graphqlFetch(addPromoToLineupMutation(lineup_name, promo_name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiAddEventPromo);
            }
		});
    });
}

export function fetchRemoveLineupPromo(lineup_name, promo_name) {
    return graphqlFetch(removePromoFromLineuppMutation(lineup_name, promo_name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiRemoveEventPromo);
            }
		});
    });
}

export function fetchExportLineup(lineup_name) {
    return graphqlFetch(exportLineupMutation(lineup_name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
                return Promise.resolve(false);
            } else {
                return Promise.resolve(true);
            }
		});
    });
}

const deleteLineupMutation = (name) => `
mutation {
    guiDeleteEvent(event_name: "${name}") { name }
}`

export function fetchDeleteLineup(lineup_name) {
    return graphqlFetch(deleteLineupMutation(lineup_name));
}
