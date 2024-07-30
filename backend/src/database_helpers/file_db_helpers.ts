import { PoolClient } from "pg";
import { InvalidFileError } from "../errors";
import { DJS_TABLE, FILES_TABLE, PROMOS_TABLE, THEMES_TABLE } from "../tables";
import { IEventObject, IFileObject } from "../types";
import {
  interna_get_row_from_table,
  interna_insert_into_table,
  interna_update_table_entry,
} from "./helper_functions";

const validate_file = async (
  file_data: IFileObject,
  update: boolean,
  pool: PoolClient,
) => {
  const exists = await pool.query(
    `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = '${file_data.name}';`,
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return new InvalidFileError(`File ${file_data.name} already exists!`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return new InvalidFileError(`File ${file_data.name} already exists!`);
    }
  }
};

export const internal_insert_into_files = async (
  file_data: IFileObject,
  pool: PoolClient,
) => {
  // Validate file values
  const validation = await validate_file(file_data, false, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await interna_insert_into_table(FILES_TABLE, file_data, pool);
};

export const internal_update_file = async (
  file_data: IFileObject,
  pool: PoolClient,
) => {
  // Validate file values
  const validation = await validate_file(file_data, true, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await interna_update_table_entry(FILES_TABLE, file_data, pool);
};

export const internal_delete_file = async (
  file_name: string,
  pool: PoolClient,
) => {
  const file = (await interna_get_row_from_table(
    FILES_TABLE,
    file_name,
    pool,
  )) as IEventObject | Error;
  if (file instanceof Error) return file;

  // Null out all uses of this file
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET overlay_file = DEFAULT WHERE overlay_file = '${file_name}';`,
  );
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET stinger_file = DEFAULT WHERE stinger_file = '${file_name}';`,
  );
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET starting_file = DEFAULT WHERE starting_file = '${file_name}';`,
  );
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET ending_file = DEFAULT WHERE ending_file = '${file_name}';`,
  );

  await pool.query(
    `UPDATE ${PROMOS_TABLE.name} SET promo_file = DEFAULT WHERE promo_file = '${file_name}';`,
  );

  await pool.query(
    `UPDATE ${DJS_TABLE.name} SET logo = DEFAULT WHERE logo = '${file_name}';`,
  );
  await pool.query(
    `UPDATE ${DJS_TABLE.name} SET recording = DEFAULT WHERE recording = '${file_name}';`,
  );

  const delete_query = `DELETE FROM ${FILES_TABLE.name} WHERE name = '${file_name}'`;
  console.log(delete_query);

  await pool.query(delete_query);
};
