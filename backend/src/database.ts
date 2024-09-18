import { Client, Pool, PoolClient } from "pg";
import { base_db_config, pool_config } from "./config";
import {
  DJS_TABLE,
  EVENTS_TABLE,
  FILES_TABLE,
  THEMES_TABLE,
  ALL_TABLES,
  PROMOS_TABLE,
  APP_THEMES_TABLE,
} from "./tables";
import {
  IDjObject,
  IEventObject,
  IFileObject,
  IPromoObject,
  IThemeObject,
  ILineupDjObject,
  IExportDjineupData,
  IExportPromoLineupData,
  IExportThemeData,
  ILegacyLedger,
  ILegacyLineup,
} from "./types";
import {
  internal_create_table_helper,
  internal_get_row_from_table,
  internal_read_entire_table,
} from "./database_helpers/helper_functions";
import {
  internal_delete_file,
  internal_insert_into_files,
  internal_read_all_logo_files,
  internal_read_all_recording_files,
  internal_read_all_theme_files,
  internal_update_file,
} from "./database_helpers/file_db_helpers";
import {
  internal_delete_theme,
  internal_insert_into_themes,
  internal_update_theme,
} from "./database_helpers/theme_db_helpers";
import {
  internal_add_event_dj,
  internal_add_event_promo,
  internal_delete_event,
  internal_insert_into_events,
  internal_move_event_dj,
  internal_move_event_promo,
  internal_remove_event_dj,
  internal_remove_event_promo,
  internal_set_event_date_time,
  internal_set_event_theme,
  internal_update_event,
  internal_update_event_dj,
} from "./database_helpers/event_db_helpers";
import {
  internal_delete_promo,
  internal_insert_into_promos,
  internal_update_promo,
} from "./database_helpers/promo_db_helpers";
import {
  internal_delete_dj,
  internal_insert_into_djs,
  internal_update_dj,
} from "./database_helpers/dj_db_helpers";
import { importError, invalidFileError } from "./errors";
import {
  fetchFile,
  getResolution,
  EXPORT_ROOT,
  root_map,
  rebuildLegacyObjects,
  LOGOS_ROOT,
  RECORDINGS_ROOT,
  THEMES_ROOT,
} from "./file_helpers";
import { join, parse } from "path";
import { accessSync, readdirSync, readFileSync, writeFileSync } from "fs";
import util from "node:util";
import {
  internal_delete_app_themes,
  internal_insert_into_app_themes,
  internal_update_app_themes,
} from "./database_helpers/app_themes_db_helpers";
import { run_migrations } from "./db_migrations/migrations";

// File for accessing SQL, handles client/pool lifecycles.

const database_client = () => {
  return new Client(base_db_config);
};
export const database_pool = new Pool(pool_config);

export const read_files_table = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_entire_table(FILES_TABLE, pool);
  await pool.release();
  return retval.rows;
};

export const read_files_logos = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_all_logo_files(pool);
  await pool.release();
  return retval.rows;
};

export const read_files_recordings = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_all_recording_files(pool);
  await pool.release();
  return retval.rows;
};

export const read_files_themes = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_all_theme_files(pool);
  await pool.release();
  return retval.rows;
};

export const read_themes_table = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_entire_table(THEMES_TABLE, pool);
  await pool.release();
  return retval.rows;
};

export const read_events_table = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_entire_table(EVENTS_TABLE, pool);
  await pool.release();
  return retval.rows;
};

export const read_promos_table = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_entire_table(PROMOS_TABLE, pool);
  await pool.release();
  return retval.rows;
};

export const read_djs_table = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_entire_table(DJS_TABLE, pool);
  await pool.release();
  return retval.rows;
};

export const read_app_themes_table = async () => {
  const pool = await database_pool.connect();
  const retval = await internal_read_entire_table(APP_THEMES_TABLE, pool);
  await pool.release();
  return retval.rows;
};

export const get_file = async (name: string) => {
  const pool = await database_pool.connect();
  const retval = await internal_get_row_from_table(FILES_TABLE, name, pool);
  await pool.release();
  return retval;
};

export const get_theme = async (name: string) => {
  const pool = await database_pool.connect();
  const retval = await internal_get_row_from_table(THEMES_TABLE, name, pool);
  await pool.release();
  return retval;
};

export const get_event = async (name: string) => {
  const pool = await database_pool.connect();
  const retval = await internal_get_row_from_table(EVENTS_TABLE, name, pool);
  await pool.release();
  return retval;
};

export const get_promo = async (name: string) => {
  const pool = await database_pool.connect();
  const retval = await internal_get_row_from_table(PROMOS_TABLE, name, pool);
  await pool.release();
  return retval;
};

export const get_dj = async (name: string) => {
  const pool = await database_pool.connect();
  const retval = await internal_get_row_from_table(DJS_TABLE, name, pool);
  await pool.release();
  return retval;
};

export const get_app_theme = async (name: string) => {
  const pool = await database_pool.connect();
  const retval = await internal_get_row_from_table(
    APP_THEMES_TABLE,
    name,
    pool,
  );
  await pool.release();
  return retval;
};

export const create_tables = async () => {
  const client = database_client();
  await run_migrations(client);

  // await client.connect();

  // for (const table of ALL_TABLES) {
  //   await internal_create_table_helper(client, table);
  // }

  // const themes = await client.query(`SELECT * FROM ${APP_THEMES_TABLE.name};`);
  // if (themes.rows.length === 0) await initial_data();

  // await client.end();
};

const initial_data = async () => {
  await create_new_app_theme("Default");
  await create_new_app_theme("Moe");
  await update_app_theme("Moe", {
    primaryColor: "#789922",
    secondaryColor: "#d3d3d3",
    backgroundColor: "#d9e6ff",
    primaryTextColor: "#000000",
    secondaryTextColor: "#789922",
    highlightColor: "#cc4a4a",
    focusColor: "#ffffff",
    activeColor: "#d9e6ff",
    deleteColor: "#5c3c82",
    cancelTextColor: "#5c3c82",
    cancelBackgroundColor: "#7149a24f",
    submitTextColor: "#789922",
    submitBackgroundColor: "#97c42252",
  });
};

export const insert_into_files = async (file_data: IFileObject) => {
  const pool = await database_pool.connect();
  const error = await internal_insert_into_files(file_data, pool);
  await pool.release();
  return error;
};

export const add_logo_file = async (
  file_name: string,
  file_path?: string,
  url_path?: string,
) => {
  const file_data: IFileObject = {
    name: file_name,
    root: "LOGOS",
    file_path,
    url_path,
  };

  return insert_into_files(file_data);
};

export const add_recording_file = async (
  file_name: string,
  file_path?: string,
  url_path?: string,
) => {
  const file_data: IFileObject = {
    name: file_name,
    root: "RECORDINGS",
    file_path,
    url_path,
  };

  return insert_into_files(file_data);
};

export const add_theme_file = async (
  file_name: string,
  file_path?: string,
  url_path?: string,
) => {
  const file_data: IFileObject = {
    name: file_name,
    root: "THEMES",
    file_path,
    url_path,
  };

  return insert_into_files(file_data);
};

export const update_file = async (file_data: IFileObject) => {
  const pool = await database_pool.connect();
  const error = await internal_update_file(file_data, pool);
  await pool.release();
  return error;
};

export const delete_file = async (file_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_delete_file(file_name, pool);
  await pool.release();
  return error;
};

export const insert_into_themes = async (theme_data: IThemeObject) => {
  const pool = await database_pool.connect();
  const error = await internal_insert_into_themes(theme_data, pool);
  await pool.release();
  return error;
};

export const update_theme = async (theme_data: IThemeObject) => {
  const pool = await database_pool.connect();
  const error = await internal_update_theme(theme_data, pool);
  await pool.release();
  return error;
};

export const delete_theme = async (theme_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_delete_theme(theme_name, pool);
  await pool.release();
  return error;
};

export const insert_into_events = async (event_data: IEventObject) => {
  const pool = await database_pool.connect();
  const error = await internal_insert_into_events(event_data, pool);
  await pool.release();
  return error;
};

export const add_event_dj = async (
  event_name: string,
  dj_data: ILineupDjObject,
) => {
  const pool = await database_pool.connect();
  const error = await internal_add_event_dj(event_name, dj_data, pool);
  await pool.release();
  return error;
};

export const add_event_promo = async (
  event_name: string,
  promo_name: string,
) => {
  const pool = await database_pool.connect();
  const error = await internal_add_event_promo(event_name, promo_name, pool);
  await pool.release();
  return error;
};

export const update_event = async (event_data: IEventObject) => {
  const pool = await database_pool.connect();
  const error = await internal_update_event(event_data, pool);
  await pool.release();
  return error;
};

export const update_event_dj = async (
  event_name: string,
  dj_name: string,
  is_live?: boolean,
  vj?: string,
) => {
  const pool = await database_pool.connect();
  const error = await internal_update_event_dj(
    event_name,
    dj_name,
    pool,
    is_live,
    vj,
  );
  await pool.release();
  return error;
};

export const remove_event_dj = async (event_name: string, dj_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_remove_event_dj(event_name, dj_name, pool);
  await pool.release();
  return error;
};

export const remove_event_promo = async (
  event_name: string,
  promo_name: string,
) => {
  const pool = await database_pool.connect();
  const error = await internal_remove_event_promo(event_name, promo_name, pool);
  await pool.release();
  return error;
};

export const move_event_dj = async (
  event_name: string,
  index_a: number,
  index_b: number,
) => {
  const pool = await database_pool.connect();
  const error = await internal_move_event_dj(
    event_name,
    index_a,
    index_b,
    pool,
  );
  await pool.release();
  return error;
};

export const move_event_promo = async (
  event_name: string,
  index_a: number,
  index_b: number,
) => {
  const pool = await database_pool.connect();
  const error = await internal_move_event_promo(
    event_name,
    index_a,
    index_b,
    pool,
  );
  await pool.release();
  return error;
};

export const set_event_theme = async (
  event_name: string,
  theme_name: string,
) => {
  const pool = await database_pool.connect();
  const error = await internal_set_event_theme(event_name, theme_name, pool);
  pool.release();
  return error;
};

export const update_event_date_time = async (
  event_name: string,
  date: string,
  start_time: string,
) => {
  const pool = await database_pool.connect();
  const error = await internal_set_event_date_time(
    event_name,
    date,
    start_time,
    pool,
  );
  pool.release();
  return error;
};

export const delete_event = async (event_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_delete_event(event_name, pool);
  await pool.release();
  return error;
};

export const insert_into_promos = async (promo_data: IPromoObject) => {
  const pool = await database_pool.connect();
  const error = await internal_insert_into_promos(promo_data, pool);
  await pool.release();
  return error;
};

export const update_promo = async (promo_data: IPromoObject) => {
  const pool = await database_pool.connect();
  const error = await internal_update_promo(promo_data, pool);
  await pool.release();
  return error;
};

export const delete_promo = async (promo_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_delete_promo(promo_name, pool);
  await pool.release();
  return error;
};

export const insert_into_djs = async (dj_data: IDjObject) => {
  const pool = await database_pool.connect();
  const error = await internal_insert_into_djs(dj_data, pool);
  await pool.release();
  return error;
};

export const update_dj = async (dj_data: IDjObject) => {
  const pool = await database_pool.connect();
  const error = await internal_update_dj(dj_data, pool);
  await pool.release();
  return error;
};

export const delete_dj = async (dj_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_delete_dj(dj_name, pool);
  await pool.release();
  return error;
};

export const create_new_app_theme = async (app_theme_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_insert_into_app_themes(app_theme_name, pool);
  await pool.release();
  return error;
};

export const update_app_theme = async (app_theme_name: string, style: any) => {
  const pool = await database_pool.connect();
  const error = await internal_update_app_themes(app_theme_name, style, pool);
  await pool.release();
  return error;
};

export const delete_app_theme = async (app_theme_name: string) => {
  const pool = await database_pool.connect();
  const error = await internal_delete_app_themes(app_theme_name, pool);
  await pool.release();
  return error;
};

const find_event_objects = async (event_name: string) => {
  const files_to_check: string[] = [];
  const errors = [];
  let theme: IThemeObject | Error | undefined;
  const promos: IPromoObject[] = [];
  const djs: IDjObject[] = [];

  const pool = await database_pool.connect();
  const event: IEventObject | Error = await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  );
  if (event instanceof Error) return { file_names: [], errors: [event] };

  if (event.theme) {
    theme = await internal_get_row_from_table(THEMES_TABLE, event.theme, pool);
    if (theme instanceof Error || theme === undefined) {
      errors.push(theme);
    } else {
      if (theme.overlay_file) files_to_check.push(theme.overlay_file);
      if (theme.stinger_file) files_to_check.push(theme.stinger_file);
      if (theme.starting_file) files_to_check.push(theme.starting_file);
      if (theme.ending_file) files_to_check.push(theme.ending_file);
    }
  }

  if (event.promos) {
    for (const promo_name of event.promos) {
      const promo: IPromoObject | Error = await internal_get_row_from_table(
        PROMOS_TABLE,
        promo_name,
        pool,
      );
      if (promo instanceof Error) {
        errors.push(promo);
      } else {
        promos.push(promo);
        if (promo.promo_file) {
          files_to_check.push(promo.promo_file);
        } else {
          errors.push(invalidFileError(`${promo_name} does not have a file.`));
        }
      }
    }
  }

  if (event.djs) {
    for (const lineup_dj of event.djs) {
      const dj: IDjObject | Error = await internal_get_row_from_table(
        DJS_TABLE,
        lineup_dj.name,
        pool,
      );
      if (dj instanceof Error) {
        errors.push(dj);
      } else {
        djs.push(dj);
        if (dj.logo) files_to_check.push(dj.logo);
        if (dj.recording) files_to_check.push(dj.recording);
      }
    }
  }

  await pool.release();

  return {
    event,
    theme,
    promos,
    djs,
    file_names: files_to_check,
    errors,
  };
};

const validateLocalFile = async (file: IFileObject, pool: PoolClient) => {
  if (!file.file_path && !file.url_path)
    return invalidFileError(`No local path or url set for ${file.name}`);
  let local_file_path;
  let has_local_file = false;
  const root = root_map.get(file.root!)!;
  if (file.file_path) {
    local_file_path = join(root, file.file_path);
    try {
      accessSync(local_file_path);
      has_local_file = true;
    } catch (err) {
      console.log(`Local file ${local_file_path} not found.`);
    }
  } else {
    const file_name = parse(file.url_path!).base;
    local_file_path = join(root, decodeURI(file_name));
  }

  if (!has_local_file) {
    if (!file.url_path) {
      return invalidFileError(
        `File ${file.name} does not have a valid local file, set a url path or fix the local file path.`,
      );
    }
    console.log(`Downloading ${file.url_path}...`);
    const fetch_result = await fetchFile(file.url_path, local_file_path);
    if (fetch_result instanceof Error) return fetch_result;
    if (!file.file_path) {
      file.file_path = local_file_path.slice(root.length + 1);
      await internal_update_file(file, pool);
    }
  }
};

const gather_files_for_export = async (files_to_check: string[]) => {
  const file_objects: IFileObject[] = [];
  const errors = [];
  const pool = await database_pool.connect();
  for (const file_name of files_to_check) {
    const file: IFileObject | Error = await internal_get_row_from_table(
      FILES_TABLE,
      file_name,
      pool,
    );
    if (file instanceof Error) {
      errors.push(file);
    } else {
      file_objects.push(file);
    }
  }

  const validations = [];
  for (const file of file_objects) {
    validations.push(await validateLocalFile(file, pool));
  }
  await pool.release();

  return {
    file_objects,
    errors: validations.filter((val) => val instanceof Error),
  };
};

export const export_event = async (event_name: string) => {
  // Gather and validate event data
  const event_objects = await find_event_objects(event_name);
  const files_to_check = event_objects.file_names;
  const file_errors = event_objects.errors;
  if (files_to_check.length === 0 || file_errors.length > 0)
    return invalidFileError(file_errors.toString());

  const gathered_files = await gather_files_for_export(
    event_objects.file_names,
  );
  if (gathered_files.errors.length > 0)
    return invalidFileError(gathered_files.errors.toString());

  // Pack data into export format, gathering video resolution etc.
  const files_map = new Map(
    gathered_files.file_objects.map((file) => [file.name, file.file_path!]),
  );

  if (!event_objects.event!.djs) event_objects.event!.djs = [];
  const dj_promises = event_objects.event!.djs.map((lineup_dj, index) => {
    const dj = event_objects.djs![index];

    const dj_export_data: IExportDjineupData = {
      name: dj.public_name ? dj.public_name : dj.name,
      logo_path: "",
      recording_path: "",
      resolution: Promise.resolve([]),
      url: "",
      vj: lineup_dj.vj ? lineup_dj.vj : "",
    };
    if (dj.logo)
      dj_export_data.logo_path = join(LOGOS_ROOT, files_map.get(dj.logo)!);
    if (lineup_dj.is_live) {
      dj_export_data.url = util.format(
        process.env.RTMP_SERVER,
        dj.rtmp_server,
        dj.rtmp_key,
      );
    } else {
      if (dj.recording) {
        dj_export_data.recording_path = join(
          RECORDINGS_ROOT,
          files_map.get(dj.recording)!,
        );
        dj_export_data.resolution = getResolution(
          dj_export_data.recording_path,
        );
      }
    }
    return dj_export_data;
  });

  if (!event_objects.event!.promos) event_objects.event!.promos = [];
  const promo_promises = event_objects.event!.promos.map(
    (promo_name, index) => {
      const promo = event_objects.promos![index];

      const promo_export_data: IExportPromoLineupData = {
        name: promo_name,
        path: "",
        resolution: Promise.resolve([]),
      };
      if (promo.promo_file) {
        promo_export_data.path = join(
          RECORDINGS_ROOT,
          files_map.get(promo.promo_file)!,
        );
        promo_export_data.resolution = getResolution(promo_export_data.path);
      }

      return promo_export_data;
    },
  );

  const djs_data = await Promise.all(
    dj_promises.map(async (dj) => {
      return {
        name: dj.name,
        logo_path: dj.logo_path,
        recording_path: dj.recording_path,
        resolution: await dj.resolution,
        url: dj.url,
        vj: dj.vj,
      };
    }),
  );
  const promos_data = await Promise.all(
    promo_promises.map(async (promo) => {
      return {
        name: promo.name,
        path: promo.path,
        resolution: await promo.resolution,
      };
    }),
  );
  const ffmpeg_errors: string[] = [];
  djs_data.forEach((dj) => {
    if (dj.resolution instanceof Error) {
      ffmpeg_errors.push(`DJ ${dj.name}, ${dj.resolution.message}`);
    }
  });
  promos_data.forEach((promo) => {
    if (promo.resolution instanceof Error) {
      ffmpeg_errors.push(`Promo ${promo.name}, ${promo.resolution.message}`);
    }
  });
  if (ffmpeg_errors.length > 0)
    return invalidFileError(ffmpeg_errors.toString());

  // Wrtite {event_name}.json to exports mount
  const DOCKER_EXPORT_PATH = join(EXPORT_ROOT, event_name + ".json");

  console.log(`Exporting to ${DOCKER_EXPORT_PATH}`);

  const export_data = {
    djs: djs_data,
    promos: promos_data,
    theme: {},
  };

  if (event_objects.theme && !(event_objects.theme instanceof Error)) {
    const theme_data: IExportThemeData = { name: event_objects.theme.name };
    if (event_objects.theme.overlay_file)
      theme_data.overlay = join(
        THEMES_ROOT,
        files_map.get(event_objects.theme.overlay_file)!,
      );
    if (event_objects.theme.starting_file)
      theme_data.starting = join(
        THEMES_ROOT,
        files_map.get(event_objects.theme.starting_file)!,
      );
    if (event_objects.theme.stinger_file)
      theme_data.stinger = join(
        THEMES_ROOT,
        files_map.get(event_objects.theme.stinger_file)!,
      );
    if (event_objects.theme.ending_file)
      theme_data.ending = join(
        THEMES_ROOT,
        files_map.get(event_objects.theme.ending_file)!,
      );
    if (event_objects.theme.target_video_width)
      theme_data.video_width = event_objects.theme.target_video_width;
    if (event_objects.theme.target_video_height)
      theme_data.video_height = event_objects.theme.target_video_height;
    if (event_objects.theme.video_offset_x)
      theme_data.video_offset_x = event_objects.theme.video_offset_x;
    if (event_objects.theme.video_offset_y)
      theme_data.video_offset_y = event_objects.theme.video_offset_y;
    if (event_objects.theme.chat_width)
      theme_data.chat_width = event_objects.theme.chat_width;
    if (event_objects.theme.chat_height)
      theme_data.chat_height = event_objects.theme.chat_height;
    if (event_objects.theme.chat_offset_x)
      theme_data.chat_offset_x = event_objects.theme.chat_offset_x;
    if (event_objects.theme.chat_offset_y)
      theme_data.chat_offset_y = event_objects.theme.chat_offset_y;
    export_data.theme = theme_data;
  }

  console.log(export_data);

  writeFileSync(DOCKER_EXPORT_PATH, JSON.stringify(export_data));
};

export const import_legacy_ledger = async (ledger_path: string) => {
  const ledger: ILegacyLedger = JSON.parse(readFileSync(ledger_path, "utf-8"));

  const new_objects = rebuildLegacyObjects(ledger);
  const errors: string[] = [];
  for (const file of new_objects.files) {
    console.log(`Processing File ${file.name}`);
    const error = await insert_into_files(file);
    if (error instanceof Error)
      errors.push(`Failed to import ${file.name}: ${error.message}`);
  }
  for (const dj of new_objects.djs) {
    console.log(`Processing DJ ${dj.name}`);
    const error = await insert_into_djs(dj);
    if (error instanceof Error)
      errors.push(`Failed to import ${dj.name}: ${error.message}`);
  }
  for (const promo of new_objects.promos) {
    console.log(`Processing Promo ${promo.name}`);
    const error = await insert_into_promos(promo);
    if (error instanceof Error)
      errors.push(`Failed to import ${promo.name}: ${error.message}`);
  }

  if (errors.length > 0) return importError(errors.toString());
};

export const import_legacy_events = async (lineups_path: string) => {
  const errors = [];
  const new_events: IEventObject[] = [];

  // Expect a folder containing multiple lineups
  const lineup_files = readdirSync(lineups_path, { withFileTypes: true });
  for (const lineup_path of lineup_files.filter((file) => file.isFile())) {
    // Construct a new event for each lineup file
    const new_event: IEventObject = { name: parse(lineup_path.name).name };
    const legacy_lineup_data: ILegacyLineup = JSON.parse(
      readFileSync(join(lineups_path, lineup_path.name), "utf-8"),
    );
    // Check for existing objects before adding them to the event
    const event_djs: ILineupDjObject[] = [];
    for (const lineup_dj of legacy_lineup_data.djs) {
      const dj = await get_dj(lineup_dj.name);
      if (dj instanceof Error) {
        errors.push(`Failed to find DJ ${lineup_dj.name}`);
      } else {
        event_djs.push({
          name: dj.name,
          is_live: lineup_dj.is_live,
          vj: lineup_dj.vj,
        });
      }
    }
    if (event_djs.length > 0) new_event.djs = event_djs;

    const event_promos: string[] = [];
    for (const lineup_promo of legacy_lineup_data.promos) {
      const promo = await get_promo(lineup_promo);
      if (promo instanceof Error) {
        errors.push(`Failed to find Promo ${lineup_promo}`);
      } else {
        event_promos.push(lineup_promo);
      }
    }
    if (event_promos.length > 0) new_event.promos = event_promos;

    new_events.push(new_event);
  }

  for (const event of new_events) {
    console.log(`Importing event ${event.name}`);
    const error = await insert_into_events(event);
    if (error instanceof Error)
      errors.push(`Failed to import event ${event.name}: ${error.message}`);
  }

  if (errors.length > 0) return importError(errors.toString());
};
