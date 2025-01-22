import { writable, get } from "svelte/store";

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
const openapiUrl = `${serverUrl}/openapi`;

export const RTMP_SERVERS = [
  { id: null, name: "Unset" },
  { id: "us-west", name: "US West" },
  { id: "us-east", name: "US East" },
  { id: "jp", name: "Japan" },
  { id: "europe", name: "Europe" },
];
export const RTMP_BASE = (server) =>
  `rtmp://rtmp-${server}anisonhijack.com/live/`;

export const LOGO_TYPE = 1;
export const RECORDING_TYPE = 2;
export const THEME_TYPE = 3;

export function isImageSource(source_path) {
  return source_path.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

async function openapiGet(url, bubble_error = true) {
  const request = fetch(`${openapiUrl}/${url}`, {
    method: "GET",
  });

  const response = await request;
  if (response.ok) {
    return await response.json();
  }
  if (bubble_error) return parseOpenapiError(response);
}

async function openapiPostBody(url, body) {
  const request = fetch(`${openapiUrl}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const response = await request;
  if (response.ok) {
    try {
      return await response.json();
    } catch (e) {
      return true;
    }
  }
  parseOpenapiError(response);

  return undefined;
}

async function openapiDelete(url) {
  const request = fetch(`${openapiUrl}/${url}`, {
    method: "DELETE",
  });
  const response = await request;
  if (!response.ok) {
    parseOpenapiError(response);
  }
}

async function parseOpenapiError(response) {
  const jsonbody = await response.json();
  errorStackPushHelper({
    statusCode: response.status,
    message: jsonbody.message,
    errorType: jsonbody.errorType,
  });

  return Promise.reject();
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
    "submit-background-color": style.submitBackgroundColor,
  });
}

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

const errorStackPushHelper = (error) => {
  error_stack.set(error);
};

// openapi fetch

export const oaFetchLogoFiles = async () => {
  return await openapiGet("file/logos");
};

export const oaFetchRecordingFiles = async () => {
  return await openapiGet("file/recordings");
};

export const oaFetchThemeFiles = async () => {
  return await openapiGet("file/themes");
};

export const oaFetchFileExists = async (file) => {
  const file_data = await openapiGet(`file/${file}`, false);
  if (file_data) {
    return true;
  }

  return false;
};

const filePermissionsHelper = (url, sub_dirs) => {
  if (sub_dirs.length > 0) {
    url += "/" + encodeURIComponent(sub_dirs.join("/"));
  }
  return openapiGet(url);
};

export const oaFetchLogoPermissions = async (sub_dirs) => {
  localStorage.setItem("last_logo_path", JSON.stringify(sub_dirs));
  return await filePermissionsHelper("file/logo-permissions", sub_dirs);
};

export const oaFetchRecordingPermissions = async (sub_dirs) => {
  localStorage.setItem("last_recording_path", JSON.stringify(sub_dirs));
  return await filePermissionsHelper("file/recording-permissions", sub_dirs);
};
export const oaFetchThemePermissions = async (sub_dirs) => {
  localStorage.setItem("last_theme_path", JSON.stringify(sub_dirs));
  return await filePermissionsHelper("file/theme-permissions", sub_dirs);
};

export const oaFetchDjs = async () => {
  const djs = await openapiGet("dj/min");
  if (djs) {
    all_djs.set(djs);
  }
};

export const oaFetchSingleDj = async (dj_name) => {
  return await openapiGet("dj/" + dj_name);
};

export const oaFetchPromos = async () => {
  const promos = await openapiGet("promo/min");
  if (promos) {
    all_promos.set(promos);
  }
};

export const oaFetchSinglePromo = async (promo_name) => {
  return await openapiGet("promo/" + promo_name);
};

export const oaFetchEvents = async () => {
  const events = await openapiGet("event/min");
  if (events) {
    all_events.set(events);
  }
};

export const oaFetchSingleEvent = async (event_name) => {
  const event_data = await openapiGet("event/" + event_name);
  currentLineupObjects.set(event_data);
};

export const oaFetchThemes = async () => {
  return await openapiGet("theme/");
};

export const oaFetchSingleTheme = async (theme_name) => {
  return await openapiGet("theme/" + theme_name);
};

export const oaFetchAppThemes = async () => {
  const app_themes = await openapiGet("app-theme/");
  if (app_themes) {
    themes.set(app_themes);
    let last_theme = localStorage.getItem("theme_index");
    if (last_theme !== null) {
      currentThemeIndex.set(parseInt(last_theme));
    } else {
      currentThemeIndex.set(0);
    }
  }
};

export const oaPostNewLogoFile = async (name, file_path, url_path) => {
  const body = {
    name: name,
    file_path: file_path,
    url_path: url_path,
  };

  return await openapiPostBody("file/logos", body);
};

export const oaPostNewRecordingFile = async (name, file_path, url_path) => {
  const body = {
    name: name,
    file_path: file_path,
    url_path: url_path,
  };

  return await openapiPostBody("file/recordings", body);
};

export const oaPostNewThemeFile = async (name, file_path, url_path) => {
  const body = {
    name: name,
    file_path: file_path,
    url_path: url_path,
  };

  return await openapiPostBody("file/themes", body);
};

export const oaPostUpdateFile = async (name, root, file_path, url_path) => {
  const body = {
    root: root,
    file_path: file_path,
    url_path: url_path,
  };

  return await openapiPostBody("file/" + name, body);
};

export const oaPostDeleteFile = async (name) => {
  return await openapiDelete("file/" + name);
};

export const oaPostNewTheme = async (name) => {
  return await openapiPostBody("theme", { name: name });
};

export const oaPostUpdateTheme = async (
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
  chat_offset_y,
) => {
  const body = {
    name: name,
    overlay_file: overlay_file,
    starting_file: starting_file,
    ending_file: ending_file,
    target_video_height: target_video_height,
    target_video_width: target_video_width,
    video_offset_x: video_offset_x,
    video_offset_y: video_offset_y,
    chat_width: chat_width,
    chat_height: chat_height,
    chat_offset_x: chat_offset_x,
    chat_offset_y: chat_offset_y,
  };

  return await openapiPostBody("theme/" + name, body);
};

export const oaDeleteTheme = async (name) => {
  return await openapiDelete("theme/" + name);
};

export const oaPostNewDj = async (
  name,
  logo,
  recording,
  rtmp_server,
  rtmp_key,
  public_name,
  discord_id,
) => {
  const body = {
    name: name,
    logo: logo,
    recording: recording,
    rtmp_server: rtmp_server,
    rtmp_key: rtmp_key,
    public_name: public_name,
    discord_id: discord_id,
  };

  return await openapiPostBody("dj", body);
};

export const oaPostUpdateDj = async (
  name,
  logo,
  recording,
  rtmp_server,
  rtmp_key,
  public_name,
  discord_id,
) => {
  const body = {
    logo: logo,
    recording: recording,
    rtmp_server: rtmp_server,
    rtmp_key: rtmp_key,
    public_name: public_name,
    discord_id: discord_id,
  };

  return await openapiPostBody("dj/" + name, body);
};

export const oaDeleteDj = async (name) => {
  return await openapiDelete("dj/" + name);
};

export const oaPostCreateEvent = async (name) => {
  return await openapiPostBody("event", { name: name });
};

export const oaPostUpdateEventDateTime = async (name, date, start_time) => {
  const body = {
    date: date,
    start_time: start_time,
  };
  return await openapiPostBody(`event/${name}/dateTime`, body);
};

export const oaPostSetEventTheme = async (name, theme) => {
  return await openapiPostBody(`event/${name}/set-theme`, { name: theme });
};

export const oaPostAddEventDj = async (name, dj_name) => {
  const body = {
    name: dj_name,
    is_live: false,
  };
  return await openapiPostBody(`event/${name}/dj`, body);
};

export const oaPostUpdateEventDj = async (name, dj_name, is_live, vj) => {
  return await openapiPostBody(`event/${name}/dj/${dj_name}`, {
    is_live: is_live,
    vj: vj,
  });
};

export const oaPostMoveEventDj = async (name, index_a, index_b) => {
  const body = {
    index_a: index_a,
    index_b: index_b,
  };

  return await openapiPostBody(`event/${name}/move-dj`, body);
};

export const oaDeleteEventDj = async (name, dj_name) => {
  return await openapiDelete(`event/${name}/dj/${dj_name}`);
};

export const oaPostAddEventPromo = async (name, promo_name) => {
  return await openapiPostBody(`event/${name}/promo`, { name: promo_name });
};

export const oaPostMoveEventPromo = async (name, index_a, index_b) => {
  const body = {
    index_a: index_a,
    index_b: index_b,
  };

  return await openapiPostBody(`event/${name}/move-promo`, body);
};

export const oaDeleteEventPromo = async (name, promo_name) => {
  return await openapiDelete(`event/${name}/promo/${promo_name}`);
};

export const oaDeleteEvent = async (name) => {
  return await openapiDelete(`event/${name}`);
};

export const oaPostCreatePromo = async (name, file) => {
  const body = {
    name: name,
    promo_file: file,
  };

  return await openapiPostBody("promo", body);
};

export const oaPostUpdatePromo = async (name, file) => {
  const body = {
    promo_file: file,
  };

  return await openapiPostBody(`promo/${name}`, body);
};

export const oaDeletePromo = async (name) => {
  return await openapiDelete(`promo/${name}`);
};

export const oaPostCreateAppTheme = async (name) => {
  return await openapiPostBody("app-theme", { name: name });
};

export const oaPostUpdateAppTheme = async (theme) => {
  const body = Object.assign({}, { style: theme.style });
  return await openapiPostBody(`app-theme/${theme.name}`, body);
};

export const oaDeleteAppTheme = async (name) => {
  return await openapiDelete(`app-theme/${name}`);
};

export const oaPostExportEvent = async (name) => {
  return await openapiPostBody(`event/${name}/export`, {});
};
