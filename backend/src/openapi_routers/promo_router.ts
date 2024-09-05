/*
    Router for handling /openapi/promos/ requests
*/

import { Router } from "express";
import { get_promo, read_promos_table } from "../database";

export const promoRouter = Router();

promoRouter.get("/single-promo/:promoName", async (req, res) => {
    const promo = await get_promo(req.params.promoName);
    if (promo instanceof Error) {
        res.status(404);
        return res.send({
            errorType: "promoNotFoundError",
            message: `Promo ${req.params.promoName} does not exist`
        });
    }
    res.status(200);
    return res.send(promo);
});

promoRouter.get("/min", async (req, res) => {
    const promos_data = await read_promos_table();
    res.status(200);
    return res.send(promos_data.map(promo => {return {
        name: promo.name
    }}));
});

promoRouter.get("/", async (req, res) => {
    res.status(200);
    return res.send(await read_promos_table());
});