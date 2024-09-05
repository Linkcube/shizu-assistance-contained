/*
    Router for handling /openapi/files/ requests
*/

import { Router } from "express";
import { paths, components} from "../../openapi/schema";
import { get_file, read_files_logos, read_files_recordings, read_files_table, read_files_themes } from "../database";
import { getLocalLogoFiles, getLocalRecordingFiles, getLocalThemeFiles } from "../file_helpers";

type fileInterface = components["schemas"]["File"];
export const fileRouter = Router();

fileRouter.get("/logo-permissions", async (req, res) => {
    const file_blob = await getLocalLogoFiles([]);
    res.status(200);
    return res.send(file_blob);
});

fileRouter.get("/logo-permissions/:logoPath", async (req, res) => {
    const file_blob = await getLocalLogoFiles(req.params.logoPath.split("/"));
    res.status(200);
    return res.send(file_blob);
});

fileRouter.get("/recording-permissions", async (req, res) => {
    const file_blob = await getLocalRecordingFiles([]);
    res.status(200);
    return res.send(file_blob);
});

fileRouter.get("/recording-permissions/:recordingPath", async (req, res) => {
    const file_blob = await getLocalRecordingFiles(req.params.recordingPath.split("/"));
    res.status(200);
    return res.send(file_blob);
});

fileRouter.get("/theme-permissions", async (req, res) => {
    const file_blob = await getLocalThemeFiles([]);
    res.status(200);
    return res.send(file_blob);
});

fileRouter.get("/theme-permissions/:themePath", async (req, res) => {
    const file_blob = await getLocalThemeFiles(req.params.themePath.split("/"));
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

fileRouter.get("/single-file/:fileName", async (req, res) => {
    const file = await get_file(req.params.fileName);
    if (file instanceof Error) {
        console.log(`Error on ${req.params.fileName}, returning 404.`);
        res.status(404);
        return res.send({
            errorType: "fileNotFoundError",
            message: `File ${req.params.fileName} does not exist`
        });
    }

    res.status(200);
    res.send(file);
});

fileRouter.get("/", async (req, res) => {
    res.status(200);
    return res.send(await read_files_table());
});