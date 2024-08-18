import {
  internal_insert_into_table,
  internal_update_table_entry,
  internal_get_row_from_table,
} from "./helper_functions";
import { djNotFoundError, invalidDjError, invalidFileError } from "../errors";
import { DJS_TABLE, FILES_TABLE, EVENTS_TABLE } from "../tables";
import { IDjObject, IEventObject } from "../types";
import { internal_remove_event_dj } from "./event_db_helpers";
import { PoolClient } from "pg";

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
  if (dj_data.logo !== undefined) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = '${dj_data.logo}'`,
    );
    if (!exists.rows || exists.rows.length === 0) {
      return invalidFileError(
        `Logo file ${dj_data.logo} does not exist, add files to the DB before attempting to reference them.`,
      );
    }
  }
  if (dj_data.recording !== undefined) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = '${dj_data.recording}'`,
    );
    if (!exists.rows || exists.rows.length === 0) {
      return invalidFileError(
        `Recording file ${dj_data.recording} does not exist, add files to the DB before attempting to reference them.`,
      );
    }
  }
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
  await internal_update_table_entry(DJS_TABLE, dj_data, pool);
};

export const internal_delete_dj = async (dj_name: string, pool: PoolClient) => {
  const promo = (await internal_get_row_from_table(
    DJS_TABLE,
    dj_name,
    pool,
  )) as IEventObject | Error;
  if (promo instanceof Error) return promo;

  const events = await pool.query(`SELECT * FROM ${EVENTS_TABLE.name};`);

  if (events.rows && events.rows.length > 0) {
    // TODO: Replace with json index queries
    await events.rows.forEach(async (row: IEventObject) => {
      await internal_remove_event_dj(row.name, dj_name, pool);
    });
  }

  const delete_query = `DELETE FROM ${DJS_TABLE.name} WHERE name = '${dj_name}'`;
  console.log(delete_query);

  await pool.query(delete_query);
};
