import { IColumnDefinition } from "./types";

// SQL Tables class, defines table schema and has simple boilerplate query generation.
// With the introduction of migrations, these definitions are for the post-migration states.

// Boilderplate query generator
export class Table {
  name: string;
  definitions: IColumnDefinition[];
  columns: string[];
  primary_key: string;
  constructor(
    name: string,
    definitions: IColumnDefinition[],
    pkey_definition?: string,
  ) {
    this.name = name;
    this.definitions = definitions;
    this.columns = definitions.map((col) => col.name);
    if (pkey_definition) {
      this.primary_key = pkey_definition;
    } else {
      this.primary_key = this.columns[0];
    }
  }

  private definitions_to_string = () => {
    const def_strings = this.definitions.map((def) => {
      if (def.fkey) {
        return `${def.name} ${def.type} references ${def.fkey}`;
      } else if (def.multi_col) {
        return `${def.type} (${def.name})`;
      }
      return `${def.name} ${def.type}`;
    });
    return def_strings.join(", ");
  };

  public create_table() {
    return `CREATE TABLE IF NOT EXISTS "${this.name}" (${this.definitions_to_string()});`;
  }

  public exists() {
    return `SELECT 1 FROM pg_tables WHERE tablename = '${this.name}';`;
  }

  public select() {
    return `SELECT * FROM ${this.name};`;
  }

  public get_single(primary_key: string) {
    // In lieu of actually keeping track, remove later
    if (this.primary_key === this.columns[0]) {
      return `SELECT * FROM ${this.name} WHERE ${this.primary_key} = '${primary_key}';`;
    } else {
      return `SELECT * FROM ${this.name} WHERE ${this.primary_key} = ${primary_key};`;
    }
  }

  public insert_into(values: string) {
    return `INSERT INTO ${this.name} VALUES ${values};`;
  }

  public delete_entry(primary_key: string) {
    if (this.primary_key === this.columns[0]) {
      return `DELETE FROM ${this.name} WHERE ${this.primary_key} = '${primary_key}'`;
    } else {
      return `DELETE FROM ${this.name} WHERE ${this.primary_key} = ${primary_key}`;
    }
  }
}

export const DJS_TABLE_NAME = "djs";
export const PROMOS_TABLE_NAME = "promos";
export const EVENTS_TABLE_NAME = "events";
export const THEMES_TABLE_NAME = "themes";
export const FILES_TABLE_NAME = "files";
export const APP_THEMES_TABLE_NAME = "app_themes";
export const EVENT_DJS_TABLE_NAME = "event_djs";
export const DJS_TABLE: Table = new Table(DJS_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
    no_updates: true,
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
export const PROMOS_TABLE: Table = new Table(PROMOS_TABLE_NAME, [
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
export const EVENTS_TABLE: Table = new Table(EVENTS_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
    no_updates: true,
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
export const THEMES_TABLE: Table = new Table(THEMES_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
    no_updates: true,
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
    name: "starting_bgm_file",
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
export const FILES_TABLE: Table = new Table(FILES_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
    no_updates: true,
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
export const APP_THEMES_TABLE: Table = new Table(APP_THEMES_TABLE_NAME, [
  {
    name: "name",
    type: "TEXT PRIMARY KEY",
  },
  {
    name: "style",
    type: `JSONB`,
  },
]);
// TODO: add pkey to col, remove PRIMARY KEY from type and handle logic/formatting in the object
export const EVENT_DJS_TABLE: Table = new Table(
  EVENT_DJS_TABLE_NAME,
  [
    {
      name: "event",
      type: "TEXT",
      fkey: `${EVENTS_TABLE_NAME}(name)`,
      no_updates: true,
    },
    {
      name: "dj",
      type: "TEXT",
      fkey: `${DJS_TABLE_NAME}(name)`,
      no_updates: true,
    },
    {
      name: "event, dj",
      type: "PRIMARY KEY",
      multi_col: true,
      no_updates: true,
    },
    {
      name: "is_live",
      type: "BOOLEAN",
    },
    {
      name: "recording",
      type: "TEXT",
      fkey: `${FILES_TABLE_NAME}(name)`,
    },
    {
      name: "vj",
      type: "TEXT",
    },
    {
      name: "position",
      type: "SMALLINT",
    },
  ],
  "(event, dj)",
);
export const ALL_TABLES = [
  FILES_TABLE,
  THEMES_TABLE,
  PROMOS_TABLE,
  DJS_TABLE,
  EVENTS_TABLE,
  APP_THEMES_TABLE,
  EVENT_DJS_TABLE,
];
