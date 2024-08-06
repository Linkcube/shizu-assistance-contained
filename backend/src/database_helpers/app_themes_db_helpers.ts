import { PoolClient } from "pg"
import { internal_insert_into_table, internal_update_table_entry } from "./helper_functions"
import { APP_THEMES_TABLE } from "../tables"


export const internal_insert_into_app_themes = async (name: string, pool: PoolClient) => {
    const default_theme = {
        name: name,
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
      }
    
      await internal_insert_into_table(APP_THEMES_TABLE, default_theme, pool);
}

export const internal_update_app_themes = async (name: string, style: any, pool: PoolClient) => {
    await internal_update_table_entry(APP_THEMES_TABLE, { name: name, style: style }, pool);
}

export const internal_delete_app_themes = async (name: string, pool: PoolClient) => {
    const delete_query = `DELETE FROM ${APP_THEMES_TABLE.name} WHERE name = '${name}';`;
    console.log(delete_query);
  
    await pool.query(delete_query);
}