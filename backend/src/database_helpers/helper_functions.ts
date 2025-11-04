import { Client, Pool, PoolClient, Query, QueryResult } from "pg";
import { ALL_COMPOSITE_TYPES, CompositeType } from "../composite_types";
import { Table } from "../tables";
import { sqlEntryNotFound } from "../errors";

/**
 * Creates a composite type in the database if it doesn't already exist
 * @param client - PostgreSQL client connection
 * @param composite_type - The composite type definition to create
 * @returns Promise that resolves when creation is complete or skipped
 */
export const internal_create_composite_type_helper = async (
  client: Client,
  composite_type: CompositeType,
) => {
  let retval: QueryResult;
  try {
    retval = await client.query(composite_type.exists());
  } catch (err) {
    console.log(err);
    return;
  }

  if (retval.rows && retval.rows.length > 0) {
    console.log(`${composite_type.name} composite type found, skipping create`);
    return;
  }

  // Create Table
  try {
    retval = await client.query(composite_type.create_type());
  } catch (err) {
    console.log(err);
  }
};

/**
 * Creates a table in the database if it doesn't already exist
 * @param client - PostgreSQL client connection
 * @param table - The table definition to create
 * @returns Promise that resolves when creation is complete or skipped
 */
export const internal_create_table_helper = async (
  client: Client,
  table: Table,
) => {
  let retval: QueryResult;
  try {
    retval = await client.query(table.exists());
  } catch (err) {
    console.log(err);
    return;
  }

  if (retval.rows && retval.rows.length > 0) {
    console.log(`${table.name} table found, skipping create`);
    return;
  }

  // Create Table
  try {
    retval = await client.query(table.create_table());
  } catch (err) {
    console.log(err);
  }
};

/**
 * Creates all composite types defined in ALL_COMPOSITE_TYPES
 * @param client - PostgreSQL client connection
 * @returns Promise that resolves when all composite types are created
 */
export const internal_create_composite_types = async (client: Client) => {
  await client.connect();

  for (const composite_type of ALL_COMPOSITE_TYPES) {
    await internal_create_composite_type_helper(client, composite_type);
  }

  await client.end();
};

/**
 * Reads all rows from a specified table
 * @param table - The table to read from
 * @param pool - PostgreSQL connection pool client
 * @returns Promise resolving to QueryResult containing all rows
 */
export const internal_read_entire_table = async (
  table: Table,
  pool: PoolClient,
) => {
  console.log(table.select());
  const retval = await pool.query(table.select());

  return retval;
};

/**
 * Retrieves a single row from a table by primary key
 * @param table - The table to query
 * @param primary_key - The value of the primary key to search for
 * @param pool - PostgreSQL connection pool client
 * @returns Promise resolving to the found row or sqlEntryNotFound error
 */
export const internal_get_row_from_table = async (
  table: Table,
  primary_key: string,
  pool: PoolClient,
  composite_keys?: string[],
) => {
  let retval: QueryResult;
  if (table.composite_keys.length > 0 && composite_keys !== undefined) {
    console.log(table.get_single(), composite_keys);
    retval = await pool.query(table.get_single(), composite_keys);
  } else {
    console.log(`${table.get_single()}, [${primary_key}]`);
    retval = await pool.query(table.get_single(), [primary_key]);
  }

  if (!retval.rows || retval.rows.length === 0)
    return sqlEntryNotFound(
      `Table ${table.name} does not contain ${primary_key}.`,
    );
  return retval.rows[0];
};

/**
 * Inserts a new row into a table
 * @param table - The table to insert into
 * @param obj_data - Object containing data for the new row
 * @param pool - PostgreSQL connection pool client
 * @returns Promise that resolves when insertion is complete
 */
export const internal_insert_into_table = async (
  table: Table,
  obj_data: any,
  pool: PoolClient,
) => {
  const json_values: { name: string; json: any }[] = [];
  const columns = [];
  const values = [];
  for (const definition of table.definitions) {
    if (
      obj_data[definition.name] === null ||
      obj_data[definition.name] === undefined ||
      (obj_data[definition.name] instanceof Array &&
        obj_data[definition.name].length === 0)
    ) {
      continue;
    }
    switch (definition.type) {
      case "TEXT":
      case "TEXT PRIMARY KEY":
      case "TIMESTAMP WITH TIME ZONE":
      case "TEXT[]":
      case "BOOLEAN":
      case "SMALLINT":
        columns.push(definition.name);
        values.push(obj_data[definition.name]);
        break;
      case "JSONB":
        json_values.push({
          name: definition.name,
          json: obj_data[definition.name],
        });
        break;
    }
  }

  const param_placeholders = Array.from(
    { length: values.length },
    (_, i) => `$${i + 1}`,
  ).join(",");

  const insert_query = `INSERT INTO ${table.name} (${columns.join(", ")}) VALUES (${param_placeholders});`;

  console.log(insert_query, values);
  await pool.query(insert_query, values);

  if (json_values.length > 0) {
    for (const json_value of json_values) {
      const update_query = `UPDATE ${table.name} SET $1 = $2 WHERE name = $3;`;
      const update_params = [
        json_value.name,
        JSON.stringify(json_value.json),
        obj_data.name,
      ];
      console.log(update_query, update_params);
      await pool.query(update_query, update_params);
    }
  }
};

/**
 * Updates an existing row in a table by primary key
 * @param table - The table to update
 * @param primary_key - The value of the primary key for the row to update
 * @param obj_data - Object containing updated data
 * @param pool - PostgreSQL connection pool client
 * @returns Promise that resolves when update is complete
 */
export const internal_update_table_entry = async (
  table: Table,
  primary_key: string,
  obj_data: any,
  pool: PoolClient,
  composite_keys?: string[],
) => {
  const update_pairs: string[] = [];
  const values: any[] = [];
  let param_index = 1;
  table.definitions.forEach((definition) => {
    if (definition.no_updates) {
      return;
    }
    let value;
    if (
      obj_data[definition.name] === null ||
      obj_data[definition.name] === undefined ||
      (obj_data[definition.name] instanceof Array &&
        obj_data[definition.name].length === 0)
    ) {
      update_pairs.push(`${definition.name} = DEFAULT`);
      return;
    } else {
      value = obj_data[definition.name];
      if (definition.type === "JSONB") value = JSON.stringify(value);
    }
    values.push(value);
    update_pairs.push(`${definition.name} = $${param_index}`);
    param_index++;
  });

  const set_pairs_string = update_pairs.join(", ");
  let update_query = "";
  if (table.composite_keys.length > 0 && composite_keys !== undefined) {
    const composite_params = composite_keys
      .map((_, i) => `$${param_index + i}`)
      .join(",");
    update_query = `UPDATE ${table.name} SET ${set_pairs_string} WHERE ${table.primary_key} = (${composite_params});`;
    values.push(...composite_keys);
  } else {
    update_query = `UPDATE ${table.name} SET ${set_pairs_string} WHERE ${table.primary_key} = $${param_index};`;
    values.push(primary_key);
  }

  console.log(update_query, values);

  await pool.query(update_query, values);
};

/**
 * Checks if a value is not null or undefined
 * @param value - The value to check
 * @returns boolean indicating whether the value is non-empty
 */
export const is_non_empty = (value: any) => {
  return value !== undefined && value !== null;
};

/**
 * Creates a query string and params objects to update a table entry's array column
 * @param table - Table object
 * @param column_name - Name of the array column
 * @param items - Array of items to insert
 * @param entry_name - Name of the entry to update
 * @param pool - PostgreSQL connection pool client
 * @returns a query string and array of parameters
 */
export const make_array_update_query = (
  table: Table,
  column_name: string,
  items: string[],
  entry_name: string,
  pool: PoolClient,
) => {
  let update_query: string = "";
  let params: string[] = [];
  if (items.length === 0) {
    update_query = `UPDATE ${table.name} SET ${column_name} = DEFAULT WHERE ${table.primary_key} = $1`;
    params = [entry_name];
  } else {
    const placeholders_array = Array.from(
      { length: items.length },
      (_, i) => `$${i + 1}`,
    ).join(",");
    update_query = `UPDATE ${table.name} SET ${column_name} = ARRAY[${placeholders_array}]::text[] WHERE ${table.primary_key} = $${items.length + 1}`;
    params = [...items, entry_name];
  }
  console.log(`${update_query}, ${params}`);
  return pool.query(update_query, params);
};
