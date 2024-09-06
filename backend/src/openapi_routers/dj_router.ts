/*
    Router for handling /openapi/dj/ requests
*/

import { Router } from "express";
import { get_dj, read_djs_table } from "../database";

export const djRouter = Router();

djRouter.get("/min", async (req, res) => {
  const dj_data = await read_djs_table();
  res.status(200);
  return res.send(
    dj_data.map((dj) => {
      return {
        name: dj.name,
        logo: dj.logo,
        recording: dj.recording,
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
