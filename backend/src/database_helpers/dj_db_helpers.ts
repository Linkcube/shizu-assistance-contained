import {
  internal_insert_into_table,
  internal_update_table_entry,
  is_non_empty,
} from "./helper_functions";
import { djNotFoundError, invalidDjError, invalidFileError } from "../errors";
import { DJS_TABLE, FILES_TABLE, EVENT_DJS_TABLE } from "../tables";
import { IDjObject, IEventDjObject } from "../types";
import { PoolClient, QueryResult } from "pg";
import { internal_delete_event_dj } from "./event_dj_db_helpers";
import { internal_delete_file } from "./file_db_helpers";

/**
 * Validates DJ data before insertion or update operations
 * @param dj_data - The DJ object to validate
 * @param update - Whether this is an update operation (true) or insert (false)
 * @param pool - Database connection pool
 * @returns Error if validation fails, undefined if successful
 */
const validate_dj = async (
  dj_data: IDjObject,
  update: boolean,
  pool: PoolClient,
) => {
  let exists = await pool.query(
    `SELECT 1 FROM ${DJS_TABLE.name} WHERE name = $1;`,
    [dj_data.name],
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return djNotFoundError(`DJ ${dj_data.name} does not exist.`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidDjError(`DJ ${dj_data.name} already exists!`);
    }
  }
  if (is_non_empty(dj_data.logo)) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1`,
      [dj_data.logo],
    );
    if (!exists.rows || exists.rows.length === 0) {
      return invalidFileError(
        `Logo file ${dj_data.logo} does not exist, add files to the DB before attempting to reference them.`,
      );
    }
  }
};

/**
 * Checks if a DJ exists in the database
 * @param dj_name - Name of the DJ to check
 * @param pool - Database connection pool
 * @returns boolean indicating if DJ exists, or error if not found
 */
export const dj_exists = async (dj_name: string, pool: PoolClient) => {
  const exists = await pool.query(
    `SELECT 1 FROM ${DJS_TABLE.name} WHERE name = $1;`,
    [dj_name],
  );
  if (exists.rows && exists.rowCount && exists.rowCount > 0) {
    return true;
  }
  return djNotFoundError(`DJ ${dj_name} does not exist.`);
};

/**
 * Retrieves multiple DJs from the database by their names
 * @param dj_names - Array of DJ names to retrieve
 * @param pool - Database connection pool
 * @param event - Optional event filter
 * @returns Query result containing matching DJs
 */
export const internal_get_djs = async (
  dj_names: string[],
  pool: PoolClient,
  event?: string,
) => {
  const placeholders = Array.from(
    { length: dj_names.length },
    (_, i) => `$${i + 1}`,
  ).join(",");
  let query = `SELECT * FROM ${DJS_TABLE.name} WHERE ${DJS_TABLE.primary_key} in (${placeholders});`;
  const params = [...dj_names];
  if (event !== undefined) {
    query += ` AND event = '${dj_names.length + 2}'`;
    params.push(event);
  }
  query += ";";
  return pool.query(query, params);
};

/**
 * Inserts a new DJ into the database
 * @param dj_data - The DJ object to insert
 * @param pool - Database connection pool
 * @returns Error if validation fails, undefined if successful
 */
export const internal_insert_into_djs = async (
  dj_data: IDjObject,
  pool: PoolClient,
) => {
  // Validate dj values
  const validation = await validate_dj(dj_data, false, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_insert_into_table(DJS_TABLE, dj_data, pool);
};

/**
 * Updates an existing DJ in the database
 * @param dj_data - The DJ object with updated values
 * @param pool - Database connection pool
 * @returns Error if validation fails, undefined if successful
 */
export const internal_update_dj = async (
  dj_data: IDjObject,
  pool: PoolClient,
) => {
  // Validate dj values
  const validation = await validate_dj(dj_data, true, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_update_table_entry(DJS_TABLE, dj_data.name, dj_data, pool);
};

/**
 * Deletes a DJ from the database and related records
 * @param dj_name - Name of the DJ to delete
 * @param pool - Database connection pool
 * @returns Error if DJ doesn't exist or deletion fails, undefined if successful
 */
export const internal_delete_dj = async (dj_name: string, pool: PoolClient) => {
  const dj_does_exist = await dj_exists(dj_name, pool);
  if (dj_does_exist instanceof Error) return dj_does_exist;

  const event_djs_query = `SELECT * FROM ${EVENT_DJS_TABLE.name} WHERE dj = $1;`;
  console.log(`${event_djs_query}, [${dj_name}]`);
  const event_djs: QueryResult<IEventDjObject> = await pool.query(
    event_djs_query,
    [dj_name],
  );

  if (event_djs.rows && event_djs.rows.length > 0) {
    for (const event_dj of event_djs.rows) {
      await internal_delete_event_dj(event_dj.event, dj_name, pool);
      if (event_dj.recording)
        await internal_delete_file(event_dj.recording, pool);
    }
  }

  const delete_query = `DELETE FROM ${DJS_TABLE.name} WHERE name = $1;`;
  console.log(`${delete_query}, [${dj_name}]`);

  await pool.query(delete_query, [dj_name]);
};
