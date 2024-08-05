import {
    writable, get
} from 'svelte/store';
import fetchGraphQL from 'fetch-graphql';

export const settings = writable({});
export const ledger = writable({});
export const lineups = writable([]);
export const currentLineup = writable(null);
export const currentLineupObjects = writable({});
export const currentThemeIndex = writable(0);
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
    {id: "us-west", name: "US West"},
    {id: "us-east", name: "US East"},
    {id: "jp", name: "Japan"},
    {id: "europe", name: "Europe"}
]
export const RTMP_BASE = (server) => `rtmp://rtmp-${server}anisonhijack.com/live/`;

export const LOGO_TYPE = 1
export const RECORDING_TYPE = 2
export const EXPORT_TYPE = 3

export function toFileName(file_path) {
    if (file_path !== "") {
        if (file_path.includes("/")) {
            return file_path.split("/").pop();
        } else {
            return file_path.split("\\").pop();
        }
    }
    return "";
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


// New Queries

const djsQuery = `
query {
    guiGetDjs {
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

const djsMinQuery = `
query {
    guiGetDjs {
        name,
        logo,
        recording,
        rtmp_server
    }
}`;

const promosQuery = `
query {
    guiGetPromos {
        name,
        promo_file
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
        ending_file
    }
}`;

const eventsQuery = `
query {
    guiGetEvents {
        name,
        djs { name, is_live, vj },
        promos,
        theme,
        public
    }
}`;

const eventsMinQuery = `
query {
    guiGetEvents {
        name
    }
}`;

const filesQuery = `
query {
    guiGetFiles {
        name,
        root,
        file_path,
        url_path
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
        public
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



// Legacy

const settingsQuery = `
query {
    getSettings {
        ledger_path,
        lineups_dir,
        theme_index
    }
}`

const ledgerQuery = `
query {
    getLedger {
        djs {name, logo_path, recording_path, rtmp_server, stream_key},
        promos {name, path}
    }
}`

const lineupsQuery = `
query {
    getLineups
}`

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

const updateSettingsMutation = (ledger_path, lineups_dir) => `
mutation {
    updateSettings(ledger_path: "${ledger_path}", lineups_dir: "${lineups_dir}")
}`

const addDjMutation = (name, logo_path, recording_path, rtmp_server, stream_key) => `
mutation {
    addDj(
        name: "${name}",
        logo_path: "${logo_path}",
        recording_path: "${recording_path}",
        rtmp_server: "${rtmp_server}",
        stream_key: "${stream_key}"

    ) {
        djs {name, logo_path, recording_path, rtmp_server, stream_key},
        promos {name, path}
    }
}`;

const updateDjMutation = (index, name, logo_path, recording_path, rtmp_server, stream_key) => `
mutation {
    updateDj(
        index: ${index},
        name: "${name}",
        logo_path: "${logo_path}",
        recording_path: "${recording_path}",
        rtmp_server: "${rtmp_server}",
        stream_key: "${stream_key}"

    ) {
        djs {name, logo_path, recording_path, rtmp_server, stream_key},
        promos {name, path}
    }
}`;

const deleteDjMutation = (index) => `
mutation {
    deleteDj(index: ${index}) {
        djs {name, logo_path, recording_path, rtmp_server, stream_key},
        promos {name, path}
    }
}`

const addPromoMutation = (name, path) => `
mutation {
    addPromo(name: "${name}", path: "${path}") {
        djs {name, logo_path, recording_path, rtmp_server, stream_key},
        promos {name, path}
    }
}`

const updatePromoMutation = (index, name, path) => `
mutation {
    updatePromo(index: ${index}, name: "${name}", path: "${path}") {
        djs {name, logo_path, recording_path, rtmp_server, stream_key},
        promos {name, path}
    }
}`

const deletePromoMutation = (index) => `
mutation {
    deletePromo(index: ${index}) {
        djs {name, logo_path, recording_path, rtmp_server, stream_key},
        promos {name, path}
    }
}`

const getFilePathQuery = `
query {
    getFilePath
}`;

const getDirPathQuery = `
query {
    getDirPath
}`;

const createLineupQuery = (name) => `
mutation {
    createLineup(name: "${name}")
}`

const getLineup = (name) => `
query {
    getLineup(name: "${name}") {
        djs {name, is_live, vj}
        promos
    }
}`

const updateLineupMutation = (name, djs, promos) => `
mutation {
    updateLineup(
        name: "${name}",
        djs: [${djs}],
        promos: [${promos}]
    )
}`

const addDjToLineupMutation = (lineup_name, dj_name) => `
mutation {
    addDjToLineup(
        lineup_name: "${lineup_name}",
        dj_name: "${dj_name}"
    )
}`

const addPromoToLineupMutation = (lineup_name, promo_name) => `
mutation {
    addPromoToLineup(
        lineup_name: "${lineup_name}",
        promo_name: "${promo_name}"
    )
}`

const updateLineupDjMutation = (lineup_name, dj_name, is_live, vj) => `
mutation {
    setLineupDjLive(
        lineup_name: "${lineup_name}",
        dj_name: "${dj_name}",
        is_live: ${is_live},
        vj: "${vj}"
    )
}`

const fetchSwapLineupDjsMutation = (lineup_name, index_a, index_b) => `
mutation {
    swapLineupDJs(
        lineup_name: "${lineup_name}",
        index_a: ${index_a},
        index_b: ${index_b}
    )
}`

const fetchSwapLineupPromosMutation = (lineup_name, index_a, index_b) => `
mutation {
    swapLineupPromos(
        lineup_name: "${lineup_name}",
        index_a: ${index_a},
        index_b: ${index_b}
    )
}`

const removeDjFromLineuppMutation = (lineup_name, dj_name) => `
mutation {
    removeDjFromLineup(
        lineup_name: "${lineup_name}",
        dj_name: "${dj_name}"
    )
}`

const removePromoFromLineuppMutation = (lineup_name, promo_name) => `
mutation {
    removePromoFromLineup(
        lineup_name: "${lineup_name}",
        promo_name: "${promo_name}"
    )
}`

const exportLineupMutation = (lineup_name, dir) => `
mutation {
    exportLineup(lineup_name: "${lineup_name}", export_dir: "${dir}")
}`

const deleteLineupMutation = (name) => `
mutation {
    deleteLineup(name: "${name}")
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
const getExportPermissionsQuery = (sub_dirs) => getPermissionsQueryHelper("getExportPermissions", sub_dirs);

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

const getReconstructLogoPathQuery = (dirs) => reconstructPathHelper("reconstructLogoPath", dirs);
const getReconstructRecordingPathQuery = (dirs) => reconstructPathHelper("reconstructRecordingPath", dirs);
const getReconstructExportPathQuery = (dirs) => reconstructPathHelper("reconstructExportPath", dirs);



// New fetch

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

export function fetchSingleFile(name) {
    return fetch(fileSingleQuery(name)).then(promise => {
        return Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
                return Promise.resolve(response.data.guiGetFile);
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

// Legacy fetch

export function fetchSettings() {
    fetch(settingsQuery).then(promise => {
        Promise.resolve(promise).then(resp => {
            if (resp.hasOwnProperty("data")) {
                settings.set(resp.data.getSettings);
                currentThemeIndex.set(resp.data.getSettings.theme_index);
            }
        })
    });
}

export function fetchLedger() {
    fetch(ledgerQuery).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				ledger.set(response.data.getLedger);
			}
		})
    });
}

export function fetchLineups() {
    fetch(lineupsQuery).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				lineups.set(response.data.getLineups);
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
                    console.log(`Setting theme to ${last_theme}`);
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

export function fetchAddDj(name, logo_path, recording_path, rtmp_server, stream_key) {
    fetch(addDjMutation(name, logo_path, recording_path, rtmp_server, stream_key)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				ledger.set(response.data.addDj);
			}
		})
    });
}

export function fetchUpdateDj(index, name, logo_path, recording_path, rtmp_server, stream_key) {
    fetch(updateDjMutation(index, name, logo_path, recording_path, rtmp_server, stream_key)).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				ledger.set(response.data.updateDj);
                if (get(currentLineup)) {
                    fetchLineup(get(currentLineup));
                }
			}
		})
    });
}

export function fetchDeleteDj(index) {
    return fetch(deleteDjMutation(index)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				ledger.set(response.data.deleteDj);
                if (get(currentLineup)) {
                    fetchLineup(get(currentLineup));
                }
                return "done";
			}
		})
    });
}

export function fetchGetFilePath() {
    return fetch(getFilePathQuery);
}

export function fetchGetDirPath() {
    return fetch(getDirPathQuery);
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
				currentLineupObjects.set(response.data.getLineup);
			}
		})
    });
}

export function updateLineupHelper(lineup_name, dj_objects, promos) {
    let djs_string = dj_objects.map(dj => `{name: "${dj.name}", is_live: ${dj.is_live}}`).join(',');
    let promos_string = promos.map(promo => `"${promo}"`).join(',');
    return fetch(updateLineupMutation(
        lineup_name,
        djs_string,
        promos_string
    )).then(promise => {
        Promise.resolve(promise).then(response => {
            if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            }
		});
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
				ledger.set(response.data.addPromo);
			}
		})
    });
}

export function fetchUpdatePromo(index, name, file_path) {
    fetch(updatePromoMutation(index, name, file_path)).then(promise => {
        Promise.resolve(promise).then(response => {
			if (response.hasOwnProperty("errors")) {
                errorStackPushHelper(response.errors[0]);
            } else if (response.hasOwnProperty("data")) {
				ledger.set(response.data.updatePromo);
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
				ledger.set(response.data.deletePromo);
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

export function fetchExportLineup(lineup_name, dir) {
    return fetch(exportLineupMutation(lineup_name, dir)).then(promise => {
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

export function fetchUpdateSettings(ledger_path, lineups_dir) {
    return fetch(updateSettingsMutation(ledger_path, lineups_dir));
}

export function fetchLogoPermissions(sub_dirs) {
    return fetch(getLogoPermissionsQuery(sub_dirs));
}
export function fetchRecordingPermissions(sub_dirs) {
    return fetch(getRecordingPermissionsQuery(sub_dirs));
}
export function fetchExportPermissions(sub_dirs) {
    return fetch(getExportPermissionsQuery(sub_dirs));
}

export function fetchReconstructLogoPath(dirs) {
    return fetch(getReconstructLogoPathQuery(dirs));
}
export function fetchReconstructRecordingPath(dirs) {
    return fetch(getReconstructRecordingPathQuery(dirs));
}
export function fetchReconstructExportPath(dirs) {
    return fetch(getReconstructExportPathQuery(dirs));
}
