/*
    Router for handling /openapi/app-themes/ requests
*/

import { Router } from "express";
import { get_app_theme, read_app_themes_table } from "../database";

export const appThemeRouter = Router();

appThemeRouter.get("/:appThemeName", async (req, res) => {
    const appTheme = await get_app_theme(req.params.appThemeName);
    if (appTheme instanceof Error) {
        res.status(404);
        return res.send({
            errorType: "appThemeNotFoundError",
            message: `App Theme ${req.params.appThemeName} does not exist`
        });
    }
    res.status(200);
    return res.send(appTheme);
});

appThemeRouter.get("/", async (req, res) => {
    res.status(200);
    return res.send(await read_app_themes_table());
});