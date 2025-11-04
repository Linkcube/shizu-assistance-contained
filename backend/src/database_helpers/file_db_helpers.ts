import { PoolClient } from "pg";
import { fileNotFoundError, invalidFileError } from "../errors";
import {
  DJS_TABLE,
  EVENT_DJS_TABLE,
  FILES_TABLE,
  PROMOS_TABLE,
  THEMES_TABLE,
} from "../tables";
import { IEventObject, IFileObject } from "../types";
import {
  internal_get_row_from_table,
  internal_insert_into_table,
  internal_update_table_entry,
} from "./helper_functions";

/**
 * Validates whether a file exists in the database based on its name
 *
 * This function checks if a file already exists when inserting or if it doesn't exist when updating.
 * It prevents duplicate files during insertion and ensures update operations target existing files.
 *
 * @param file_data - The file object containing file metadata including the name to validate
 * @param update - Boolean flag indicating whether this is an update operation (true) or insert operation (false)
 * @param pool - Database connection client used for query execution
 * @returns Promise resolving to an error if validation fails, undefined otherwise
 *
 */
const validate_file = async (
  file_data: IFileObject,
  update: boolean,
  pool: PoolClient,
) => {
  const exists = await pool.query(
    `SELECT 1 FROM ${FILES_TABLE.name} WHERE name = $1;`,
    [file_data.name],
  );
  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return fileNotFoundError(`File ${file_data.name} does not exist!`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidFileError(`File ${file_data.name} already exists!`);
    }
  }
};

/**
 * Inserts a new file record into the database
 *
 * This function validates that the file does not already exist before inserting it.
 * It leverages the internal_insert_into_table helper to perform the actual database insertion.
 *
 * @param file_data - The file object containing all necessary file metadata for insertion
 * @param pool - Database connection client used for query execution
 * @returns Promise resolving to an error if validation fails, void otherwise
 */
export const internal_insert_into_files = async (
  file_data: IFileObject,
  pool: PoolClient,
) => {
  // Validate file values
  const validation = await validate_file(file_data, false, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_insert_into_table(FILES_TABLE, file_data, pool);
};

/**
 * Updates an existing file record in the database
 *
 * This function validates that the file exists before updating it.
 * It leverages the internal_update_table_entry helper to perform the actual database update.
 *
 * @param file_data - The file object containing updated file metadata including name for identification
 * @param pool - Database connection client used for query execution
 * @returns Promise resolving to an error if validation fails, void otherwise
 */
export const internal_update_file = async (
  file_data: IFileObject,
  pool: PoolClient,
) => {
  // Validate file values
  const validation = await validate_file(file_data, true, pool);
  if (validation !== undefined) return validation;

  // Add to DB
  await internal_update_table_entry(
    FILES_TABLE,
    file_data.name,
    file_data,
    pool,
  );
};

/**
 * Completely removes a file from the database and nullifies all references to it
 *
 * This function performs a cascade delete operation:
 * 1. First retrieves the file to be deleted
 * 2. Nulls out all columns in related tables that reference this file
 * 3. Finally deletes the file record itself
 *
 * @param file_name - The name of the file to be completely removed from the database
 * @param pool - Database connection client used for query execution
 * @returns Promise resolving to an error if retrieval fails, void otherwise
 */
export const internal_delete_file = async (
  file_name: string,
  pool: PoolClient,
) => {
  const file = (await internal_get_row_from_table(
    FILES_TABLE,
    file_name,
    pool,
  )) as IEventObject | Error;
  if (file instanceof Error) return file;

  // Null out all uses of this file
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET overlay_file = DEFAULT WHERE overlay_file = $1;`,
    [file_name],
  );
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET stinger_file = DEFAULT WHERE stinger_file = $1';`,
    [file_name],
  );
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET starting_file = DEFAULT WHERE starting_file = $1;`,
    [file_name],
  );
  await pool.query(
    `UPDATE ${THEMES_TABLE.name} SET ending_file = DEFAULT WHERE ending_file = $1;`,
    [file_name],
  );

  await pool.query(
    `UPDATE ${PROMOS_TABLE.name} SET promo_file = DEFAULT WHERE promo_file = $!;`,
    [file_name],
  );

  await pool.query(
    `UPDATE ${DJS_TABLE.name} SET logo = DEFAULT WHERE logo = $1;`,
    [file_name],
  );
  await pool.query(
    `UPDATE ${EVENT_DJS_TABLE.name} SET recording = DEFAULT WHERE recording = $1;`,
    [file_name],
  );

  const delete_query = `DELETE FROM ${FILES_TABLE.name} WHERE name = $1`;
  console.log(delete_query, file_name);

  await pool.query(delete_query, [file_name]);
};

/**
 * Retrieves all logo files from the database
 *
 * This function queries the files table for records where the root column equals 'LOGOS'.
 * It's specifically designed to fetch all available logo assets.
 *
 * @param pool - Database connection client used for query execution
 * @returns Promise resolving to database query results containing all logo files
 */
export const internal_read_all_logo_files = async (pool: PoolClient) => {
  return await pool.query(
    `SELECT * FROM ${FILES_TABLE.name} WHERE root = 'LOGOS';`,
  );
};

/**
 * Retrieves all recording files from the database
 *
 * This function queries the files table for records where the root column equals 'RECORDINGS'.
 * It's specifically designed to fetch all available recording assets.
 *
 * @param pool - Database connection client used for query execution
 * @returns Promise resolving to database query results containing all recording files
 */
export const internal_read_all_recording_files = async (pool: PoolClient) => {
  return await pool.query(
    `SELECT * FROM ${FILES_TABLE.name} WHERE root = 'RECORDINGS';`,
  );
};

/**
 * Retrieves all theme files from the database
 *
 * This function queries the files table for records where the root column equals 'THEMES'.
 * It's specifically designed to fetch all available theme assets.
 *
 * @param pool - Database connection client used for query execution
 * @returns Promise resolving to database query results containing all theme files
 */
export const internal_read_all_theme_files = async (pool: PoolClient) => {
  return await pool.query(
    `SELECT * FROM ${FILES_TABLE.name} WHERE root = 'THEMES';`,
  );
};
