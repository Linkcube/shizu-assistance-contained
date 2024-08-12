import { IColumnDefinition } from "./types";

// SQL Tables class, defines table schema and has simple boilerplate query generation.

// Boilderplate query generator
export class Table {
  name: string;
  definitions: IColumnDefinition[];
  columns: string[];
  constructor(name: string, definitions: IColumnDefinition[]) {
    this.name = name;
    this.definitions = definitions;
    this.columns = definitions.map((col) => col.name);
  }

  private definitions_to_string = () => {
    const def_strings = this.definitions.map((def) => {
      if (def.fkey) {
        return `${def.name} ${def.type} references ${def.fkey}`;
      }
      return `${def.name} ${def.type}`;
    });
    return def_strings.join(", ");
  };

  public create_table() {
    return `CREATE TABLE ${this.name}(${this.definitions_to_string()});`;
  }

  public exists() {
    return `SELECT 1 FROM pg_tables WHERE tablename = '${this.name}';`;
  }

  public select() {
    return `SELECT * FROM ${this.name};`;
  }

  public get_single(primary_key: string) {
    return `SELECT * FROM ${this.name} WHERE ${this.columns[0]} = '${primary_key}';`;
  }

  public insert_into(values: string) {
    return `INSERT INTO ${this.name} VALUES ${values};`;
  }
}

const DJS = "djs";
const PROMOS = "promos";
const EVENTS = "events";
const THEMES = "themes";
const FILES = "files";
const APP_THEMES = "app_themes";
export const DJS_TABLE: Table = new Table(DJS, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "logo",
    type: "TEXT",
    fkey: `${FILES}(name)`,
  },
  {
    name: "recording",
    type: "TEXT",
    fkey: `${FILES}(name)`,
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
export const PROMOS_TABLE: Table = new Table(PROMOS, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "promo_file",
    type: "TEXT",
    fkey: `${FILES}(name)`,
  },
]);
export const EVENTS_TABLE: Table = new Table(EVENTS, [
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
    fkey: `${THEMES}(name)`,
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
export const THEMES_TABLE: Table = new Table(THEMES, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "overlay_file",
    type: "TEXT",
    fkey: `${FILES}(name)`,
  },
  {
    name: "stinger_file",
    type: "TEXT",
    fkey: `${FILES}(name)`,
  },
  {
    name: "starting_file",
    type: "TEXT",
    fkey: `${FILES}(name)`,
  },
  {
    name: "ending_file",
    type: "TEXT",
    fkey: `${FILES}(name)`,
  },
  {
    name: "target_video_width",
    type: "SMALLINT"
  },
  {
    name: "target_video_height",
    type: "SMALLINT"
  },
  {
    name: "video_offset_x",
    type: "SMALLINT"
  },
  {
    name: "video_offset_y",
    type: "SMALLINT"
  },
  {
    name: "chat_width",
    type: "SMALLINT"
  },
  {
    name: "chat_height",
    type: "SMALLINT"
  },
  {
    name: "chat_offset_x",
    type: "SMALLINT"
  },
  {
    name: "chat_offset_y",
    type: "SMALLINT"
  },
]);
export const FILES_TABLE: Table = new Table(FILES, [
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
export const APP_THEMES_TABLE: Table = new Table(APP_THEMES, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "style",
    type: `JSONB`,
  },
])
export const ALL_TABLES = [
  FILES_TABLE,
  THEMES_TABLE,
  PROMOS_TABLE,
  DJS_TABLE,
  EVENTS_TABLE,
  APP_THEMES_TABLE
];
