/*
	Router for handling /settings
*/

import { Router } from "express";
import { get_rtmp_zones } from "../database";

export const settingsRouter = Router();

/**
 * Get the application version data
 * @returns {Object} The version object.
 */
settingsRouter.get("/version", async (req, res) => {
  const version = "0.15.0";
  const version_data = {
    version,
  };
  res.status(200);
  res.send(version_data);
});

/**
 * Get the RTMP Zone data
 * @returns {Object} The RTMP Zones object.
 */
settingsRouter.get("/rtmp", async (req, res) => {
  const rtmp_zones = get_rtmp_zones();
  const rtmp_server = process.env.RTMP_SERVER;

  res.status(200);
  res.send({
	"rtmp_server": rtmp_server,
	"rtmp_zones": rtmp_zones
  });
});
