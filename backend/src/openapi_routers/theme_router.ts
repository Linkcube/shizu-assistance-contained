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

themeRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_themes_table());
});

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
