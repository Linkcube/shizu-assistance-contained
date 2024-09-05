/*
    Router for handling /openapi/events/ requests
*/

import { Router } from "express";
import { get_event, read_events_table } from "../database";

export const eventRouter = Router();

eventRouter.get("/single-event/:eventName", async (req, res) => {
    const event = await get_event(req.params.eventName);
    if (event instanceof Error) {
        res.status(404);
        return res.send({
            errorType: "eventNotFoundError",
            message: `Event ${req.params.eventName} does not exist`
        });
    }
    res.status(200);
    return res.send(event);
});

eventRouter.get("/min", async (req, res) => {
    const events_data = await read_events_table();
    res.status(200);
    return res.send(events_data.map(event => {return {
        name: event.name
    }}));
});

eventRouter.get("/", async (req, res) => {
    res.status(200);
    return res.send(await read_events_table());
});