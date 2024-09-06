/*
    Router for handling /openapi/theme/ requests
*/

import { Router } from "express";
import { get_theme, read_themes_table } from "../database";

export const themeRouter = Router();

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
