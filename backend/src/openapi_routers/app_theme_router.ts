/*
    Router for handling /openapi/app-theme/ requests
*/

import { Router } from "express";
import { paths, components } from "../../openapi/schema";
import {
  create_new_app_theme,
  delete_app_theme,
  get_app_theme,
  read_app_themes_table,
  update_app_theme,
} from "../database";
import { internal_insert_into_app_themes } from "../database_helpers/app_themes_db_helpers";

export const appThemeRouter = Router();

type themeInterface = components["schemas"]["AppTheme"];
type updateThemeInterface = components["schemas"]["UpdateAppTheme"];

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

appThemeRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_app_themes_table());
});

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

appThemeRouter.delete("/:appThemeName", async (req, res) => {
  const error = await delete_app_theme(req.params.appThemeName);
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
