import {
  Table,
  DJS_TABLE_NAME,
  PROMOS_TABLE_NAME,
  EVENTS_TABLE_NAME,
  THEMES_TABLE_NAME,
  FILES_TABLE_NAME,
  APP_THEMES_TABLE_NAME,
} from "../tables";

// Initial table definitions before any migrations

export const DJS_TABLE_0: Table = new Table(DJS_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "logo",
    type: "TEXT",
    fkey: `${FILES_TABLE_NAME}(name)`,
  },
  {
    name: "recording",
    type: "TEXT",
    fkey: `${FILES_TABLE_NAME}(name)`,
  },
  {
    name: "rtmp_server",
    type: "TEXT",
  },
  {
    name: "rtmp_key",
    type: "TEXT",
  },
  {
    name: "public_name",
    type: "TEXT",
  },
  {
    name: "discord_id",
    type: "TEXT",
  },
  {
    name: "past_events",
    type: "TEXT[]",
  },
]);
export const PROMOS_TABLE_0: Table = new Table(PROMOS_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "promo_file",
    type: "TEXT",
    fkey: `${FILES_TABLE_NAME}(name)`,
  },
]);
export const EVENTS_TABLE_0: Table = new Table(EVENTS_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "djs",
    type: `JSONB`,
  },
  {
    name: "promos",
    type: "TEXT[]",
  },
  {
    name: "theme",
    type: "TEXT",
    fkey: `${THEMES_TABLE_NAME}(name)`,
  },
  {
    name: "date",
    type: "TEXT",
  },
  {
    name: "start_time",
    type: "TEXT",
  },
  {
    name: "public",
    type: "BOOLEAN",
  },
]);
export const THEMES_TABLE_0: Table = new Table(THEMES_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "overlay_file",
    type: "TEXT",
    fkey: `${FILES_TABLE_NAME}(name)`,
  },
  {
    name: "stinger_file",
    type: "TEXT",
    fkey: `${FILES_TABLE_NAME}(name)`,
  },
  {
    name: "starting_file",
    type: "TEXT",
    fkey: `${FILES_TABLE_NAME}(name)`,
  },
  {
    name: "ending_file",
    type: "TEXT",
    fkey: `${FILES_TABLE_NAME}(name)`,
  },
  {
    name: "target_video_width",
    type: "SMALLINT",
  },
  {
    name: "target_video_height",
    type: "SMALLINT",
  },
  {
    name: "video_offset_x",
    type: "SMALLINT",
  },
  {
    name: "video_offset_y",
    type: "SMALLINT",
  },
  {
    name: "chat_width",
    type: "SMALLINT",
  },
  {
    name: "chat_height",
    type: "SMALLINT",
  },
  {
    name: "chat_offset_x",
    type: "SMALLINT",
  },
  {
    name: "chat_offset_y",
    type: "SMALLINT",
  },
]);
export const FILES_TABLE_0: Table = new Table(FILES_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "root",
    type: "TEXT",
  },
  {
    name: "file_path",
    type: "TEXT",
  },
  {
    name: "url_path",
    type: "TEXT",
  },
]);
export const APP_THEMES_TABLE_0: Table = new Table(APP_THEMES_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "style",
    type: `JSONB`,
  },
]);
export const ALL_TABLES = [
  FILES_TABLE_0,
  THEMES_TABLE_0,
  PROMOS_TABLE_0,
  DJS_TABLE_0,
  EVENTS_TABLE_0,
  APP_THEMES_TABLE_0,
];
