/*
    Router for handling /openapi/dj/ requests
*/

import { Router } from "express";
import { components } from "../../openapi/schema";
import {
  delete_dj,
  get_dj,
  get_event_djs_by_dj,
  insert_into_djs,
  read_djs_table,
  update_dj,
} from "../database";
import { IDjObject } from "../types";

export const djRouter = Router();

type djInterface = components["schemas"]["DJ"];
type updateDjInterface = components["schemas"]["UpdateDJ"];

/**
 * GET /openapi/dj/min
 *
 * Get a list of DJs with minimal information (name, logo, rtmp_server).
 *
 * @returns {Object[]} 200 - Array of DJ objects containing name, logo, and rtmp_server
 */
djRouter.get("/min", async (req, res) => {
  const dj_data = await read_djs_table();
  res.status(200);
  return res.send(
    dj_data.map((dj) => {
      return {
        name: dj.name,
        logo: dj.logo,
        // recording: dj.recording,
        rtmp_server: dj.rtmp_server,
      };
    }),
  );
});

/**
 * GET /openapi/dj/:djName
 *
 * Retrieve a specific DJ by their name.
 *
 * @param {string} req.params.djName - The unique identifier/name of the DJ to retrieve
 * @returns {Object} 200 - The full details of the requested DJ
 * @returns {Object} 404 - Returns error when DJ is not found
 */
djRouter.get("/:djName", async (req, res) => {
  const dj = await get_dj(req.params.djName);
  if (dj instanceof Error) {
    res.status(404);
    return res.send({
      errorType: "djNotFoundError",
      message: `DJ ${req.params.djName} does not exist`,
    });
  }
  res.status(200);
  return res.send(dj);
});

/**
 * GET /openapi/dj/:djName/events
 *
 * Get all events associated with a specific DJ.
 *
 * @param {string} req.params.djName - The unique identifier/name of the DJ whose events are to be retrieved
 * @returns {Object[]} 200 - Array of event objects related to this DJ
 */
djRouter.get("/:djName/events", async (req, res) => {
  const event_djs = await get_event_djs_by_dj(req.params.djName);
  res.status(200);
  return res.send(event_djs);
});

/**
 * GET /openapi/dj/
 *
 * Retrieve a list of all DJs in the database.
 *
 * @returns {Object[]} 200 - Array of all DJ objects stored in the system
 */
djRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_djs_table());
});

/**
 * POST /openapi/dj/
 *
 * Create a new DJ entry in the database.
 *
 * @param {Object} req.body - The JSON object containing DJ data to be inserted
 * @param {string} req.body.name - The unique name of the DJ
 * @param {string} req.body.logo - URL or path to the DJ's logo
 * @param {string} req.body.rtmp_server - RTMP server address for the DJ
 * @returns {Object} 200 - The newly created DJ object
 * @returns {Object} 400 - Returns error when name field is missing
 * @returns {Object} 409 - Returns error when DJ already exists
 */
djRouter.post("/", async (req, res) => {
  const new_dj: djInterface = req.body;
  if (!new_dj.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create a DJ.",
    });
  }

  const error = await insert_into_djs(new_dj as IDjObject);
  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const dj = await get_dj(new_dj.name);
  res.status(200);
  res.send(dj);
});

/**
 * POST /openapi/dj/:djName
 *
 * Update an existing DJ's information.
 *
 * @param {string} req.params.djName - The unique identifier/name of the DJ to update
 * @param {Object} req.body - JSON object containing updated fields for the DJ
 * @param {string} [req.body.name] - Updated name of the DJ (if provided)
 * @param {string} [req.body.logo] - Updated URL or path to the DJ's logo (if provided)
 * @param {string} [req.body.rtmp_server] - Updated RTMP server address for the DJ (if provided)
 * @returns {Object} 200 - The updated DJ object
 * @returns {Object} 404 - Returns error when DJ is not found
 */
djRouter.post("/:djName", async (req, res) => {
  const dj_params: updateDjInterface = req.body;
  const update_params: IDjObject = Object.assign(
    {},
    { name: req.params.djName },
    dj_params,
  );

  const error = await update_dj(update_params);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const dj = await get_dj(req.params.djName);
  res.status(200);
  res.send(dj);
});

/**
 * DELETE /openapi/dj/:djName
 *
 * Delete a DJ from the database.
 *
 * @param {string} req.params.djName - The unique identifier/name of the DJ to delete
 * @returns {Object} 200 - No content on success
 * @returns {Object} 404 - Returns error when DJ deletion fails
 */
djRouter.delete("/:djName", async (req, res) => {
  const error = await delete_dj(req.params.djName);
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
