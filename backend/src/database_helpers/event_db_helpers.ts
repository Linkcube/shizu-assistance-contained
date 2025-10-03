import { PoolClient } from "pg";
import {
  internal_insert_into_table,
  internal_get_row_from_table,
  internal_update_table_entry,
  is_non_empty,
  make_array_update_query,
} from "./helper_functions";
import {
  invalidEventError,
  invalidPromoError,
  promoNotFoundError,
  themeNotFoundError,
  invalidActionError,
} from "../errors";
import {
  EVENTS_TABLE,
  PROMOS_TABLE,
  THEMES_TABLE,
  EVENT_DJS_TABLE,
} from "../tables";
import { IEventObject } from "../types";

/**
 * Validates event data against database constraints before insertion or updates
 * @param event_data - The event object to validate
 * @param update - Boolean flag indicating if this is an update operation
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | undefined> - Error if validation fails, otherwise undefined
 */
const validate_event = async (
  event_data: IEventObject,
  update: boolean,
  pool: PoolClient,
) => {
  let exists = await pool.query(
    `SELECT 1 FROM ${EVENTS_TABLE.name} WHERE name = $1;`,
    [event_data.name],
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return invalidEventError(`Event ${event_data.name} already exists!`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidEventError(`Event ${event_data.name} already exists!`);
    }
  }
  if (event_data.promos !== undefined && event_data.promos.length > 0) {
    const placeholders = event_data.promos
      .map((_, index) => `$${index + 1}`)
      .join(",");
    exists = await pool.query(
      `SELECT * FROM ${PROMOS_TABLE.name} WHERE name in (${placeholders});`,
      event_data.promos,
    );
    if (!exists.rows || exists.rows.length !== event_data.promos.length) {
      const db_promos = exists.rows.map((row) => row.name);
      const missing_set = event_data.promos.filter(
        (promo) => !db_promos.includes(promo),
      );
      return promoNotFoundError(
        `The following promos do not exist (${missing_set}), add promos to the DB before attempting to reference them.`,
      );
    }
  }
  if (is_non_empty(event_data.theme)) {
    exists = await pool.query(
      `SELECT 1 FROM ${THEMES_TABLE.name} WHERE name = $1;`,
      [event_data.theme],
    );
    if (!exists.rows || exists.rows.length === 0) {
      return themeNotFoundError(
        `Theme ${event_data.theme} does not exist, add themes to the DB before attempting to reference them.`,
      );
    }
  }
};

/**
 * Retrieves all events from the database ordered by date and time
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<any> - Database query result containing ordered events
 */
export const internal_get_events_ordered = (pool: PoolClient) => {
  const query = `SELECT * FROM ${EVENTS_TABLE.name} ORDER BY date DESC NULLS LAST, start_time DESC, name ASC;`;
  console.log(query);
  return pool.query(query);
};

/**
 * Inserts a new event into the database after validation
 * @param event_data - The event object to insert
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | undefined> - Error if insertion fails, otherwise undefined
 */
export const internal_insert_into_events = async (
  event_data: IEventObject,
  pool: PoolClient,
) => {
  // Validate event values
  const validation = await validate_event(event_data, false, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_insert_into_table(EVENTS_TABLE, event_data, pool);
};

/**
 * Adds a promo to an existing event
 * @param event_name - Name of the event to modify
 * @param promo_name - Name of the promo to add
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | string> - Error if operation fails, "Done" on success
 */
export const internal_event_add_promo = async (
  event_name: string,
  promo_name: string,
  pool: PoolClient,
) => {
  const promo = await internal_get_row_from_table(
    PROMOS_TABLE,
    promo_name,
    pool,
  );
  if (promo instanceof Error) return promo;
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;
  let event_promos = event.promos;
  if (!event_promos || event_promos.length === 0) {
    event_promos = [promo_name];
  } else {
    const event_promo_index = event_promos.findIndex(
      (event_promo: string) => event_promo === promo_name,
    );
    if (event_promo_index !== -1) {
      return invalidPromoError(
        `Promo ${promo_name} already exists in Event ${event_name}.`,
      );
    }
    event_promos.push(promo_name);
  }

  console.log(event_promos);

  await make_array_update_query(
    EVENTS_TABLE,
    "promos",
    event_promos,
    event_name,
    pool,
  );
};

/**
 * Updates an existing event in the database after validation
 * @param event_data - The updated event object
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | undefined> - Error if update fails, otherwise undefined
 */
export const internal_update_event = async (
  event_data: IEventObject,
  pool: PoolClient,
) => {
  // Validate event values
  const validation = await validate_event(event_data, true, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_update_table_entry(
    EVENTS_TABLE,
    event_data.name,
    event_data,
    pool,
  );
};

/**
 * Removes a promo from an existing event
 * @param event_name - Name of the event to modify
 * @param promo_name - Name of the promo to remove
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | string> - Error if operation fails, "Done" on success
 */
export const internal_remove_event_promo = async (
  event_name: string,
  promo_name: string,
  pool: PoolClient,
) => {
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;
  const event_promos = event.promos;
  if (!event_promos || event_promos.length === 0) {
    return invalidPromoError(
      `Promo ${promo_name} does not exist in Event ${event_name}.`,
    );
  }
  const event_promo_index = event_promos.findIndex(
    (promo: string) => promo === promo_name,
  );
  if (event_promo_index === -1) {
    return invalidPromoError(
      `Promo ${promo_name} does not exist in Event ${event_name}.`,
    );
  }

  const new_promo_array = event_promos.filter((promo) => promo !== promo_name);
  await make_array_update_query(
    EVENTS_TABLE,
    "promos",
    new_promo_array,
    event_name,
    pool,
  );
};

/**
 * Moves a promo from one position to another within an event's promo array
 * @param event_name - Name of the event containing promos
 * @param index_a - Source index of the promo to move
 * @param index_b - Target index for the promo
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | string> - Error if operation fails, "Done" on success
 */
export const internal_move_event_promo = async (
  event_name: string,
  index_a: number,
  index_b: number,
  pool: PoolClient,
) => {
  const event = await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  );
  if (event instanceof Error) return event;
  if (
    index_a < 0 ||
    index_a >= event.promos.length ||
    index_b < 0 ||
    index_b >= event.promos.length
  ) {
    return invalidActionError(
      `The move indexes (${index_a}, ${index_b}) are not valid for Event ${event_name}.`,
    );
  }

  if (index_a === index_b) return "Done";

  const moving_value = event.promos[index_a];
  const target_value = event.promos[index_b];
  event.promos.splice(index_a, 1);
  if (index_a > index_b) {
    event.promos.splice(event.promos.indexOf(target_value), 0, moving_value);
  } else {
    event.promos.splice(
      event.promos.indexOf(target_value) + 1,
      0,
      moving_value,
    );
  }

  await make_array_update_query(
    EVENTS_TABLE,
    "promos",
    event.promo,
    event_name,
    pool,
  );
};

/**
 * Deletes an event and its associated DJ assignments from the database
 * @param event_name - Name of the event to delete
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | undefined> - Error if deletion fails, otherwise undefined
 */
export const internal_delete_event = async (
  event_name: string,
  pool: PoolClient,
) => {
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;

  const event_dj_query = `DELETE FROM ${EVENT_DJS_TABLE.name} WHERE event = $1`;
  console.log(event_dj_query, event_name);

  await pool.query(event_dj_query, [event_name]);

  const query = `DELETE FROM ${EVENTS_TABLE.name} WHERE name = $1`;
  console.log(query, event_name);

  await pool.query(query, [event_name]);
};

/**
 * Sets the theme for an existing event
 * @param event_name - Name of the event to modify
 * @param theme_name - Name of the theme to set
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | undefined> - Error if operation fails, otherwise undefined
 */
export const internal_set_event_theme = async (
  event_name: string,
  theme_name: string,
  pool: PoolClient,
) => {
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;

  const query = `UPDATE ${EVENTS_TABLE.name} SET theme = $1 WHERE name = $2;`;
  console.log(query, [theme_name, event_name]);

  await pool.query(query, [theme_name, event_name]);
};

/**
 * Updates the date and/or start time of an existing event
 * @param event_name - Name of the event to modify
 * @param date - New date value (optional)
 * @param start_time - New start time value (optional)
 * @param pool - PostgreSQL connection pool client
 * @returns Promise<Error | undefined> - Error if operation fails, otherwise undefined
 */
export const internal_set_event_date_time = async (
  event_name: string,
  date: string,
  start_time: string,
  pool: PoolClient,
) => {
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;

  if (date) {
    const query = `UPDATE ${EVENTS_TABLE.name} SET date = $1 WHERE name = $2;`;
    console.log(query, [date, event_name]);
    await pool.query(query, [date, event_name]);
  }

  if (start_time) {
    const query = `UPDATE ${EVENTS_TABLE.name} SET start_time = $1 WHERE name = $2;`;
    console.log(query, [start_time, event_name]);
    await pool.query(query, [start_time, event_name]);
  }
};
