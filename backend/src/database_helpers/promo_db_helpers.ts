import {
  internal_insert_into_table,
  internal_update_table_entry,
  internal_get_row_from_table,
  is_non_empty,
} from "./helper_functions";
import {
  promoNotFoundError,
  invalidPromoError,
  fileNotFoundError,
} from "../errors";
import { PROMOS_TABLE, FILES_TABLE, EVENTS_TABLE } from "../tables";
import { IPromoObject, IEventObject } from "../types";
import { internal_remove_event_promo } from "./event_db_helpers";
import { PoolClient } from "pg";

/**
 * Validates promo data against database constraints
 * @param promo_data - The promo object to validate
 * @param update - Whether this is an update operation
 * @param pool - Database connection client
 * @returns Error if validation fails, undefined otherwise
 */
const validate_promo = async (
  promo_data: IPromoObject,
  update: boolean,
  pool: PoolClient,
) => {
  let exists = await pool.query(
    `SELECT 1 FROM ${PROMOS_TABLE.name} WHERE name = $1;`,
    [promo_data.name],
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return promoNotFoundError(`Promo ${promo_data.name} does not exist.`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidPromoError(`Promo ${promo_data.name} already exists!`);
    }
  }
  if (is_non_empty(promo_data.promo_file)) {
    exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1`,
      [promo_data.promo_file],
    );
    if (!exists.rows || exists.rows.length === 0) {
      return fileNotFoundError(
        `Promo file ${promo_data.promo_file} does not exist, add files to the DB before attempting to reference them.`,
      );
    }
  }
};

/**
 * Retrieves multiple promos by their names
 * @param promo_names - Array of promo names to retrieve
 * @param pool - Database connection client
 * @returns Database query results containing the requested promos
 */
export const internal_get_promos = async (
  promo_names: string[],
  pool: PoolClient,
) => {
  const placeholders_array = Array.from(
    { length: promo_names.length },
    (_, i) => `$${i + 1}`,
  ).join(",");
  const query = `
    SELECT * FROM ${PROMOS_TABLE.name}
      where ${PROMOS_TABLE.primary_key} in (${placeholders_array});`;

  console.log(query, promo_names);
  return pool.query(query, promo_names);
};

/**
 * Inserts a new promo into the database
 * @param promo_data - The promo object to insert
 * @param pool - Database connection client
 * @returns Error if validation fails, undefined on success
 */
export const internal_insert_into_promos = async (
  promo_data: IPromoObject,
  pool: PoolClient,
) => {
  // Validate promo values
  const validation = await validate_promo(promo_data, false, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_insert_into_table(PROMOS_TABLE, promo_data, pool);
};

/**
 * Updates an existing promo in the database
 * @param promo_data - The promo object with updated values
 * @param pool - Database connection client
 * @returns Error if validation fails, undefined on success
 */
export const internal_update_promo = async (
  promo_data: IPromoObject,
  pool: PoolClient,
) => {
  // Validate promo values
  const validation = await validate_promo(promo_data, true, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_update_table_entry(
    PROMOS_TABLE,
    promo_data.name,
    promo_data,
    pool,
  );
};

/**
 * Deletes a promo and removes all references to it from events
 * @param promo_name - The name of the promo to delete
 * @param pool - Database connection client
 * @returns Error if promo not found, undefined on success
 */
export const internal_delete_promo = async (
  promo_name: string,
  pool: PoolClient,
) => {
  const promo = (await internal_get_row_from_table(
    PROMOS_TABLE,
    promo_name,
    pool,
  )) as IEventObject | Error;
  if (promo instanceof Error) return promo;

  const events_with_promo_query = `SELECT * FROM ${EVENTS_TABLE.name} WHERE $1 = ANY (promos);`;
  console.log(events_with_promo_query, promo_name);
  const events_with_promo = await pool.query(events_with_promo_query, [
    promo_name,
  ]);

  if (events_with_promo.rows && events_with_promo.rows.length > 0) {
    await events_with_promo.rows.forEach(async (row: IEventObject) => {
      await internal_remove_event_promo(row.name, promo_name, pool);
    });
  }

  const delete_query = `DELETE FROM ${PROMOS_TABLE.name} WHERE name = $1`;
  console.log(delete_query, promo_name);

  await pool.query(delete_query, [promo_name]);
};
