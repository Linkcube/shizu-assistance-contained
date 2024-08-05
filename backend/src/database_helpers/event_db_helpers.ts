import { PoolClient } from "pg";
import {
  internal_insert_into_table,
  internal_get_row_from_table,
  internal_update_table_entry,
} from "./helper_functions";
import { InvalidFileError, InvalidDjError } from "../errors";
import { EVENTS_TABLE, DJS_TABLE, PROMOS_TABLE, THEMES_TABLE } from "../tables";
import { IEventObject, ILineupDjObject } from "../types";

const validate_event = async (
  event_data: IEventObject,
  update: boolean,
  pool: PoolClient,
) => {
  let exists = await pool.query(
    `SELECT 1 FROM ${EVENTS_TABLE.name} WHERE name = '${event_data.name}';`,
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return new InvalidFileError(`Event ${event_data.name} already exists!`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return new InvalidFileError(`Event ${event_data.name} already exists!`);
    }
  }
  if (event_data.djs !== undefined) {
    const djs_condition = event_data.djs
      .map((dj) => `name = '${dj.name}'`)
      .join(" OR ");
    exists = await pool.query(
      `SELECT * FROM ${DJS_TABLE.name} WHERE ${djs_condition};`,
    );
    if (!exists.rows || exists.rows.length !== event_data.djs.length) {
      const db_djs = exists.rows.map((row: ILineupDjObject) => row.name);
      const missing_set = event_data.djs.filter(
        (dj) => !db_djs.includes(dj.name),
      );
      return new InvalidDjError(
        `The following DJs do not exist (${missing_set}), add DJs to the DB before attempting to reference them.`,
      );
    }
  }
  if (event_data.promos !== undefined) {
    const promos_condition = event_data.promos
      .map((promo) => `name = '${promo}'`)
      .join(" OR ");
    exists = await pool.query(
      `SELECT * FROM ${PROMOS_TABLE.name} WHERE ${promos_condition};`,
    );
    if (!exists.rows || exists.rows.length !== event_data.promos.length) {
      const db_promos = exists.rows.map((row) => row.name);
      const missing_set = event_data.promos.filter(
        (promo) => !db_promos.includes(promo),
      );
      return new InvalidFileError(
        `The following promos do not exist (${missing_set}), add promos to the DB before attempting to reference them.`,
      );
    }
  }
  if (event_data.theme !== undefined) {
    exists = await pool.query(
      `SELECT 1 FROM ${THEMES_TABLE.name} WHERE name = '${event_data.theme}'`,
    );
    if (!exists.rows || exists.rows.length === 0) {
      return new InvalidFileError(
        `Theme ${event_data.theme} does not exist, add themes to the DB before attempting to reference them.`,
      );
    }
  }
};

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

export const internal_add_event_dj = async (
  event_name: string,
  dj_data: ILineupDjObject,
  pool: PoolClient,
) => {
  const dj = await internal_get_row_from_table(DJS_TABLE, dj_data.name, pool);
  if (dj instanceof Error) return dj;
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;
  let event_djs = event.djs;
  if (!event_djs || event_djs.length === 0) {
    event_djs = [dj_data];
  } else {
    const event_dj_index = event_djs.findIndex(
      (event_dj: ILineupDjObject) => event_dj.name === dj_data.name,
    );
    if (event_dj_index !== -1) {
      return new InvalidDjError(
        `DJ ${dj_data.name} already exists in Event ${event_name}.`,
      );
    }
    event_djs.push(dj_data);
  }

  const update_query = `UPDATE ${EVENTS_TABLE.name} SET djs = '${JSON.stringify(event_djs)}' WHERE name = '${event_name}';`;
  console.log(update_query);
  await pool.query(update_query);
};

export const internal_add_event_promo = async (
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
      return new InvalidDjError(
        `Promo ${promo_name} already exists in Event ${event_name}.`,
      );
    }
    event_promos.push(promo_name);
  }

  console.log(event_promos);
  const promos_string = event_promos.map((event_promo: string) => `'${event_promo}'`).join(", ");
  const update_query = `UPDATE ${EVENTS_TABLE.name} SET promos = ARRAY[${promos_string}] WHERE name = '${event_name}';`;
  console.log(update_query);
  await pool.query(update_query);
};

export const internal_update_event = async (
  event_data: IEventObject,
  pool: PoolClient,
) => {
  // Validate event values
  const validation = await validate_event(event_data, true, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_update_table_entry(EVENTS_TABLE, event_data, pool);
};

export const internal_update_event_dj = async (
  event_name: string,
  dj_name: string,
  pool: PoolClient,
  is_live?: boolean,
  vj?: string,
) => {
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;
  const event_djs = event.djs;
  if (!event_djs || event_djs.length === 0) {
    return new InvalidDjError(
      `DJ ${dj_name} does not exist in Event ${event_name}.`,
    );
  }
  const event_dj_index = event_djs.findIndex(
    (dj: ILineupDjObject) => dj.name === dj_name,
  );
  if (event_dj_index === -1) {
    return new InvalidDjError(
      `DJ ${dj_name} does not exist in Event ${event_name}.`,
    );
  }

  if (is_live !== undefined) event_djs[event_dj_index].is_live = is_live;
  if (vj !== undefined) event_djs[event_dj_index].vj = vj;

  const update_query = `UPDATE ${EVENTS_TABLE.name} SET djs = '${JSON.stringify(event_djs)}' WHERE name = '${event_name}';`;
  console.log(update_query);
  await pool.query(update_query);
};

export const internal_remove_event_dj = async (
  event_name: string,
  dj_name: string,
  pool: PoolClient,
) => {
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;
  const event_djs = event.djs;
  if (!event_djs || event_djs.length === 0) {
    return new InvalidDjError(
      `DJ ${dj_name} does not exist in Event ${event_name}.`,
    );
  }
  const event_dj_index = event_djs.findIndex(
    (dj: ILineupDjObject) => dj.name === dj_name,
  );
  if (event_dj_index === -1) {
    return new InvalidDjError(
      `DJ ${dj_name} does not exist in Event ${event_name}.`,
    );
  }

  const update_query = `UPDATE ${EVENTS_TABLE.name} SET djs = '${JSON.stringify(event_djs.filter((dj) => dj.name !== dj_name))}' WHERE name = '${event_name}';`;
  console.log(update_query);
  await pool.query(update_query);
};

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
    return new InvalidDjError(
      `Promo ${promo_name} does not exist in Event ${event_name}.`,
    );
  }
  const event_promo_index = event_promos.findIndex(
    (promo: string) => promo === promo_name,
  );
  if (event_promo_index === -1) {
    return new InvalidDjError(
      `Promo ${promo_name} does not exist in Event ${event_name}.`,
    );
  }

  const new_promo_array = event_promos
    .filter((promo) => promo !== promo_name)
    .map((promo: string) => `'${promo}`)
    .join(", ");
  let update_query = `UPDATE ${EVENTS_TABLE.name} SET promos = DEFAULT WHERE name = '${event_name}';`;;
  if (new_promo_array.length > 0) {
    update_query = `UPDATE ${EVENTS_TABLE.name} SET promos = ARRAY[${new_promo_array}] WHERE name = '${event_name}';`;
  }
  console.log(update_query);
  await pool.query(update_query);
};

export const internal_move_event_dj = async (
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
    index_a >= event.djs.length ||
    index_b < 0 ||
    index_b >= event.djs.length
  ) {
    return new InvalidFileError(
      `The move indexes (${index_a}, ${index_b}) are not valid for Event ${event_name}.`,
    );
  }

  if (index_a === index_b) return "Done";

  const moving_value = event.djs[index_a];
  const target_value = event.djs[index_b];
  event.djs.splice(index_a, 1);
  if (index_a > index_b) {
    event.djs.splice(event.djs.indexOf(target_value), 0, moving_value);
  } else {
    event.djs.splice(event.djs.indexOf(target_value) + 1, 0, moving_value);
  }

  const update_query = `UPDATE ${EVENTS_TABLE.name} SET djs = '${JSON.stringify(event.djs)}' WHERE name = '${event_name}';`;
  console.log(update_query);

  await pool.query(update_query);
};

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
    return new InvalidFileError(
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

  const new_promo_array = event.promos
    .map((promo: string) => `'${promo}'`)
    .join(", ");
  const update_query = `UPDATE ${EVENTS_TABLE.name} SET promos = ARRAY[${new_promo_array}] WHERE name = '${event_name}';`;
  console.log(update_query);

  await pool.query(update_query);
};

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

  const query = `DELETE FROM ${EVENTS_TABLE.name} WHERE name = '${event_name}'`;
  console.log(query);

  await pool.query(query);
};

export const internal_set_event_theme = async (
  event_name: string,
  theme_name: string,
  pool: PoolClient
) => {
  const event = (await internal_get_row_from_table(
    EVENTS_TABLE,
    event_name,
    pool,
  )) as IEventObject | Error;
  if (event instanceof Error) return event;

  const query = `UPDATE ${EVENTS_TABLE.name} SET theme = '${theme_name}' WHERE name = '${event_name}';`;
  console.log(query);

  await pool.query(query);
}