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

const validate_dj = async (
  dj_data: IDjObject,
  update: boolean,
  pool: PoolClient,
) => {
  let exists = await pool.query(
    `SELECT 1 FROM ${DJS_TABLE.name} WHERE name = '${dj_data.name}';`,
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
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = '${dj_data.logo}'`,
    );
    if (!exists.rows || exists.rows.length === 0) {
      return invalidFileError(
        `Logo file ${dj_data.logo} does not exist, add files to the DB before attempting to reference them.`,
      );
    }
  }
};

export const dj_exists = async (dj_name: string, pool: PoolClient) => {
  const exists = await pool.query(
    `SELECT 1 FROM ${DJS_TABLE.name} WHERE name = '${dj_name}';`,
  );
  if (exists.rows && exists.rowCount && exists.rowCount > 0) {
    return true;
  }
  return djNotFoundError(`DJ ${dj_name} does not exist.`);
};

export const internal_get_djs = async (
  dj_names: string[],
  pool: PoolClient,
  event?: string,
) => {
  const formatted_names = dj_names.map((name) => `'${name}'`).join(", ");
  let query = `
    SELECT * FROM ${DJS_TABLE.name}
      where ${DJS_TABLE.primary_key} in (${formatted_names})`;
  if (event) {
    query += ` AND event = '${event}'`;
  }
  query += ";";

  console.log(query);
  return pool.query(query);
};

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

export const internal_delete_dj = async (dj_name: string, pool: PoolClient) => {
  const dj_does_exist = await dj_exists(dj_name, pool);
  if (dj_does_exist instanceof Error) return dj_does_exist;

  const event_djs_query = `SELECT * FROM ${EVENT_DJS_TABLE.name} WHERE dj = '${dj_name}';`;
  console.log(event_djs_query);
  const event_djs: QueryResult<IEventDjObject> =
    await pool.query(event_djs_query);

  if (event_djs.rows && event_djs.rows.length > 0) {
    for (const event_dj of event_djs.rows) {
      await internal_delete_event_dj(event_dj.event, dj_name, pool);
      if (event_dj.recording)
        await internal_delete_file(event_dj.recording, pool);
    }
  }

  const delete_query = `DELETE FROM ${DJS_TABLE.name} WHERE name = '${dj_name}';`;
  console.log(delete_query);

  await pool.query(delete_query);
};
