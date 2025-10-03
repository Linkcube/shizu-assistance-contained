import {
  internal_insert_into_table,
  internal_update_table_entry,
  internal_get_row_from_table,
  is_non_empty,
} from "./helper_functions";
import {
  djNotFoundError,
  invalidActionError,
  invalidDjError,
  invalidEventError,
  invalidFileError,
} from "../errors";
import { FILES_TABLE, EVENT_DJS_TABLE, EVENTS_TABLE } from "../tables";
import { IEventDjObject } from "../types";
import { PoolClient, QueryResult } from "pg";

/**
 * Validates an event DJ object for insertion or update operations
 * Checks if the combination of event and dj already exists (for insertions)
 *  and verifies referenced recording files exist
 * @param event_dj_object - The event DJ object to validate
 * @param update - Whether this is an update operation (true) or insertion (false)
 * @param pool - Database connection pool
 * @returns Promise resolving to validation result or error
 */
const validate_event_dj = async (
  event_dj_object: IEventDjObject,
  update: boolean,
  pool: PoolClient,
) => {
  const exists: QueryResult<IEventDjObject> = await pool.query(
    `SELECT * FROM ${EVENT_DJS_TABLE.name} WHERE event = $1 and dj = $2;`,
    [event_dj_object.event, event_dj_object.dj],
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return djNotFoundError(
        `Event DJ ${event_dj_object.event}:${event_dj_object.dj} does not exist.`,
      );
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidDjError(
        `Event DJ ${event_dj_object.event}:${event_dj_object.dj} already exists!`,
      );
    }
  }
  if (is_non_empty(event_dj_object.recording)) {
    const file_exists = await pool.query(
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1`,
      [event_dj_object.recording],
    );
    if (!file_exists.rows || file_exists.rows.length === 0) {
      return invalidFileError(
        `Recording file ${event_dj_object.recording} does not exist, add files to the DB before attempting to reference them.`,
      );
    }
  }
  return exists.rows[0];
};

/**
 * Retrieves a specific event DJ entry by event name and DJ name
 * Uses internal_get_row_from_table with a composite key for lookup
 * @param event_name - The name of the event
 * @param dj_name - The name of the DJ
 * @param pool - Database connection pool
 * @returns Promise resolving to the event DJ object or error
 */
export const internal_get_event_dj = async (
  event_name: string,
  dj_name: string,
  pool: PoolClient,
) => {
  const event_dj = (await internal_get_row_from_table(
    EVENT_DJS_TABLE,
    "",
    pool,
    [event_name, dj_name],
  )) as IEventDjObject | Error;
  if (event_dj instanceof Error) return event_dj;
  return event_dj;
};

/**
 * Retrieves all event DJ entries for a specific event, ordered by position
 * Returns an array of IEventDjObject rows from the database
 * @param event_name - The name of the event to retrieve DJs for
 * @param pool - Database connection pool
 * @returns Promise resolving to array of event DJ objects
 */
export const internal_get_event_djs_by_event = async (
  event_name: string,
  pool: PoolClient,
) => {
  const retval: QueryResult<IEventDjObject> = await pool.query(
    `SELECT * FROM ${EVENT_DJS_TABLE.name} WHERE event = $1 ORDER BY position;`,
    [event_name],
  );
  return retval.rows;
};

/**
 * Retrieves all events associated with a specific DJ, ordered by date and event name
 * Joins the EVENT_DJS_TABLE with EVENTS_TABLE to get event details
 * @param dj_name - The name of the DJ to retrieve events for
 * @param pool - Database connection pool
 * @returns Promise resolving to array of event objects
 */
export const internal_get_event_djs_by_dj = async (
  dj_name: string,
  pool: PoolClient,
) => {
  const retval: QueryResult<any> = await pool.query(
    `SELECT event, is_live, vj, date FROM ${EVENT_DJS_TABLE.name} INNER JOIN ${EVENTS_TABLE.name} ON name = event WHERE dj = $1 ORDER BY date asc, event asc;`,
    [dj_name],
  );
  return retval.rows;
};

/**
 * Inserts a new event DJ entry into the database
 * Validates the data before insertion and automatically assigns correct position
 * @param event_dj_data - The event DJ object to insert
 * @param pool - Database connection pool
 * @returns Promise resolving when insertion is complete
 */
export const internal_insert_into_event_djs = async (
  event_dj_data: IEventDjObject,
  pool: PoolClient,
) => {
  const validation = await validate_event_dj(event_dj_data, false, pool);
  if (validation instanceof Error) return validation;

  // Get last position
  const number_of_event_djs = await internal_get_event_djs_by_event(
    event_dj_data.event,
    pool,
  );
  event_dj_data.position = number_of_event_djs.length;

  // Add to DB
  await internal_insert_into_table(EVENT_DJS_TABLE, event_dj_data, pool);
};

/**
 * Updates an existing event DJ entry in the database
 * Validates that the entry exists before updating and preserves original position
 * @param event_dj_data - The event DJ object with updated data
 * @param pool - Database connection pool
 * @returns Promise resolving when update is complete
 */
export const internal_update_event_dj = async (
  event_dj_data: IEventDjObject,
  pool: PoolClient,
) => {
  const validation = await validate_event_dj(event_dj_data, true, pool);
  if (validation instanceof Error) return validation;

  // Keep position
  event_dj_data.position = validation.position;

  // Add to DB
  await internal_update_table_entry(EVENT_DJS_TABLE, "", event_dj_data, pool, [
    event_dj_data.event,
    event_dj_data.dj,
  ]);
};

/**
 * Moves an event DJ from one position to another within an event
 * Handles shifting other DJs' positions appropriately during the move operation
 * @param event_name - The name of the event containing the DJs
 * @param index_a - The current position of the DJ to move
 * @param index_b - The target position for the DJ
 * @param pool - Database connection pool
 * @returns Promise resolving to "Done" when movement is complete or error
 */
export const internal_move_event_dj = async (
  event_name: string,
  index_a: number,
  index_b: number,
  pool: PoolClient,
) => {
  const event_djs = await internal_get_event_djs_by_event(event_name, pool);
  if (event_djs.length === 0)
    return invalidEventError(`No DJs found for event ${event_name}`);
  if (
    index_a < 0 ||
    index_a >= event_djs.length ||
    index_b < 0 ||
    index_b >= event_djs.length
  ) {
    return invalidActionError(
      `The move indexes (${index_a}, ${index_b}) are not valid for Event ${event_name}.`,
    );
  }
  if (index_a === index_b) return "Done";

  const moving_event_dj = event_djs[index_a];

  if (index_a > index_b) {
    const shift_down = event_djs.slice(index_b, index_a);
    for (const shift_dj of shift_down) {
      shift_dj.position += 1;
      await internal_update_event_dj(shift_dj, pool);
    }
  } else {
    const shift_up = event_djs.slice(index_a + 1, index_b + 1);
    for (const shift_dj of shift_up) {
      shift_dj.position -= 1;
      await internal_update_event_dj(shift_dj, pool);
    }
  }

  moving_event_dj.position = index_b;
  await internal_update_event_dj(moving_event_dj, pool);
};

/**
 * Updates the list of DJs for an event, handling additions, deletions, and updates
 * Maintains proper positioning for all DJs in the updated list
 * @param event_name - The name of the event to update
 * @param new_event_djs - Array of new event DJ objects
 * @param pool - Database connection pool
 * @returns Promise resolving when all changes are complete
 */
export const internal_static_change_event_djs = async (
  event_name: string,
  new_event_djs: IEventDjObject[],
  pool: PoolClient,
) => {
  const current_event_djs = await internal_get_event_djs_by_event(
    event_name,
    pool,
  );
  const new_event_dj_names = new_event_djs.map((dj) => dj.dj);
  const deleted_djs = current_event_djs.filter(
    (event_dj) => !new_event_dj_names.includes(event_dj.dj),
  );
  const old_dj_names = current_event_djs.map((dj) => dj.dj);
  const new_djs = new_event_djs
    .map((dj) => dj.dj)
    .filter((event_dj) => !old_dj_names.includes(event_dj));

  // Delete old entries
  for (const delete_dj of deleted_djs) {
    await pool.query(EVENT_DJS_TABLE.delete_entry(), [
      delete_dj.event,
      delete_dj.dj,
    ]);
  }

  // Create/Update as needed with new positions
  for (let i = 0; i < new_event_djs.length; i++) {
    const event_dj = new_event_djs[i];
    event_dj.position = i;
    if (new_djs.includes(event_dj.dj)) {
      await internal_insert_into_event_djs(event_dj, pool);
    } else {
      await internal_update_table_entry(EVENT_DJS_TABLE, "", event_dj, pool, [
        event_dj.event,
        event_dj.dj,
      ]);
    }
  }
};

/**
 * Deletes an event DJ entry and shifts remaining DJs' positions accordingly
 * Validates that the entry exists before deletion and updates all subsequent entries
 * Expect this to be called after an event.events_djs/event/dj deletion call
 * @param event_name - The name of the event containing the DJ to delete
 * @param dj_name - The name of the DJ to delete
 * @param pool - Database connection pool
 * @returns Promise resolving when deletion is complete or error
 */
export const internal_delete_event_dj = async (
  event_name: string,
  dj_name: string,
  pool: PoolClient,
) => {
  // Validate entry exists
  const event_dj = (await internal_get_row_from_table(
    EVENT_DJS_TABLE,
    "",
    pool,
    [event_name, dj_name],
  )) as IEventDjObject | Error;
  if (event_dj instanceof Error) return event_dj;

  // Shift other entries
  const event_djs = await internal_get_event_djs_by_event(event_name, pool);
  for (const shifting_dj of event_djs.slice(event_dj.position)) {
    shifting_dj.position -= 1;
    await internal_update_event_dj(shifting_dj, pool);
  }

  // Delete entry
  console.log(EVENT_DJS_TABLE.delete_entry(), [event_name, dj_name]);
  await pool.query(EVENT_DJS_TABLE.delete_entry(), [event_name, dj_name]);
};
