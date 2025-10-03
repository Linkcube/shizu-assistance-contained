/*
    Router for handling /openapi/theme/ requests
*/

import { Router } from "express";
import { paths, components } from "../../openapi/schema";
import {
  delete_theme,
  get_theme,
  insert_into_themes,
  read_themes_table,
  update_theme,
} from "../database";
import { IThemeObject } from "../types";

export const themeRouter = Router();

type themeInterface = components["schemas"]["Theme"];
type updateThemeInterface = components["schemas"]["UpdateTheme"];

/**
 * GET /min
 * Returns a minimal list of all themes, including only their names.
 *
 * @returns {Array<Object>} An array of theme objects with only the name property.
 */
themeRouter.get("/min", async (req, res) => {
  const themes_data = await read_themes_table();
  res.status(200);
  return res.send(
    themes_data.map((theme) => {
      return {
        name: theme.name,
      };
    }),
  );
});

/**
 * GET /:themeName
 * Retrieves a specific theme by its name.
 *
 * @param {string} req.params.themeName - The name of the theme to retrieve.
 * @returns {Object} The theme object if found, otherwise returns an error response with status code 404.
 */
themeRouter.get("/:themeName", async (req, res) => {
  const theme = await get_theme(req.params.themeName);
  if (theme instanceof Error) {
    res.status(404);
    return res.send({
      errorType: "themeNotFoundError",
      message: `Theme ${req.params.themeName} does not exist`,
    });
  }
  res.status(200);
  return res.send(theme);
});

/**
 * GET /
 * Retrieves the full list of all themes.
 *
 * @returns {Array<Object>} An array of theme objects.
 */
themeRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_themes_table());
});

/**
 * POST /
 * Creates a new theme with provided data.
 *
 * @param {Object} req.body - The body containing the theme details to insert.
 * @returns {Object} The created theme object on success,
 *  or an error response if required fields are missing or conflict occurs.
 */
themeRouter.post("/", async (req, res) => {
  const new_theme: themeInterface = req.body;
  if (!new_theme.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create a theme.",
    });
  }

  const error = await insert_into_themes(new_theme as IThemeObject);
  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const theme = await get_theme(new_theme.name);
  res.status(200);
  res.send(theme);
});

/**
 * POST /:themeName
 * Updates an existing theme with the given name using provided data.
 *
 * @param {string} req.params.themeName - The name of the theme to update.
 * @param {Object} req.body - The body containing updated fields for the theme.
 * @returns {Object} The updated theme object on success, or an error response if the theme does not exist.
 */
themeRouter.post("/:themeName", async (req, res) => {
  const theme_params: updateThemeInterface = req.body;
  const update_params: IThemeObject = Object.assign(
    {},
    { name: req.params.themeName },
    theme_params,
  );

  const error = await update_theme(update_params);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const theme = await get_theme(req.params.themeName);
  res.status(200);
  res.send(theme);
});

/**
 * DELETE /:themeName
 * Deletes a specific theme by its name.
 *
 * @param {string} req.params.themeName - The name of the theme to delete.
 * @returns {void} Returns empty response on success, or an error if the theme is not found.
 */
themeRouter.delete("/:themeName", async (req, res) => {
  const error = await delete_theme(req.params.themeName);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  res.status(200);
  res.send();
});
