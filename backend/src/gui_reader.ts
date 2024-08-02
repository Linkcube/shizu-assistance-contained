import {
  get_dj,
  get_event,
  get_file,
  get_promo,
  get_theme,
  read_app_themes_table,
  read_djs_table,
  read_events_table,
  read_files_table,
  read_promos_table,
  read_themes_table,
} from "./database";
import { InvalidFileError } from "./errors";
import { getLocalLogoFiles, getLocalRecordingFiles } from "./file_helpers";

export const guiGetFiles = async () => {
  return await read_files_table();
};

export const guiGetThemes = async () => {
  return await read_themes_table();
};

export const guiGetEvents = async () => {
  return await read_events_table();
};

export const guiGetPromos = async () => {
  return await read_promos_table();
};

export const guiGetDjs = async () => {
  return await read_djs_table();
};

export const guiGetAppThemes = async () => {
  return await read_app_themes_table();
}

export const guiGetFile = async (data: { file_name: string }) => {
  const file = await get_file(data.file_name);
  if (file instanceof Error)
    return new InvalidFileError(`File ${data.file_name} does not exist`);

  return file;
};

export const guiGetTheme = async (data: { theme_name: string }) => {
  const theme = await get_theme(data.theme_name);
  if (theme instanceof Error)
    return new InvalidFileError(`Theme ${data.theme_name} does not exist`);

  return theme;
};

export const guiGetEvent = async (data: { event_name: string }) => {
  const event = await get_event(data.event_name);
  if (event instanceof Error)
    return new InvalidFileError(`File ${data.event_name} does not exist`);

  return event;
};

export const guiGetPromo = async (data: { promo_name: string }) => {
  const promo = await get_promo(data.promo_name);
  if (promo instanceof Error)
    return new InvalidFileError(`Promo ${data.promo_name} does not exist`);

  return promo;
};

export const guiGetDj = async (data: { dj_name: string }) => {
  const dj = await get_dj(data.dj_name);
  if (dj instanceof Error)
    return new InvalidFileError(`DJ ${data.dj_name} does not exist`);

  return dj;
};

export const guiGetLogoPermissions = async (data: { sub_dirs: string[]}) => {
  return getLocalLogoFiles(data.sub_dirs);
}

export const guiGetRecordingPermissions = async (data: { sub_dirs: string[]}) => {
  return getLocalRecordingFiles(data.sub_dirs);
}