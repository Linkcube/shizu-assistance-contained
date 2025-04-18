import { PoolClient } from "pg";
import {
  internal_get_row_from_table,
  internal_insert_into_table,
  internal_update_table_entry,
} from "./helper_functions";
import { APP_THEMES_TABLE } from "../tables";
import { appThemeNotFoundError, invalidAppThemeError } from "../errors";

const validate_app_theme = async (
  theme_name: string,
  update: boolean,
  pool: PoolClient,
) => {
  const exists = await pool.query(
    `SELECT 1 FROM ${APP_THEMES_TABLE.name} WHERE name = '${theme_name}';`,
  );

  if (update) {
    if (!exists.rows || exists.rows.length === 0) {
      return appThemeNotFoundError(`Theme ${theme_name} does not exist.`);
    }
  } else {
    if (exists.rows && exists.rows.length > 0) {
      return invalidAppThemeError(`Theme ${theme_name} already exists!`);
    }
  }
};

export const internal_insert_into_app_themes = async (
  name: string,
  pool: PoolClient,
) => {
  const validation = await validate_app_theme(name, false, pool);
  if (validation !== undefined) return validation;

  const default_theme = {
    name,
    style: {
      primaryColor: "#add8e6",
      secondaryColor: "#d3d3d3",
      backgroundColor: "#ffffff",
      primaryTextColor: "#000000",
      secondaryTextColor: "#808080",
      highlightColor: "#ffc0cb",
      focusColor: "#ffffff",
      activeColor: "#d3d3d3",
      deleteColor: "#ff0000",
      cancelTextColor: "#ff0000",
      cancelBackgroundColor: "rgb(253, 229, 232)",
      submitTextColor: "#0000ff",
      submitBackgroundColor: "rgb(235, 246, 250)",
    },
  };

  await internal_insert_into_table(APP_THEMES_TABLE, default_theme, pool);
};

export const internal_update_app_themes = async (
  name: string,
  style: any,
  pool: PoolClient,
) => {
  const validation = await validate_app_theme(name, true, pool);
  if (validation !== undefined) return validation;

  await internal_update_table_entry(
    APP_THEMES_TABLE,
    name,
    { style: style },
    pool,
  );
};

export const internal_delete_app_themes = async (
  name: string,
  pool: PoolClient,
) => {
  const theme = (await internal_get_row_from_table(
    APP_THEMES_TABLE,
    name,
    pool,
  )) as any | Error;
  if (theme instanceof Error) return theme;

  const delete_query = `DELETE FROM ${APP_THEMES_TABLE.name} WHERE name = '${name}';`;
  console.log(delete_query);

  await pool.query(delete_query);
};
