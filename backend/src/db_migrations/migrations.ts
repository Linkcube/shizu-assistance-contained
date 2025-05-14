import { Client } from "pg";
import { ALL_TABLES, EVENT_DJS_TABLE_0 } from "./initial_tables";
import {
  DJS_TABLE_NAME,
  EVENT_DJS_TABLE_NAME,
  EVENTS_TABLE_NAME,
  FILES_TABLE_NAME,
  THEMES_TABLE_NAME,
} from "../tables";

// Create base version of all tables, if they don't exist.
const initial_setup = async (client: Client) => {
  console.log("Starting initial table setup.");
  for (const table of ALL_TABLES) {
    await client.query(table.create_table());
  }
  console.log("Completed initial table setup.");
};

// Introduce opening bgm
const migration_1 = async (client: Client) => {
  console.log("Starting migration 1.");
  await client.query(
    `ALTER TABLE "${THEMES_TABLE_NAME}" ADD COLUMN IF NOT EXISTS starting_bgm_file text references ${FILES_TABLE_NAME}(name);`,
  );
  console.log("Completed migration 1.");
};

// Add Event_DJ relation table and populate entries. Drops Event.djs and DJ.recording.
const migration_2 = async (client: Client) => {
  console.log("Staring migration 2.");
  // Check if table exists, skip migration if so
  const retval = await client.query(EVENT_DJS_TABLE_0.exists());
  if (retval.rowCount && retval.rowCount > 0) {
    console.log("Skipping migration 2.");
    return Promise.resolve();
  }
  // Create table
  await client.query(EVENT_DJS_TABLE_0.create_table());
  // Populate with each entry in every event's dj field
  await client.query(`
    DO $$
    DECLARE
        event_record RECORD;
        dj_record ${EVENTS_TABLE_NAME}.djs%TYPE;
        counter INTEGER := 0;
    BEGIN
        -- Loop through each event in the Event table
        FOR event_record IN (SELECT * FROM ${EVENTS_TABLE_NAME}) LOOP
            -- Unnest the JSON array and insert into Event_DJ
            FOR
              dj_record IN SELECT jsonb_array_elements(djs::jsonb)
                FROM ${EVENTS_TABLE_NAME} where name = event_record.name
            LOOP
              INSERT INTO ${EVENT_DJS_TABLE_NAME} (event, dj, position, is_live, vj)
                VALUES (
                    event_record.name,
                    dj_record->>'name',
                    counter,
                    (dj_record->>'is_live')::boolean,
                    dj_record->>'vj'
                );
              counter := counter + 1;
            END LOOP;
        counter := 0;
        END LOOP;
    END $$;
  `);
  await client.query(`
    DO $$
    DECLARE
        dj_record RECORD;
    BEGIN
        -- Loop through each DJ in the DJ table
        FOR dj_record IN (SELECT * FROM ${DJS_TABLE_NAME}) LOOP
            -- Update recording value with the one from DJ table
            UPDATE ${EVENT_DJS_TABLE_NAME}
              SET recording = dj_record.recording
              WHERE dj = dj_record.name;
        END LOOP;
    END $$;
  `);
  // Drop the DJs recording column
  await client.query(
    `ALTER TABLE ${DJS_TABLE_NAME} DROP COLUMN IF EXISTS recording`,
  );
  // Drop the Events old djs column
  await client.query(
    `ALTER TABLE ${EVENTS_TABLE_NAME} DROP COLUMN IF EXISTS djs`,
  );
  console.log("Completed migration 2.");
  // TODO: optionally remove stale recording files
};

// Add visuals, use_generic_visuals to event_dj
const migration_3 = async (client: Client) => {
  console.log("Starting migration 3.");
  await client.query(
    `ALTER TABLE "${EVENT_DJS_TABLE_NAME}" ADD COLUMN IF NOT EXISTS visuals text references ${FILES_TABLE_NAME}(name);`,
  );
  await client.query(
    `ALTER TABLE "${EVENT_DJS_TABLE_NAME}" ADD COLUMN IF NOT EXISTS use_generic_visuals boolean;`,
  );
  console.log("Completed migration 3.");
};

export const run_migrations = async (client: Client) => {
  const migrations = [initial_setup, migration_1, migration_2, migration_3];

  for (let i = 0; i < migrations.length; i++) {
    try {
      await client.query("BEGIN");
      // Run migration
      await migrations[i](client);
      // Commit transaction
      await client.query("COMMIT");
    } catch (e) {
      // Rollback on error
      await client.query("ROLLBACK");
      console.log(`Failed migration #${i}`);
      throw e;
    }
  }
};
