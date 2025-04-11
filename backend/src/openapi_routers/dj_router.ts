/*
    Router for handling /openapi/dj/ requests
*/

import { Router } from "express";
import { paths, components } from "../../openapi/schema";
import {
  delete_dj,
  get_dj,
  insert_into_djs,
  read_djs_table,
  update_dj,
} from "../database";
import { IDjObject } from "../types";

export const djRouter = Router();

type djInterface = components["schemas"]["DJ"];
type updateDjInterface = components["schemas"]["UpdateDJ"];

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

djRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_djs_table());
});

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
