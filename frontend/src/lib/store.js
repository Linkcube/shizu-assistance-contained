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

export const graphqlBase = `${location.protocol}//${window.location.hostname}:4004`;
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
    }
});


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
    getAppThemes { 
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
}
`;

const addAppThemeMutation = `
mutation {
    addAppTheme { 
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
}
`;

const editAppThemeMutation = (themeIndex, newTheme) => `
mutation {
    editAppTheme(
        themeIndex: ${themeIndex}, newThemeTitle: "${newTheme.title}",
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

const deleteAppThemeMutation = (themeIndex) => `
mutation {
    deleteAppTheme(themeIndex: ${themeIndex}) { 
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
                is_dir
            },
            path,
            top_dirs
        }
    }`
}

const getLogoPermissionsQuery = (sub_dirs) => getPermissionsQueryHelper("getLogoPermissions", sub_dirs);
const getRecordingPermissionsQuery = (sub_dirs) => getPermissionsQueryHelper("getRecordingPermissions", sub_dirs);
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
                themes.set(response.data.getAppThemes);
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
