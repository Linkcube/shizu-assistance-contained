import {
  internal_insert_into_table,
  internal_update_table_entry,
  internal_get_row_from_table,
  is_non_empty,
} from "./helper_functions";
import { fileNotFoundError, invalidThemeError } from "../errors";
import { EVENTS_TABLE, FILES_TABLE, THEMES_TABLE } from "../tables";
import { IEventObject, IThemeObject } from "../types";
import { PoolClient } from "pg";

/**
 * Validates theme data against database constraints
 * @param theme_data - The theme object to validate
 * @param update - Whether this is an update operation
 * @param pool - Database connection client
 * @returns Error if validation fails, undefined otherwise
 */
const validate_theme = async (
  theme_data: IThemeObject,
  update: boolean,
  pool: PoolClient,
) => {
  let exists = await pool.query(
    `SELECT 1 FROM ${THEMES_TABLE.name} WHERE name = $1`,
    [theme_data.name],
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return invalidThemeError(`Theme ${theme_data.name} already exists!`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidThemeError(`Theme ${theme_data.name} already exists!`);
    }
  }
  if (is_non_empty(theme_data.overlay_file)) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1;`,
      [theme_data.overlay_file],
    );
    if (!exists.rows || exists.rows.length === 0) {
      return fileNotFoundError(
        `Overlay file ${theme_data.overlay_file} does not exist, add all files to the DB before attempting to reference them.`,
      );
    }
  }
  if (is_non_empty(theme_data.stinger_file)) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1;`,
      [theme_data.stinger_file],
    );
    if (!exists.rows || exists.rows.length === 0) {
      return fileNotFoundError(
        `Stinger file ${theme_data.stinger_file} does not exist, add all files to the DB before attempting to reference them.`,
      );
    }
  }
  if (is_non_empty(theme_data.starting_file)) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1;`,
      [theme_data.starting_file],
    );
    if (!exists.rows || exists.rows.length === 0) {
      return fileNotFoundError(
        `Starting file ${theme_data.starting_file} does not exist, add all files to the DB before attempting to reference them.`,
      );
    }
  }
  if (is_non_empty(theme_data.ending_file)) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1;`,
      [theme_data.ending_file],
    );
    if (!exists.rows || exists.rows.length === 0) {
      return fileNotFoundError(
        `Ending file ${theme_data.ending_file} does not exist, add all files to the DB before attempting to reference them.`,
      );
    }
  }
};

/**
 * Inserts a new theme into the database
 * @param theme_data - The theme object to insert
 * @param pool - Database connection client
 * @returns Error if validation fails, undefined on success
 */
export const internal_insert_into_themes = async (
  theme_data: IThemeObject,
  pool: PoolClient,
) => {
  // Validate theme values
  const validation = await validate_theme(theme_data, false, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_insert_into_table(THEMES_TABLE, theme_data, pool);
};

/**
 * Updates an existing theme in the database
 * @param theme_data - The theme object with updated values
 * @param pool - Database connection client
 * @returns Error if validation fails, undefined on success
 */
export const internal_update_theme = async (
  theme_data: IThemeObject,
  pool: PoolClient,
) => {
  // Validate theme values
  const validation = await validate_theme(theme_data, true, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_update_table_entry(
    THEMES_TABLE,
    theme_data.name,
    theme_data,
    pool,
  );
};

/**
 * Deletes a theme and removes all references to it from events
 * @param theme_name - The name of the theme to delete
 * @param pool - Database connection client
 * @returns Error if theme not found, undefined on success
 */
export const internal_delete_theme = async (
  theme_name: string,
  pool: PoolClient,
) => {
  const theme = (await internal_get_row_from_table(
    THEMES_TABLE,
    theme_name,
    pool,
  )) as IEventObject | Error;
  if (theme instanceof Error) return theme;

  // Null out theme for all events using this theme
  const default_events_query = `UPDATE ${EVENTS_TABLE.name} SET theme = DEFAULT WHERE theme = $1;`;
  console.log(default_events_query, theme_name);
  await pool.query(default_events_query, [theme_name]);

  const delete_query = `DELETE FROM ${THEMES_TABLE.name} WHERE name = $1;`;
  console.log(delete_query, theme_name);

  await pool.query(delete_query, [theme_name]);
};
