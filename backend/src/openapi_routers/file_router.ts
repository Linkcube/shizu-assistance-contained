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

fileRouter.get("/logo-permissions", async (req, res) => {
  const file_blob = await getLocalLogoFiles([]);
  res.status(200);
  return res.send(file_blob);
});

fileRouter.get("/logo-permissions/:logoPath", async (req, res) => {
  const decoded_path = decodeURIComponent(req.params.logoPath);
  const file_blob = await getLocalLogoFiles(decoded_path.split("/"));
  res.status(200);
  return res.send(file_blob);
});

fileRouter.get("/recording-permissions", async (req, res) => {
  const file_blob = await getLocalRecordingFiles([]);
  res.status(200);
  return res.send(file_blob);
});

fileRouter.get("/recording-permissions/:recordingPath", async (req, res) => {
  const decoded_path = decodeURIComponent(req.params.recordingPath);
  const file_blob = await getLocalRecordingFiles(decoded_path.split("/"));
  res.status(200);
  return res.send(file_blob);
});

fileRouter.get("/theme-permissions", async (req, res) => {
  const file_blob = await getLocalThemeFiles([]);
  res.status(200);
  return res.send(file_blob);
});

fileRouter.get("/theme-permissions/:themePath", async (req, res) => {
  const decoded_path = decodeURIComponent(req.params.themePath);
  const file_blob = await getLocalThemeFiles(decoded_path.split("/"));
  res.status(200);
  return res.send(file_blob);
});

fileRouter.get("/logos", async (req, res) => {
  res.status(200);
  return res.send(await read_files_logos());
});

fileRouter.get("/recordings", async (req, res) => {
  res.status(200);
  return res.send(await read_files_recordings());
});

fileRouter.get("/themes", async (req, res) => {
  res.status(200);
  return res.send(await read_files_themes());
});

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

fileRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_files_table());
});

// setters

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
