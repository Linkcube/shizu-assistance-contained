/*
 * Router for handling /openapi/app-theme/ requests
 * This router manages CRUD operations for application themes, including:
 * - Retrieving specific themes by name
 * - Listing all available themes
 * - Creating new themes
 * - Updating existing theme styles
 * - Deleting themes
 */

import { Router } from "express";
import { components } from "../../openapi/schema";
import {
  create_new_app_theme,
  delete_app_theme,
  get_app_theme,
  read_app_themes_table,
  update_app_theme,
} from "../database";

export const appThemeRouter = Router();

type themeInterface = components["schemas"]["AppTheme"];
type updateThemeInterface = components["schemas"]["UpdateAppTheme"];

/**
 * GET /openapi/app-theme/:appThemeName
 *
 * Retrieves a specific application theme by its name
 *
 * @param {string} req.params.appThemeName - The unique name of the theme to retrieve
 * @returns {themeInterface} 200 - Returns the requested App Theme object
 * @returns {Error} 404 - Returns error object when theme doesn't exist
 */
appThemeRouter.get("/:appThemeName", async (req, res) => {
  const appTheme = await get_app_theme(req.params.appThemeName);
  if (appTheme instanceof Error) {
    res.status(404);
    return res.send({
      errorType: "appThemeNotFoundError",
      message: `App Theme ${req.params.appThemeName} does not exist`,
    });
  }
  res.status(200);
  return res.send(appTheme);
});

/**
 * GET /openapi/app-theme/
 *
 * Retrieves the complete list of all application themes
 *
 * @returns {themeInterface[]} 200 - Returns array of all App Theme objects
 */
appThemeRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_app_themes_table());
});

/**
 * POST /openapi/app-theme/
 *
 * Creates a new application theme with the specified name
 * Optionally sets initial style definitions if provided in request body
 *
 * @param {Object} req.body - The request body containing theme creation data
 * @param {string} req.body.name - Required field specifying the theme name
 * @param {themeInterface} [req.body.style] - Optional CSS style definitions for the new theme
 * @returns {themeInterface} 200 - Returns the created App Theme object
 * @returns {Error} 400 - Returns error when required 'name' field is missing
 * @returns {Error} 404 - Returns error when theme creation fails
 */
appThemeRouter.post("/", async (req, res) => {
  const new_theme: themeInterface = req.body;
  if (!new_theme.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create an App Theme.",
    });
  }

  const error = await create_new_app_theme(new_theme.name);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  if (new_theme.style) {
    const update_error = await update_app_theme(
      new_theme.name,
      new_theme.style,
    );
    if (update_error !== undefined) {
      res.status(404);
      return res.send({
        errorType: update_error.name,
        message: update_error.message,
      });
    }
  }

  const theme = await get_app_theme(new_theme.name);
  res.status(200);
  res.send(theme);
});

/**
 * POST /openapi/app-theme/:appThemeName
 *
 * Updates the style definitions of an existing application theme
 *
 * @param {string} req.params.appThemeName - The name of the theme to update
 * @param {Object} req.body - The request body containing style updates
 * @param {object} req.body.style - CSS style definitions to apply to the theme
 * @returns {Object} 200 - Returns the updated App Theme object
 * @returns {Object} 404 - Returns error when theme update fails
 */
appThemeRouter.post("/:appThemeName", async (req, res) => {
  const new_style: updateThemeInterface = req.body;
  const error = await update_app_theme(
    req.params.appThemeName,
    new_style.style,
  );
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const theme = await get_app_theme(req.params.appThemeName);
  res.status(200);
  res.send(theme);
});

/**
 * DELETE /openapi/app-theme/:appThemeName
 *
 * Deletes an application theme by its name and returns the deleted theme data
 *
 * @param {string} req.params.appThemeName - The unique name of the theme to delete
 * @returns {Object} 200 - Returns the deleted App Theme object
 * @returns {Object} 404 - Returns error when theme deletion fails
 */
appThemeRouter.delete("/:appThemeName", async (req, res) => {
  const error = await delete_app_theme(req.params.appThemeName);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  res.status(200).send({ message: "Theme deleted successfully" });
});
