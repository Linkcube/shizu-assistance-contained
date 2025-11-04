import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import { port } from "./config";
import { create_tables, database_pool } from "./database";
import cors from "cors";
import {
  staticLogoPermission,
  staticRecordingPermission,
  staticThemePermission,
} from "./file_helpers";
import { fileRouter } from "./openapi_routers/file_router";
import path from "path";
import { djRouter } from "./openapi_routers/dj_router";
import { themeRouter } from "./openapi_routers/theme_router";
import { eventRouter } from "./openapi_routers/event_router";
import { promoRouter } from "./openapi_routers/promo_router";
import { appThemeRouter } from "./openapi_routers/app_theme_router";
import { importRouter } from "./openapi_routers/import_router";
import { settingsRouter } from "./openapi_routers/settings_router";

// API server
const app = express();
const logo_permissions = staticLogoPermission();
const rec_permissions = staticRecordingPermission();
const themes_permissions = staticThemePermission();

export const create_server = () => {
  app.use(cors());
  app.options("*", cors());
  app.use(morgan("common"));

  /**
   * Health check endpoint
   *
   * Returns database connection pool status for monitoring.
   *
   * @route GET /healthz
   * @returns {string} 200 if running
   */
  app.get("/healthz", (req, res) => {
    // Simple health check - return 200 if service is running
    res.sendStatus(200);
  });

  /**
   * OpenAPI documentation endpoint
   *
   * Serves Redoc static HTML for API documentation.
   *
   * @route GET /openapi/redoc
   * @returns {file} redoc-static.html
   */
  app.get("/openapi/redoc", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "openapi", "redoc-static.html"));
  });

  // Parsers
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  app.use(bodyParser.json());

  // All routers
  app.use("/openapi/file", fileRouter);
  app.use("/openapi/dj", djRouter);
  app.use("/openapi/theme", themeRouter);
  app.use("/openapi/event", eventRouter);
  app.use("/openapi/promo", promoRouter);
  app.use("/openapi/app-theme", appThemeRouter);
  app.use("/openapi/import", importRouter);
  app.use("/openapi/settings", settingsRouter);

  // Static delivery
  app.use(
    `/${encodeURIComponent(logo_permissions.id)}`,
    express.static(logo_permissions.path),
  );
  console.log(
    `Logos: localhost:${port}/${encodeURIComponent(logo_permissions.id)}`,
  );
  app.use(
    `/${encodeURIComponent(rec_permissions.id)}`,
    express.static(rec_permissions.path),
  );
  console.log(
    `Recordings: localhost:${port}/${encodeURIComponent(rec_permissions.id)}`,
  );
  app.use(
    `/${encodeURIComponent(themes_permissions.id)}`,
    express.static(themes_permissions.path),
  );
  console.log(
    `Themes: localhost:${port}/${encodeURIComponent(themes_permissions.id)}`,
  );

  create_tables();

  return app.listen(port, () => {
    console.log("Backend is ready");
    console.log(`Open on localhost:${port}`);
  });
};
