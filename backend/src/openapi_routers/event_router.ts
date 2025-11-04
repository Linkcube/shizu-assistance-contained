/*
    Router for handling /openapi/event/ requests
*/

import { Router } from "express";
import { paths, components } from "../../openapi/schema";
import {
  add_event_dj,
  event_add_promo,
  delete_event,
  export_event,
  get_event,
  insert_into_events,
  move_event_dj,
  move_event_promo,
  read_events_table,
  remove_event_dj,
  remove_event_promo,
  set_event_theme,
  update_event,
  update_event_date_time,
  update_event_dj,
  event_export_summary,
  get_event_djs_by_event,
} from "../database";
import {
  IEventObject,
  IEventDjObject,
  ILineupDjObject,
  IUpdateEventDjObject,
} from "../types";

export const eventRouter = Router();

type eventInterface = components["schemas"]["Event"];
type updateEventInterface = components["schemas"]["UpdateEvent"];
type updateDateTimeInterface = components["schemas"]["UpdateEventDateTime"];
type lineupDJInterface = components["schemas"]["LineupDJ"];
type updateLineupDJInterface = components["schemas"]["UpdateLineupDJ"];
type lineupPromoInterface = components["schemas"]["LineupPromotion"];
type moveEventItemInterface = components["schemas"]["MoveEventItem"];
type eventExportSummaryInterface = components["schemas"]["EventExportSummary"];

/**
 * Retrieves a minimal list of events with just their names.
 *
 * @returns {Array<{ name: string }>} An array of event objects containing only the event name.
 */
eventRouter.get("/min", async (req, res) => {
  const events_data = await read_events_table();
  res.status(200);
  return res.send(
    events_data.map((event) => {
      return {
        name: event.name,
      };
    }),
  );
});

/**
 * Converts an internal database event object into a UI-friendly format by fetching associated DJs.
 *
 * @param {IEventObject} event - The raw event data from the database.
 * @returns {Promise<eventInterface>} A transformed event object including DJ lineup information.
 */
const make_ui_event_object = async (event: IEventObject) => {
  const event_djs = await get_event_djs_by_event(event.name);
  const ui_event_obj: eventInterface = Object.assign({}, event);
  if (event_djs) {
    ui_event_obj.djs = event_djs.map((event_dj) => {
      return {
        name: event_dj.dj,
        is_live: event_dj.is_live,
        vj: event_dj.vj,
        recording: event_dj.recording,
        visuals: event_dj.visuals,
        use_generic_visuals: event_dj.use_generic_visuals,
      };
    });
  } else {
    ui_event_obj.djs = [];
  }
  return ui_event_obj;
};

/**
 * Retrieves a specific event by its name and returns it in a UI-ready format.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event to retrieve.
 * @returns {Promise<eventInterface>} The full event data including DJs, or an error if not found.
 */
eventRouter.get("/:eventName", async (req, res) => {
  const event = await get_event(req.params.eventName);
  if (event instanceof Error) {
    res.status(404);
    return res.send({
      errorType: "eventNotFoundError",
      message: `Event ${req.params.eventName} does not exist`,
    });
  }
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  return res.send(ui_event_obj);
});

/**
 * Fetches all events from the database and returns them in a UI-ready format.
 *
 * @returns {Promise<Array<eventInterface>>} An array of all events with their associated DJ lineups.
 */
eventRouter.get("/", async (req, res) => {
  res.status(200);
  const event_objects = await read_events_table();
  const event_interfaces = [];
  for (const event_object of event_objects) {
    event_interfaces.push(await make_ui_event_object(event_object));
  }
  return res.send(event_interfaces);
});

/**
 * Creates a new event based on the provided request body and adds optional DJs to it.
 *
 * @param {eventInterface} req.body - The event data including optional DJ lineup.
 * @returns {Promise<eventInterface>} The newly created event in UI-ready format,
 *  or an error if name is missing or conflict occurs.
 */
eventRouter.post("/", async (req, res) => {
  const new_event: eventInterface = req.body;
  if (!new_event.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to create an event.",
    });
  }

  const event_djs = new_event.djs?.map((dj) => {
    return {
      event: new_event.name,
      dj: dj.name,
      is_live: dj.is_live,
      vj: dj.vj,
      recording: dj.recording,
    } as IEventDjObject;
  });

  delete new_event.djs;

  const error = await insert_into_events(
    new_event as IEventObject,
    event_djs ? event_djs : [],
  );
  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(new_event.name);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Updates an existing event's properties and optionally updates its DJ lineup.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event to update.
 * @param {updateEventInterface} req.body - Updated fields for the event along with potential DJ changes.
 * @returns {Promise<eventInterface>} The updated event in UI-ready format, or an error if not found.
 */
eventRouter.post("/:eventName", async (req, res) => {
  const event_params: updateEventInterface = req.body;

  const event_djs = event_params.djs?.map((dj) => {
    return {
      event: req.params.eventName,
      dj: dj.name,
      is_live: dj.is_live,
      vj: dj.vj,
      recording: dj.recording,
      visuals: dj.visuals,
      use_generic_visuals: dj.use_generic_visuals,
    } as IEventDjObject;
  });

  delete event_params.djs;

  const update_params: IEventObject = Object.assign(
    {},
    { name: req.params.eventName },
    event_params,
  );

  const error = await update_event(update_params, event_djs ? event_djs : []);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Deletes a specific event by its name from the database.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event to delete.
 * @returns {Promise<void>} Returns success status if deletion is successful; otherwise an error.
 */
eventRouter.delete("/:eventName", async (req, res) => {
  const error = await delete_event(req.params.eventName);
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

/**
 * Updates the date and start time for a specific event.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event to update.
 * @param {updateDateTimeInterface} req.body - Date and time information required to update the event.
 * @returns {Promise<eventInterface>} Updated event in UI-ready format, or an error if missing fields or not found.
 */
eventRouter.post("/:eventName/dateTime", async (req, res) => {
  const datetime_params: updateDateTimeInterface = req.body;
  if (!datetime_params.date) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The date field is required to update an event.",
    });
  }
  if (!datetime_params.start_time) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The start_time field is required to update an event.",
    });
  }

  const error = await update_event_date_time(
    req.params.eventName,
    datetime_params.date,
    datetime_params.start_time,
  );
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Adds a DJ to a specified event's lineup.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event.
 * @param {lineupDJInterface} req.body - Information about the new DJ to be added.
 * @returns {Promise<eventInterface>} Event with updated DJ list in UI-ready format,
 *  or an error if name is missing or not found.
 */
eventRouter.post("/:eventName/dj", async (req, res) => {
  const new_dj: lineupDJInterface = req.body;
  if (!new_dj.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The dj field is required to add a DJ to an event's lineup.",
    });
  }

  const event_dj: IEventDjObject = {
    event: req.params.eventName,
    dj: req.body.name,
    is_live: req.body.is_live,
    vj: req.body.vj,
    recording: req.body.recording,
    position: -1,
  };

  const error = await add_event_dj(event_dj);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Updates specific properties of a DJ within an event's lineup.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event.
 * @param {string} req.params.djName - Name of the DJ whose info is being updated.
 * @param {updateLineupDJInterface} req.body - New values for live status, VJ status etc. for the DJ.
 * @returns {Promise<eventInterface>} Updated event in UI-ready format, or an error if not found.
 */
eventRouter.post("/:eventName/dj/:djName", async (req, res) => {
  const dj_params: updateLineupDJInterface = req.body;

  const error = await update_event_dj(
    req.params.eventName,
    req.params.djName,
    dj_params.is_live,
    dj_params.vj,
  );
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Deletes a specific event by its name from the database.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event to delete.
 * @returns {Promise<void>} Returns success status if deletion is successful; otherwise an error.
 */
eventRouter.delete("/:eventName/dj/:djName", async (req, res) => {
  const error = await remove_event_dj(req.params.eventName, req.params.djName);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Moves a DJ at one index to another position within the event’s lineup.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event.
 * @param {moveEventItemInterface} req.body - Index positions (`index_a`, `index_b`) for swapping DJs.
 * @returns {Promise<eventInterface>} Event with reordered DJ list in UI-ready format, or an error if not found.
 */
eventRouter.post("/:eventName/move-dj", async (req, res) => {
  const move_params: moveEventItemInterface = req.body;
  if (move_params.index_a === undefined) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message:
        "The index_a field is required to move a DJ in an event's lineup.",
    });
  }
  if (move_params.index_b === undefined) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message:
        "The index_a field is required to move a DJ in an event's lineup.",
    });
  }

  const error = await move_event_dj(
    req.params.eventName,
    move_params.index_a,
    move_params.index_b,
  );
  if (error instanceof Error) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Adds a promotion to the lineup of a specified event.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event.
 * @param {lineupPromoInterface} req.body - Name and details of the new promotion to add.
 * @returns {Promise<eventInterface>} Event with updated promo list in UI-ready format,
 *  or an error if name is missing or not found.
 */
eventRouter.post("/:eventName/promo", async (req, res) => {
  const new_promo: lineupPromoInterface = req.body;
  if (!new_promo.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message:
        "The name field is required to add a promotion to an event's lineup.",
    });
  }

  const error = await event_add_promo(req.params.eventName, new_promo.name);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Removes a specific promotion from an event's lineup.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event.
 * @param {string} req.params.promoName - Name of the promotion to remove.
 * @returns {Promise<eventInterface>} Event with updated promo list in UI-ready format,
 *  or an error if not found.
 */
eventRouter.delete("/:eventName/promo/:promoName", async (req, res) => {
  const error = await remove_event_promo(
    req.params.eventName,
    req.params.promoName,
  );
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Moves a promotion at one index to another position within the event’s lineup.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event.
 * @param {moveEventItemInterface} req.body - Index positions (`index_a`, `index_b`) for swapping promotions.
 * @returns {Promise<eventInterface>} Event with reordered promo list in UI-ready format,
 *  or an error if not found.
 */
eventRouter.post("/:eventName/move-promo", async (req, res) => {
  const move_params: moveEventItemInterface = req.body;
  console.log(move_params);
  if (move_params.index_a === undefined) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message:
        "The index_a field is required to move a promotion in an event's lineup.",
    });
  }
  if (move_params.index_b === undefined) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message:
        "The index_a field is required to move a promotion in an event's lineup.",
    });
  }

  const error = await move_event_promo(
    req.params.eventName,
    move_params.index_a,
    move_params.index_b,
  );
  if (error instanceof Error) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Sets the theme of a specific event.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event.
 * @param {lineupPromoInterface} req.body - Name of the new theme to set for the event.
 * @returns {Promise<eventInterface>} Updated event object with new theme in UI-ready format,
 *  or an error if name is missing or not found.
 */
eventRouter.post("/:eventName/set-theme", async (req, res) => {
  const theme: lineupPromoInterface = req.body;
  if (!theme.name) {
    res.status(400);
    return res.send({
      errorType: "InvalidInputError",
      message: "The name field is required to set event's theme.",
    });
  }

  const error = await set_event_theme(req.params.eventName, theme.name);
  if (error !== undefined) {
    res.status(404);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  const event = await get_event(req.params.eventName);
  const ui_event_obj = await make_ui_event_object(event);
  res.status(200);
  res.send(ui_event_obj);
});

/**
 * Exports all data related to a specified event.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event to export.
 * @returns {Promise<void>} Sends empty response on successful completion or error if not found.
 */
eventRouter.post("/:eventName/export", async (req, res) => {
  const error = await export_event(req.params.eventName);
  if (error !== undefined) {
    res.status(409);
    return res.send({
      errorType: error.name,
      message: error.message,
    });
  }

  res.status(200);
  res.send();
});

/**
 * Retrieves a summary of an event including its details, DJs, promotions,
 *  theme and associated files for export purposes.
 *
 * @param {string} req.params.eventName - The unique identifier/name of the event to retrieve summary for.
 * @returns {Promise<eventExportSummaryInterface>} Returns a structured summary object containing event info,
 *  djs, promos, theme, and file paths; or error if not found.
 */
eventRouter.get("/:eventName/export-summary", async (req, res) => {
  const event_summary = await event_export_summary(req.params.eventName);

  if (event_summary instanceof Error) {
    res.status(404);
    return res.send({
      errorType: event_summary.name,
      message: event_summary.message,
    });
  }

  const ui_event_obj = await make_ui_event_object(event_summary.event);
  const summary: eventExportSummaryInterface = {
    event: ui_event_obj,
    djs: event_summary.djs,
    promos: event_summary.promos,
    theme: event_summary.theme,
    files: event_summary.files,
  };

  res.status(200);
  res.send(summary);
});
