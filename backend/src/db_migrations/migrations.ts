import { Client } from "pg";
import {
  DJS_TABLE_0,
  PROMOS_TABLE_0,
  EVENTS_TABLE_0,
  THEMES_TABLE_0,
  FILES_TABLE_0,
  APP_THEMES_TABLE_0,
} from "./initial_tables";
import { FILES_TABLE_NAME, THEMES_TABLE_NAME } from "../tables";

// Create base version of all tables, if they don't exist.
const initial_setup = async (client: Client) => {
  console.log("Starting initial table setup.");
  const initial_tables = [
    DJS_TABLE_0,
    PROMOS_TABLE_0,
    EVENTS_TABLE_0,
    THEMES_TABLE_0,
    FILES_TABLE_0,
    APP_THEMES_TABLE_0,
  ];
  for (const table of initial_tables) {
    await client.query(table.create_table());
  }
  console.log("Completed initial table setup.");
};

// Introduce opening bgm
const migration_1 = async (client: Client) => {
  console.log("Starting migration 1.");
  await client.query(
    `ALTER TABLE "${THEMES_TABLE_NAME}" ADD COLUMN IF NOT EXISTS starting_bgm_file text references ${FILES_TABLE_NAME}(name);`,
  );
  console.log("Completed migration 1.");
};

export const run_migrations = async (client: Client) => {
  client.connect();

  try {
    await client.query("BEGIN");
    // Migrations go here
    await initial_setup(client);
    await migration_1(client);
    // Commit transaction
    await client.query("COMMIT");
  } catch (e) {
    // Rollback on error
    await client.query("ROLLBACK");
    await client.end();
    throw e;
  }
};
