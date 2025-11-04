/*
    Router for handling /import
*/

import { Router } from "express";
import { paths, components } from "../../openapi/schema";
import { import_legacy_events, import_legacy_ledger } from "../database";

export const importRouter = Router();

type pathInterface = components["schemas"]["ImportPath"];

/**
 * Import a legacy ledger file into the system
 * @param path - The file path to the legacy ledger file to be imported
 * @returns Success status (200) on successful import, or error status (409) if import fails
 * @throws 400 Bad Request if no path is provided in the request body
 */
importRouter.post("/ledger", async (req, res) => {
  const ledger_path: pathInterface = req.body;

  if (!ledger_path.path) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The path field is required to import a ledger.",
    });
  }

  const error = await import_legacy_ledger(ledger_path.path);
  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  res.status(200);
  res.send();
});

/**
 * Import legacy events/lineups into the system
 * @param path - The file path to the legacy lineups/events file to be imported
 * @returns Success status (200) on successful import, or error status (409) if import fails
 * @throws 400 Bad Request if no path is provided in the request body
 */
importRouter.post("/lineups", async (req, res) => {
  const lineups_path: pathInterface = req.body;

  if (!lineups_path.path) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The path field is required to import lineups.",
    });
  }

  const error = await import_legacy_events(lineups_path.path);
  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  res.status(200);
  res.send();
});
