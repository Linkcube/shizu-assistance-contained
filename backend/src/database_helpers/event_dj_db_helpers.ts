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
import {
  DJS_TABLE,
  FILES_TABLE,
  EVENTS_TABLE,
  EVENT_DJS_TABLE,
} from "../tables";
import { IDjObject, IEventDjObject, IEventObject } from "../types";
import { PoolClient, QueryResult } from "pg";

const validate_event_dj = async (
  event_dj_object: IEventDjObject,
  update: boolean,
  pool: PoolClient,
) => {
  const exists: QueryResult<IEventDjObject> = await pool.query(
    `SELECT * FROM ${EVENT_DJS_TABLE.name} WHERE event = '${event_dj_object.event}' and dj = '${event_dj_object.dj}';`,
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
      `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = '${event_dj_object.recording}'`,
    );
    if (!file_exists.rows || file_exists.rows.length === 0) {
      return invalidFileError(
        `Recording file ${event_dj_object.recording} does not exist, add files to the DB before attempting to reference them.`,
      );
    }
  }
  return exists.rows[0];
};

export const internal_get_event_dj = async (
  event_name: string,
  dj_name: string,
  pool: PoolClient,
) => {
  const composite_key = `('${event_name}', '${dj_name}')`;
  const event_dj = (await internal_get_row_from_table(
    EVENT_DJS_TABLE,
    composite_key,
    pool,
  )) as IEventDjObject | Error;
  if (event_dj instanceof Error) return event_dj;
  return event_dj;
};

export const internal_get_event_djs_by_event = async (
  event_name: string,
  pool: PoolClient,
) => {
  const retval: QueryResult<IEventDjObject> = await pool.query(
    `SELECT * FROM ${EVENT_DJS_TABLE.name} WHERE event = '${event_name}' ORDER BY position;`,
  );
  return retval.rows;
};

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

export const internal_update_event_dj = async (
  event_dj_data: IEventDjObject,
  pool: PoolClient,
) => {
  const validation = await validate_event_dj(event_dj_data, true, pool);
  if (validation instanceof Error) return validation;

  // Keep position
  event_dj_data.position = validation.position;

  // Add to DB
  const composite_key = `('${event_dj_data.event}', '${event_dj_data.dj}')`;
  await internal_update_table_entry(
    EVENT_DJS_TABLE,
    composite_key,
    event_dj_data,
    pool,
  );
};

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
  const new_djs = new_event_djs.filter(
    (event_dj) => !old_dj_names.includes(event_dj.dj),
  );

  // Delete old entries
  for (const delete_dj of deleted_djs) {
    const composite_key = `('${delete_dj.event}', '${delete_dj.dj}')`;
    await pool.query(EVENT_DJS_TABLE.delete_entry(composite_key));
  }

  // Create/Update as needed with new positions
  for (let i = 0; i < new_event_djs.length; i++) {
    const event_dj = new_event_djs[i];
    const composite_key = `('${event_dj.event}', '${event_dj.dj}')`;
    event_dj.position = i;
    if (new_djs.includes(event_dj)) {
      await internal_update_table_entry(
        EVENT_DJS_TABLE,
        composite_key,
        event_dj,
        pool,
      );
    } else {
      await internal_update_table_entry(
        EVENT_DJS_TABLE,
        composite_key,
        event_dj,
        pool,
      );
    }
  }
};

// Expect this to be called after an event.events_djs/event/dj deletion call
export const internal_delete_event_dj = async (
  event_name: string,
  dj_name: string,
  pool: PoolClient,
) => {
  // Validate entry exists
  const composite_key = `('${event_name}', '${dj_name}')`;
  const event_dj = (await internal_get_row_from_table(
    EVENT_DJS_TABLE,
    composite_key,
    pool,
  )) as IEventDjObject | Error;
  if (event_dj instanceof Error) return event_dj;

  // Shift other entries
  const event_djs = await internal_get_event_djs_by_event(event_name, pool);
  for (const shifting_dj of event_djs.slice(event_dj.position)) {
    shifting_dj.position -= 1;
    await internal_update_event_dj(shifting_dj, pool);
  }

  // TODO: delete recording

  // Delete entry
  console.log(EVENT_DJS_TABLE.delete_entry(composite_key));
  await pool.query(EVENT_DJS_TABLE.delete_entry(composite_key));
};
