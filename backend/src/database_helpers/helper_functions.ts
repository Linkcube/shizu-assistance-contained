import { Client, PoolClient, QueryResult } from "pg";
import { ALL_COMPOSITE_TYPES, CompositeType } from "../composite_types";
import { Table } from "../tables";
import { DjNotFoundError } from "../errors";

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

export const internal_create_composite_types = async (client: Client) => {
  await client.connect();

  for (const composite_type of ALL_COMPOSITE_TYPES) {
    await internal_create_composite_type_helper(client, composite_type);
  }

  await client.end();
};

export const internal_read_entire_table = async (
  table: Table,
  pool: PoolClient,
) => {
  console.log(table.select());
  const retval = await pool.query(table.select());

  return retval;
};

export const internal_get_row_from_table = async (
  table: Table,
  primary_key: string,
  pool: PoolClient,
) => {
  console.log(table.get_single(primary_key));
  const retval = await pool.query(table.get_single(primary_key));

  if (!retval.rows || retval.rows.length === 0)
    return new DjNotFoundError(
      `Table ${table.name} does not contain ${primary_key}.`,
    );
  return retval.rows[0];
};

export const internal_insert_into_table = async (
  table: Table,
  obj_data: any,
  pool: PoolClient,
) => {
  let columns_string = "name";
  let values_string = `'${obj_data.name}'`;
  const json_values: { name: string; json: any }[] = [];
  table.definitions.forEach((definition) => {
    if (!obj_data[definition.name]) return;
    if (
      definition.type === "TEXT" ||
      definition.type === "TIMESTAMP WITH TIME ZONE"
    ) {
      columns_string += `, ${definition.name}`;
      values_string += `, '${obj_data[definition.name]}'`;
    } else if (definition.type === "TEXT[]") {
      const array_string = obj_data[definition.name]
        .map((val: any) => `'${val}'`)
        .join(", ");
      columns_string += `, ${definition.name}`;
      values_string += `, ARRAY[${array_string}]`;
    } else if (definition.type === "BOOLEAN") {
      columns_string += `, ${definition.name}`;
      values_string += `, ${obj_data[definition.name]}`;
    } else if (definition.type === "JSONB") {
      json_values.push({
        name: definition.name,
        json: obj_data[definition.name],
      });
    }
  });

  const insert_query = `INSERT INTO ${table.name} (${columns_string}) VALUES (${values_string});`;
  console.log(insert_query);
  await pool.query(insert_query);

  if (json_values.length > 0) {
    for (const json_value of json_values) {
      const update_query = `UPDATE ${table.name} SET ${json_value.name} = '${JSON.stringify(json_value.json)}' WHERE name = '${obj_data.name}';`;
      console.log(update_query);
      await pool.query(update_query);
    }
  }
};

export const internal_update_table_entry = async (
  table: Table,
  obj_data: any,
  pool: PoolClient,
) => {
  const update_pairs: string[][] = [];
  table.definitions.forEach((definition) => {
    if (!obj_data[definition.name]) {
      update_pairs.push([definition.name, "DEFAULT"]);
    } else if (
      definition.type === "TEXT" ||
      definition.type === "TIMESTAMP WITH TIME ZONE"
    ) {
      update_pairs.push([definition.name, `'${obj_data[definition.name]}'`]);
    } else if (definition.type === "TEXT[]") {
      const array_string = obj_data[definition.name]
        .map((val: any) => `'${val}'`)
        .join(", ");
      update_pairs.push([definition.name, `ARRAY[${array_string}]`]);
    } else if (definition.type === "BOOLEAN") {
      update_pairs.push([definition.name, `${obj_data[definition.name]}`]);
    } else if (definition.type === "JSONB") {
      update_pairs.push([
        definition.name,
        `'${JSON.stringify(obj_data[definition.name])}'`,
      ]);
    }
  });

  const set_pairs_string = update_pairs
    .map((pair) => `${pair[0]} = ${pair[1]}`)
    .join(", ");
  const update_query = `UPDATE ${table.name} SET ${set_pairs_string} WHERE name = '${obj_data.name}';`;
  console.log(update_query);

  await pool.query(update_query);
};
