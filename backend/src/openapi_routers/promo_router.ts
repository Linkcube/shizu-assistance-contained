/*
    Router for handling /openapi/promo/ requests
*/

import { Router } from "express";
import { paths, components } from "../../openapi/schema";
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

promoRouter.get("/", async (req, res) => {
  res.status(200);
  return res.send(await read_promos_table());
});

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
