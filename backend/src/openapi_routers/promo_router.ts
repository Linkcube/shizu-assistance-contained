/*
    Router for handling /openapi/promo/ requests
*/

import { Router } from "express";
import { components } from "../../openapi/schema";
import {
  delete_promo,
  get_promo,
  insert_into_promos,
  read_promos_table,
  update_promo,
} from "../database";
import { IPromoObject } from "../types";

export const promoRouter = Router();

type promoInterface = components["schemas"]["Promo"];
type updatePromoInterface = components["schemas"]["UpdatePromo"];

/**
 * GET /min
 * Returns a minimal list of all promos, including only their names.
 */
promoRouter.get("/min", async (req, res) => {
  const promos_data = await read_promos_table();
  res.status(200);
  return res.send(
    promos_data.map((promo) => {
      return {
        name: promo.name,
      };
    }),
  );
});

/**
 * GET /:promoName
 * Retrieves a specific promo by its name.
 *
 * @param {string} req.params.promoName - The name of the promo to retrieve.
 * @returns {Object} The promo object if found, otherwise returns an error response with status code 404.
 */
promoRouter.get("/:promoName", async (req, res) => {
  const promo = await get_promo(req.params.promoName);
  if (promo instanceof Error) {
    res.status(404);
    return res.send({
      errorType: "promoNotFoundError",
      message: `Promo ${req.params.promoName} does not exist`,
    });
  }
  res.status(200);
  return res.send(promo);
});

/**
 * GET /
 * Retrieves the full list of all promos.
 *
 * @returns {Array<Object>} An array of promo objects.
 */
promoRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_promos_table());
});

/**
 * POST /
 * Creates a new promo with provided data.
 *
 * @param {Object} req.body - The body containing the promo details to insert.
 * @returns {Object} The created promo object on success,
 *  or an error response if required fields are missing or conflict occurs.
 */
promoRouter.post("/", async (req, res) => {
  const new_promo: promoInterface = req.body;
  if (!new_promo.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create a Promotion.",
    });
  }

  const error = await insert_into_promos(new_promo as IPromoObject);
  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const promo = await get_promo(new_promo.name);
  res.status(200);
  res.send(promo);
});

/**
 * POST /:promoName
 * Updates an existing promo with the given name using provided data.
 *
 * @param {string} req.params.promoName - The name of the promo to update.
 * @param {Object} req.body - The body containing updated fields for the promo.
 * @returns {Object} The updated promo object on success, or an error response if the promo does not exist.
 */
promoRouter.post("/:promoName", async (req, res) => {
  const promo_params: updatePromoInterface = req.body;
  const update_params: IPromoObject = Object.assign(
    {},
    { name: req.params.promoName },
    promo_params,
  );

  const error = await update_promo(update_params);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const promo = await get_promo(req.params.promoName);
  res.status(200);
  res.send(promo);
});

/**
 * DELETE /:promoName
 * Deletes a specific promo by its name.
 *
 * @param {string} req.params.promoName - The name of the promo to delete.
 * @returns {void} Returns empty response on success, or an error if the promo is not found.
 */
promoRouter.delete("/:promoName", async (req, res) => {
  const error = await delete_promo(req.params.promoName);
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
