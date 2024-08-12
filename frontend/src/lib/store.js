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

export const graphqlBase = `${location.protocol}//${window.location.hostname}:4004`;
export const staticAssetsBase = `${location.protocol}//${window.location.hostname}:4004`;
const graphqlUrl = `${graphqlBase}/gui/graphql`;

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

function fetch(query) {
    return fetchGraphQL(graphqlUrl, query);
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
const djsMinQuery = `
query {
    guiGetDjs {
        name,
        logo,
        recording,
        rtmp_server
    }
}`;

const promosMinQuery = `
query {
    guiGetPromos {
        name
    }
}`;

const themesQuery = `
query {
    guiGetThemes {
        name,
        overlay_file,
        stinger_file,
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
    }
}`;

const eventsMinQuery = `
query {
    guiGetEvents {
        name
    }
}`;

const logoFilesQuery = `
query {
    guiGetLogoFiles {
        name,
        root,
        file_path,
        url_path
    }
}`;

const recordingFilesQuery = `
query {
    guiGetRecordingFiles {
        name,
        root,
        file_path,
        url_path
    }
}`;

const themeFilesQuery = `
query {
    guiGetThemeFiles {
        name,
        root,
        file_path,
        url_path
    }
}`;

const djSingleQuery = (name) => `
query {
    guiGetDj(dj_name: "${name}") {
        name,
        logo,
        recording,
        rtmp_server,
        rtmp_key,
        public_name,
        discord_id,
        past_events
    }
}`;

const promoSingleQuery = (name) => `
query {
    guiGetPromo(promo_name: "${name}") {
        name,
        promo_file
    }
}`;

const eventSingleQuery = (name) => `
query {
    guiGetEvent(event_name: "${name}") {
        name,
        djs { name, is_live, vj },
        promos,
        theme,
        public,
        date,
        start_time
    }
}`;

const fileSingleQuery = (name) => `
query {
    guiGetFile(file_name: "${name}") {
        name,
        root,
        file_path,
        url_path
    }
}`;

const themeSingleQuery = (name) => `
query {
    guiGetTheme(theme_name: "${name}") {
        name,
        overlay_file,
        stinger_file,
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
    }
}`;

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

const setLastThemeIndexMutation = (index) => `
mutation {
    updateSettings(theme_index: ${index})
}`

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
        name
    }
}`

const getLineup = (name) => `
query {
    guiGetEvent(event_name: "${name}") {
        name,
        djs { name, is_live, vj },
        promos,
        theme,
        public
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
        name
    }
}`

const addPromoToLineupMutation = (event_name, promo_name) => `
mutation {
    guiAddEventPromo(
        event_name: "${event_name}",
        promo_name: "${promo_name}"
    ) {
        name
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
        guiUpdateEventDj(${input}) { name }
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
            name,
            djs { name, is_live, vj },
            promos,
            theme,
            public,
            date,
            start_time
        }
    }`
}

const fetchSwapLineupDjsMutation = (event_name, index_a, index_b) => `
mutation {
    guiMoveEventDj(
        event_name: "${event_name}",
        index_a: ${index_a},
        index_b: ${index_b}
    ) { name }
}`

const fetchSwapLineupPromosMutation = (event_name, index_a, index_b) => `
mutation {
    guiMoveEventPromo(
        event_name: "${event_name}",
        index_a: ${index_a},
        index_b: ${index_b}
    ) { name }
}`

const removeDjFromLineuppMutation = (event_name, dj_name) => `
mutation {
    guiRemoveEventDj(
        event_name: "${event_name}",
        dj_name: "${dj_name}"
    ) { name }
}`

const removePromoFromLineuppMutation = (event_name, promo_name) => `
mutation {
    guiRemoveEventPromo(
        event_name: "${event_name}",
        promo_name: "${promo_name}"
    ) { name }
}`

const exportLineupMutation = (event_name) => `
mutation {
    guiExportEvent(event_name: "${event_name}")
}`

const deleteLineupMutation = (name) => `
mutation {
    guiDeleteEvent(event_name: "${name}") { name }
}`

const getPermissionsQueryHelper = (query_head, sub_dirs) => {
    let dirs_string = sub_dirs.map(dir => `"${dir}"`).join(',');
    if (sub_dirs) {
        query_head += `(sub_dirs: [${dirs_string}])`
    }

    return `
    query {
        ${query_head} {
            files {
                name,
                ext,
                is_dir
            },
            path,
            top_dir
        }
    }`
}

const getLogoPermissionsQuery = (sub_dirs) => getPermissionsQueryHelper("guiGetLogoPermissions", sub_dirs);
const getRecordingPermissionsQuery = (sub_dirs) => getPermissionsQueryHelper("guiGetRecordingPermissions", sub_dirs);
const getThemePermissionsQuery = (sub_dirs) => getPermissionsQueryHelper("guiGetThemePermissions", sub_dirs);

const reconstructPathHelper = (query_head, dirs) => {
    let dirs_string = dirs.map(dir => `"${dir}"`).join(',');

    return `
    query {
        ${query_head}(dirs: [${dirs_string}])
    }`
}

const errorStackPushHelper = (error) => {
    error_stack.set(error);
}


// fetch

export function fetchDjs() {
    fetch(djsMinQuery).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                all_djs.set(response.data.guiGetDjs);
            }
        })
    })
}

export function fetchPromos() {
    fetch(promosMinQuery).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                all_promos.set(response.data.guiGetPromos);
            }
        })
    })
}

export function fetchEvents() {
    fetch(eventsMinQuery).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                all_events.set(response.data.guiGetEvents);
            }
        })
    })
}

export function fetchLogoFiles() {
    return fetch(logoFilesQuery).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetLogoFiles);
            }
        })
    })
}

export function fetchRecordingFiles() {
    return fetch(recordingFilesQuery).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetRecordingFiles);
            }
        })
    })
}

export function fetchThemeFiles() {
    return fetch(themeFilesQuery).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetThemeFiles);
            }
        })
    })
}

export function fetchThemes() {
    return fetch(themesQuery).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetThemes);
            }
        })
    })
}

export function fetchSingleDj(name) {
    return fetch(djSingleQuery(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetDj);
            }
        })
    })
}

export function fetchSinglePromo(name) {
    return fetch(promoSingleQuery(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetPromo);
            }
        })
    })
}

export function fetchSingleEvent(name) {
    return fetch(eventSingleQuery(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                currentLineupObjects.set(response.data.guiGetEvent);
            }
        })
    })
}

export function fetchSingleTheme(name) {
    return fetch(themeSingleQuery(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetTheme);
            }
        })
    })
}

export function fetchFileExists(name) {
    return fetch(fileSingleQuery(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                return Promise.resolve(false);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetFile);
            }
        })
    })
}

export function fetchAddLogoFile(name, file_path=null, url_path=null) {
    return fetch(logoFileCreateMutation(name, file_path, url_path)).then(promise => {
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
    return fetch(recordingFileCreateMutation(name, file_path, url_path)).then(promise => {
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
    return fetch(themeFileCreateMutation(name, file_path, url_path)).then(promise => {
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
    return fetch(fileUpdateMutation(name, root, file_path, url_path)).then(promise => {
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
    return fetch(fileDeleteMutation(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		})
    });
}

export function fetchAddTheme(name) {
    return fetch(themeCreateMutation(name)).then(promise => {
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
    return fetch(updateEventDateTime(name, date, start_time)).then(promise => {
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
    return fetch(themeUpdateMutation(
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
    return fetch(themeDeleteMutation(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		})
    });
}

export function fetchEventSetTheme(event_name, theme_name) {
    return fetch(eventSetThemeMutation(event_name, theme_name)).then(promise => {
        return Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else {
                return Promise.resolve(response.data.guiSetEventTheme)
            }
		})
    });
}

export function fetchGetAppThemes() {
    fetch(getAppThemesQuery).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty('data')) {
                themes.set(response.data.guiGetAppThemes);
                let last_theme = localStorage.getItem("theme_index");
                if (last_theme !== null) {
                    currentThemeIndex.set(parseInt(last_theme));
                } else {
                    currentThemeIndex.set(0);
                }
            }
        })
    });
}

export function fetchAddAppTheme() {
    return fetch(addAppThemeMutation);
}

export function fetchEditAppTheme(themeIndex, theme) {
    return fetch(editAppThemeMutation(themeIndex, theme));
}

export function fetchDeleteAppTheme(themeIndex) {
    return fetch(deleteAppThemeMutation(themeIndex));
}

export function fetchSetLastThemeIndex(index) {
    return fetch(setLastThemeIndexMutation(index));
}

export function fetchAddDj(name, logo_path, recording_path, rtmp_server, stream_key, public_name, discord_id) {
    fetch(addDjMutation(name, logo_path, recording_path, rtmp_server, stream_key, public_name, discord_id)).then(promise => {
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
    fetch(updateDjMutation(name, logo_path, recording_path, rtmp_server, rtmp_key, public_name, discord_id)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_djs.set(response.data.guiUpdateDj);
                if (get(currentLineup)) {
                    fetchLineup(get(currentLineup));
                }
			}
		})
    });
}

export function fetchDeleteDj(dj_name) {
    return fetch(deleteDjMutation(dj_name)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_djs.set(response.data.guiDeleteDj);
                if (get(currentLineup)) {
                    fetchLineup(get(currentLineup));
                }
                return "done";
			}
		})
    });
}


export function fetchCreateLineup(name) {
    return fetch(createLineupQuery(name)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		});
    });;
}

export function fetchLineup(name) {
    return fetch(getLineup(name)).then(promise => {
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
    return fetch(addDjToLineupMutation(lineup_name, dj_name)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		});
    });
}

export function fetchUpdateLineupDj(lineup_name, dj_name, is_live, vj) {
    return fetch(updateLineupDjMutation(lineup_name, dj_name, is_live, vj)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		})
    });
}

export function fetchSwapLineupDjs(lineup_name, index_a, index_b) {
    return fetch(fetchSwapLineupDjsMutation(lineup_name, index_a, index_b)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		})
    });
}

export function fetchSwapLineupPromos(lineup_name, index_a, index_b) {
    return fetch(fetchSwapLineupPromosMutation(lineup_name, index_a, index_b)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		})
    });
}

export function fetchRemoveLineupDj(lineup_name, dj_name) {
    return fetch(removeDjFromLineuppMutation(lineup_name, dj_name)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		});
    });
}

export function fetchAddPromo(name, file_path) {
    fetch(addPromoMutation(name, file_path)).then(promise => {
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
    fetch(updatePromoMutation(name, file_path)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_promos.set(response.data.guiUpdatePromo);
                if (get(currentLineup)) {
                    fetchLineup(get(currentLineup));
                }
			}
		})
    });
}

export function fetchDeletePromo(index) {
    return fetch(deletePromoMutation(index)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				all_promos.set(response.data.deletePromo);
                if (get(currentLineup)) {
                    fetchLineup(get(currentLineup));
                }
                return "done";
			}
		})
    });
}

export function fetchAddPromoToLineup(lineup_name, promo_name) {
    return fetch(addPromoToLineupMutation(lineup_name, promo_name)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		});
    });
}

export function fetchRemoveLineupPromo(lineup_name, promo_name) {
    return fetch(removePromoFromLineuppMutation(lineup_name, promo_name)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		});
    });
}

export function fetchExportLineup(lineup_name) {
    return fetch(exportLineupMutation(lineup_name)).then(promise => {
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

export function fetchDeleteLineup(lineup_name) {
    return fetch(deleteLineupMutation(lineup_name));
}

export function fetchLogoPermissions(sub_dirs) {
    return fetch(getLogoPermissionsQuery(sub_dirs));
}
export function fetchRecordingPermissions(sub_dirs) {
    return fetch(getRecordingPermissionsQuery(sub_dirs));
}
export function fetchThemePermissions(sub_dirs) {
    return fetch(getThemePermissionsQuery(sub_dirs));
}
