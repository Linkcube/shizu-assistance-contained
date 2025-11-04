/*
    Router for handling /openapi/file/ requests
*/

import { Router } from "express";
import { paths, components } from "../../openapi/schema";
import {
  add_logo_file,
  add_recording_file,
  add_theme_file,
  delete_file,
  get_file,
  read_files_logos,
  read_files_recordings,
  read_files_table,
  read_files_themes,
  update_file,
} from "../database";
import {
  getLocalLogoFiles,
  getLocalRecordingFiles,
  getLocalThemeFiles,
} from "../file_helpers";
import { IFileObject } from "../types";

type fileInterface = components["schemas"]["File"];
type newFileInterface = components["schemas"]["NewFile"];
type updateFileInterface = components["schemas"]["UpdateFile"];
export const fileRouter = Router();

// getters

/**
 * Get all logo permissions for the local logo files
 * @returns Array of logo file information with permission details
 */
fileRouter.get("/logo-permissions", async (req, res) => {
  const file_blob = await getLocalLogoFiles([]);
  res.status(200);
  return res.send(file_blob);
});

/**
 * Get logo permissions for a specific logo path
 * @param logoPath - The decoded path to the logo file(s)
 * @returns Array of logo file information with permission details for the specified path
 */
fileRouter.get("/logo-permissions/:logoPath", async (req, res) => {
  const decoded_path = decodeURIComponent(req.params.logoPath);
  const file_blob = await getLocalLogoFiles(decoded_path.split("/"));
  res.status(200);
  return res.send(file_blob);
});

/**
 * Get all recording permissions for the local recording files
 * @returns Array of recording file information with permission details
 */
fileRouter.get("/recording-permissions", async (req, res) => {
  const file_blob = await getLocalRecordingFiles([]);
  res.status(200);
  return res.send(file_blob);
});

/**
 * Get recording permissions for a specific recording path
 * @param recordingPath - The decoded path to the recording file(s)
 * @returns Array of recording file information with permission details for the specified path
 */
fileRouter.get("/recording-permissions/:recordingPath", async (req, res) => {
  const decoded_path = decodeURIComponent(req.params.recordingPath);
  const file_blob = await getLocalRecordingFiles(decoded_path.split("/"));
  res.status(200);
  return res.send(file_blob);
});

/**
 * Get all theme permissions for the local theme files
 * @returns Array of theme file information with permission details
 */
fileRouter.get("/theme-permissions", async (req, res) => {
  const file_blob = await getLocalThemeFiles([]);
  res.status(200);
  return res.send(file_blob);
});

/**
 * Get theme permissions for a specific theme path
 * @param themePath - The decoded path to the theme file(s)
 * @returns Array of theme file information with permission details for the specified path
 */
fileRouter.get("/theme-permissions/:themePath", async (req, res) => {
  const decoded_path = decodeURIComponent(req.params.themePath);
  const file_blob = await getLocalThemeFiles(decoded_path.split("/"));
  res.status(200);
  return res.send(file_blob);
});

/**
 * Get all logo files from the database
 * @returns Array of all logo file objects stored in the database
 */
fileRouter.get("/logos", async (req, res) => {
  res.status(200);
  return res.send(await read_files_logos());
});

/**
 * Get all recording files from the database
 * @returns Array of all recording file objects stored in the database
 */
fileRouter.get("/recordings", async (req, res) => {
  res.status(200);
  return res.send(await read_files_recordings());
});

/**
 * Get all theme files from the database
 * @returns Array of all theme file objects stored in the database
 */
fileRouter.get("/themes", async (req, res) => {
  res.status(200);
  return res.send(await read_files_themes());
});

/**
 * Get a specific file by name
 * @param fileName - The name of the file to retrieve
 * @returns The requested file object or error if not found
 */
fileRouter.get("/:fileName", async (req, res) => {
  const file = await get_file(req.params.fileName);
  if (file instanceof Error) {
    console.log(`Error on ${req.params.fileName}, returning 404.`);
    res.status(404);
    return res.send({
      errorType: "fileNotFoundError",
      message: `File ${req.params.fileName} does not exist`,
    });
  }

  res.status(200);
  res.send(file);
});

/**
 * Get the complete file table from the database
 * @returns Array of all file objects in the database table
 */
fileRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_files_table());
});

// setters

/**
 * Create a new logo file entry in the database
 * @param name - The name of the logo file (required)
 * @param file_path - The local path to the logo file
 * @param url_path - The URL path for accessing the logo file
 * @returns Created file object or error if creation fails
 */
fileRouter.post("/logos", async (req, res) => {
  const new_file: newFileInterface = req.body;
  if (!new_file.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create a file.",
    });
  }
  const error = await add_logo_file(
    new_file.name,
    new_file.file_path,
    new_file.url_path,
  );

  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const file = await get_file(new_file.name);
  res.status(200);
  res.send(file);
});

/**
 * Create a new recording file entry in the database
 * @param name - The name of the recording file (required)
 * @param file_path - The local path to the recording file
 * @param url_path - The URL path for accessing the recording file
 * @returns Created file object or error if creation fails
 */
fileRouter.post("/recordings", async (req, res) => {
  const new_file: newFileInterface = req.body;
  if (!new_file.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create a file.",
    });
  }
  const error = await add_recording_file(
    new_file.name,
    new_file.file_path,
    new_file.url_path,
  );

  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const file = await get_file(new_file.name);
  res.status(200);
  res.send(file);
});

/**
 * Create a new theme file entry in the database
 * @param name - The name of the theme file (required)
 * @param file_path - The local path to the theme file
 * @param url_path - The URL path for accessing the theme file
 * @returns Created file object or error if creation fails
 */
fileRouter.post("/themes", async (req, res) => {
  const new_file: newFileInterface = req.body;
  if (!new_file.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create a file.",
    });
  }
  const error = await add_theme_file(
    new_file.name,
    new_file.file_path,
    new_file.url_path,
  );

  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const file = await get_file(new_file.name);
  res.status(200);
  res.send(file);
});

/**
 * Update an existing file entry in the database
 * @param fileName - The name of the file to update
 * @param body_params - Parameters to update for the file
 * @returns Updated file object or error if not found
 */
fileRouter.post("/:fileName", async (req, res) => {
  const body_params: updateFileInterface = req.body;
  const update_params: IFileObject = Object.assign(
    {},
    { name: req.params.fileName },
    body_params,
  );
  const error = await update_file(update_params);

  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const file = await get_file(req.params.fileName);
  res.status(200);
  res.send(file);
});

/**
 * Delete a file from the database
 * @param fileName - The name of the file to delete
 * @returns Success status or error if not found
 */
fileRouter.delete("/:fileName", async (req, res) => {
  const error = await delete_file(req.params.fileName);

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
