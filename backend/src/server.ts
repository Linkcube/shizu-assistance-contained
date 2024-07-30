import express from "express";
import morgan from "morgan";
import { port } from "./config";
import {
  guiGetFiles,
  guiGetThemes,
  guiGetEvents,
  guiGetPromos,
  guiGetDjs,
  guiGetFile,
  guiGetTheme,
  guiGetEvent,
  guiGetPromo,
  guiGetDj,
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
  guiDeleteFile,
  guiDeleteTheme,
  guiDeleteDj,
  guiDeletePromo,
  guiDeleteEvent,
  guiExportEvent,
  guiImportLegacyLedger,
  guiImportLegacyEvents,
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

// API server
const gui_root = {
  guiGetFiles,
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
  guiDeleteFile,
  guiDeleteTheme,
  guiDeleteDj,
  guiDeletePromo,
  guiDeleteEvent,
  guiExportEvent,
  guiImportLegacyLedger,
  guiImportLegacyEvents,
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
  app.use(
    `/${encodeURIComponent(rec_permissions.id)}`,
    express.static(rec_permissions.path),
  );
  app.use(
    `/${encodeURIComponent(themes_permissions.id)}`,
    express.static(themes_permissions.path),
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

  create_tables();

  return app.listen(port, () => {
    console.log("Backend is ready");
    console.log(`Open on localhost:${port}`);
  });
};
