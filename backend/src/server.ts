import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import { port } from "./config";
import {
  guiGetFiles,
  guiGetLogoFiles,
  guiGetRecordingFiles,
  guiGetThemeFiles,
  guiGetThemes,
  guiGetEvents,
  guiGetPromos,
  guiGetDjs,
  guiGetFile,
  guiGetTheme,
  guiGetEvent,
  guiGetPromo,
  guiGetDj,
  guiGetAppThemes,
  guiGetLogoPermissions,
  guiGetRecordingPermissions,
  guiGetThemePermissions,
} from "./gui_reader";
import {
  guiAddNewFile,
  guiAddNewLogoFile,
  guiAddNewRecordingFile,
  guiAddNewThemeFile,
  guiAddNewTheme,
  guiAddDj,
  guiAddPromo,
  guiAddEvent,
  guiAddEventDj,
  guiAddEventPromo,
  guiUpdateFile,
  guiUpdateTheme,
  guiUpdateDj,
  guiUpdatePromo,
  guiUpdateEvent,
  guiUpdateEventDj,
  guiRemoveEventDj,
  guiRemoveEventPromo,
  guiMoveEventDj,
  guiMoveEventPromo,
  guiSetEventTheme,
  guiDeleteFile,
  guiDeleteTheme,
  guiDeleteDj,
  guiDeletePromo,
  guiDeleteEvent,
  guiExportEvent,
  guiImportLegacyLedger,
  guiImportLegacyEvents,
  guiAddAppTheme,
  guiEditAppTheme,
  guiDeleteAppTheme,
  guiUpdateEventDateTime,
} from "./gui_writer";
import { create_tables, database_pool } from "./database";
import cors from "cors";
import { GUI_SCHEMA } from "./gui_schema";
import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
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

// API server
const gui_root = {
  guiGetFiles,
  guiGetLogoFiles,
  guiGetRecordingFiles,
  guiGetThemeFiles,
  guiGetThemes,
  guiGetEvents,
  guiGetPromos,
  guiGetDjs,
  guiGetFile,
  guiGetTheme,
  guiGetEvent,
  guiAddEventDj,
  guiAddEventPromo,
  guiGetPromo,
  guiGetDj,
  guiAddNewFile,
  guiAddNewLogoFile,
  guiAddNewRecordingFile,
  guiAddNewThemeFile,
  guiAddNewTheme,
  guiAddDj,
  guiAddPromo,
  guiAddEvent,
  guiUpdateFile,
  guiUpdateTheme,
  guiUpdateDj,
  guiUpdatePromo,
  guiUpdateEvent,
  guiUpdateEventDj,
  guiRemoveEventDj,
  guiRemoveEventPromo,
  guiMoveEventDj,
  guiMoveEventPromo,
  guiSetEventTheme,
  guiDeleteFile,
  guiDeleteTheme,
  guiDeleteDj,
  guiDeletePromo,
  guiDeleteEvent,
  guiExportEvent,
  guiImportLegacyLedger,
  guiImportLegacyEvents,
  guiGetAppThemes,
  guiAddAppTheme,
  guiEditAppTheme,
  guiDeleteAppTheme,
  guiGetLogoPermissions,
  guiGetRecordingPermissions,
  guiGetThemePermissions,
  guiUpdateEventDateTime,
};
const app = express();
const logo_permissions = staticLogoPermission();
const rec_permissions = staticRecordingPermission();
const themes_permissions = staticThemePermission();

export const create_server = () => {
  app.use(cors());
  app.use(morgan("common"));

  app.all(
    "/gui/graphql",
    createHandler({
      rootValue: gui_root,
      schema: GUI_SCHEMA,
    }),
  );
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
  app.get("/healthz", (req, res) => {
    // do app logic here to determine if app is truly healthy
    // you should return 200 if healthy, and anything else will fail
    // if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
    res.send(
      `Idle: ${database_pool.idleCount}, Waiting: ${database_pool.waitingCount}, Total: ${database_pool.totalCount}`,
    );
  });

  app.get("/gui/ruru", (req, res, next) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(
      ruruHTML({
        endpoint: "/gui/graphql",
      }),
    );
  });

  app.get("/openapi/redoc", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "openapi", "redoc-static.html"));
  });
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.options("*", cors());
  app.use(bodyParser.json());
  app.use("/openapi/file", fileRouter);
  app.use("/openapi/dj", djRouter);
  app.use("/openapi/theme", themeRouter);
  app.use("/openapi/event", eventRouter);
  app.use("/openapi/promo", promoRouter);
  app.use("/openapi/app-theme", appThemeRouter);

  create_tables();

  return app.listen(port, () => {
    console.log("Backend is ready");
    console.log(`Open on localhost:${port}`);
  });
};
