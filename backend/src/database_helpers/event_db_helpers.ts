import { PoolClient } from "pg";
import {
  internal_insert_into_table,
  internal_get_row_from_table,
  internal_update_table_entry,
  is_non_empty,
} from "./helper_functions";
import {
  invalidDjError,
  invalidEventError,
  invalidPromoError,
  djNotFoundError,
  promoNotFoundError,
  themeNotFoundError,
  invalidActionError,
} from "../errors";
import { EVENTS_TABLE, DJS_TABLE, PROMOS_TABLE, THEMES_TABLE } from "../tables";
import { IDjObject, IEventObject, ILineupDjObject } from "../types";

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
      return invalidEventError(`Event ${event_data.name} already exists!`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidEventError(`Event ${event_data.name} already exists!`);
    }
  }
  if (event_data.promos !== undefined && event_data.promos.length > 0) {
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
      return promoNotFoundError(
        `The following promos do not exist (${missing_set}), add promos to the DB before attempting to reference them.`,
      );
    }
  }
  if (is_non_empty(event_data.theme)) {
    exists = await pool.query(
      `SELECT 1 FROM ${THEMES_TABLE.name} WHERE name = '${event_data.theme}';`,
    );
    if (!exists.rows || exists.rows.length === 0) {
      return themeNotFoundError(
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
  const promos_string = event_promos
    .map((event_promo: string) => `'${event_promo}'`)
    .join(", ");
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
  await internal_update_table_entry(
    EVENTS_TABLE,
    event_data.name,
    event_data,
    pool,
  );
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

  const new_promo_array = event_promos
    .filter((promo) => promo !== promo_name)
    .map((promo: string) => `'${promo}'`)
    .join(", ");
  let update_query = `UPDATE ${EVENTS_TABLE.name} SET promos = DEFAULT WHERE name = '${event_name}';`;
  if (new_promo_array.length > 0) {
    update_query = `UPDATE ${EVENTS_TABLE.name} SET promos = ARRAY[${new_promo_array}] WHERE name = '${event_name}';`;
  }
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
  pool: PoolClient,
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
};

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
    const query = `UPDATE ${EVENTS_TABLE.name} SET date = '${date}' WHERE name = '${event_name}';`;
    console.log(query);
    await pool.query(query);
  }

  if (start_time) {
    const query = `UPDATE ${EVENTS_TABLE.name} SET start_time = '${start_time}' WHERE name = '${event_name}';`;
    console.log(query);
    await pool.query(query);
  }
};
