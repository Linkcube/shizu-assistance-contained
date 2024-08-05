import {
  add_event_dj,
  add_event_promo,
  add_logo_file,
  add_recording_file,
  add_theme_file,
  create_new_app_theme,
  delete_app_theme,
  delete_dj,
  delete_event,
  delete_file,
  delete_promo,
  delete_theme,
  export_event,
  import_legacy_events,
  import_legacy_ledger,
  insert_into_djs,
  insert_into_events,
  insert_into_files,
  insert_into_promos,
  insert_into_themes,
  move_event_dj,
  move_event_promo,
  remove_event_dj,
  remove_event_promo,
  update_app_theme,
  update_dj,
  update_event,
  update_event_dj,
  update_file,
  update_promo,
  update_theme,
} from "./database";
import {
  guiGetAppThemes,
  guiGetDjs,
  guiGetEvents,
  guiGetFile,
  guiGetFiles,
  guiGetPromos,
  guiGetThemes,
} from "./gui_reader";
import {
  IDjObject,
  IEventObject,
  IFileObject,
  ILineupDjObject,
  IPromoObject,
  IThemeObject,
} from "./types";

export const guiAddNewFile = async (file_data: IFileObject) => {
  const error = await insert_into_files(file_data);
  if (error !== undefined) return error;

  return await guiGetFile({file_name: file_data.name});
};

export const guiAddNewLogoFile = async (file_data: IFileObject) => {
  const error = await add_logo_file(
    file_data.name,
    file_data.file_path,
    file_data.url_path,
  );
  if (error !== undefined) return error;

  return await guiGetFile({file_name: file_data.name});
};

export const guiAddNewRecordingFile = async (file_data: IFileObject) => {
  const error = await add_recording_file(
    file_data.name,
    file_data.file_path,
    file_data.url_path,
  );
  if (error !== undefined) return error;

  return await guiGetFile({file_name: file_data.name});
};

export const guiAddNewThemeFile = async (file_data: IFileObject) => {
  const error = await add_theme_file(
    file_data.name,
    file_data.file_path,
    file_data.url_path,
  );
  if (error !== undefined) return error;

  return await guiGetFile({file_name: file_data.name});
};

export const guiAddNewTheme = async (theme_data: IThemeObject) => {
  const error = await insert_into_themes(theme_data);
  if (error !== undefined) return error;

  return await guiGetThemes();
};

export const guiAddDj = async (dj_data: IDjObject) => {
  const error = await insert_into_djs(dj_data);
  if (error !== undefined) return error;

  return await guiGetDjs();
};

export const guiAddPromo = async (promo_data: IPromoObject) => {
  const error = await insert_into_promos(promo_data);
  if (error !== undefined) return error;

  return await guiGetPromos();
};

export const guiAddEvent = async (event_data: IEventObject) => {
  const error = await insert_into_events(event_data);
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiAddEventDj = async (data: {
  event_name: string;
  dj_data: ILineupDjObject;
}) => {
  const error = await add_event_dj(data.event_name, data.dj_data);
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiAddEventPromo = async (data: {
  event_name: string;
  promo_name: string;
}) => {
  const error = await add_event_promo(data.event_name, data.promo_name);
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiAddAppTheme = async (data: {
  name: string
}) => {
  const error = await create_new_app_theme(data.name);
  if (error !== undefined) return error;

  return await guiGetAppThemes();
}

export const guiEditAppTheme = async (data: {
  name: string,
  style: any
}) => {
  const error = await update_app_theme(data.name, data.style);
  if (error !== undefined) return error;

  return await guiGetAppThemes();
}

export const guiDeleteAppTheme = async (data: {
  name: string
}) => {
  const error = await delete_app_theme(data.name);
  if (error !== undefined) return error;

  return await guiGetAppThemes();
}

export const guiUpdateFile = async (file_data: IFileObject) => {
  const error = await update_file(file_data);
  if (error !== undefined) return error;

  return await guiGetFile({file_name: file_data.name});
};

export const guiUpdateTheme = async (theme_data: IThemeObject) => {
  const error = await update_theme(theme_data);
  if (error !== undefined) return error;

  return await guiGetThemes();
};

export const guiUpdateDj = async (dj_data: IDjObject) => {
  const error = await update_dj(dj_data);
  if (error !== undefined) return error;

  return await guiGetDjs();
};

export const guiUpdatePromo = async (promo_data: IPromoObject) => {
  const error = await update_promo(promo_data);
  if (error !== undefined) return error;

  return await guiGetPromos();
};

export const guiUpdateEvent = async (event_data: IEventObject) => {
  const error = await update_event(event_data);
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiUpdateEventDj = async (data: {
  event_name: string;
  dj_name: string;
  is_live: boolean;
  vj: string;
}) => {
  const error = await update_event_dj(
    data.event_name,
    data.dj_name,
    data.is_live,
    data.vj,
  );
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiRemoveEventDj = async (data: {
  event_name: string;
  dj_name: string;
}) => {
  const error = await remove_event_dj(data.event_name, data.dj_name);
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiRemoveEventPromo = async (data: {
  event_name: string;
  promo_name: string;
}) => {
  const error = await remove_event_promo(data.event_name, data.promo_name);
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiMoveEventDj = async (data: {
  event_name: string;
  index_a: number;
  index_b: number;
}) => {
  const error = await move_event_dj(
    data.event_name,
    data.index_a,
    data.index_b,
  );
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiMoveEventPromo = async (data: {
  event_name: string;
  index_a: number;
  index_b: number;
}) => {
  const error = await move_event_promo(
    data.event_name,
    data.index_a,
    data.index_b,
  );
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiDeleteFile = async (data: { file_name: string }) => {
  const error = await delete_file(data.file_name);
  if (error !== undefined) return error;

  return await guiGetFiles();
};

export const guiDeleteTheme = async (data: { theme_name: string }) => {
  const error = await delete_theme(data.theme_name);
  if (error !== undefined) return error;

  return await guiGetThemes();
};

export const guiDeleteDj = async (data: { dj_name: string }) => {
  const error = await delete_dj(data.dj_name);
  if (error !== undefined) return error;

  return await guiGetDjs();
};

export const guiDeletePromo = async (data: { file_name: string }) => {
  const error = await delete_promo(data.file_name);
  if (error !== undefined) return error;

  return await guiGetPromos();
};

export const guiDeleteEvent = async (data: { event_name: string }) => {
  const error = await delete_event(data.event_name);
  if (error !== undefined) return error;

  return await guiGetEvents();
};

export const guiExportEvent = async (data: { event_name: string }) => {
  const error = await export_event(data.event_name);
  if (error !== undefined) return error;

  return "Done";
};

export const guiImportLegacyLedger = async (data: { ledger_path: string }) => {
  const error = await import_legacy_ledger(data.ledger_path);
  if (error !== undefined) return error;

  return "Done";
};

export const guiImportLegacyEvents = async (data: { lineups_path: string }) => {
  const error = await import_legacy_events(data.lineups_path);
  if (error !== undefined) return error;

  return "Done";
};
