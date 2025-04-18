# Shizu Assistance (Contained)

Status: **Basic Functionality**

Manage organization members, assets, events and themes for OBS DJ steams. 

This is a containerization and subsequent development of [Shizu OBS Assisstant](https://github.com/Linkcube/ShizuObsAssistant), with support to import JSON data from the previous program.

## Setup

Install [docker](https://docs.docker.com/get-docker/)

Copy `.env_defaults` to `.env`, and fill out the use specific values as needed.<br>
Check out [Environment Setup](https://github.com/Linkcube/shizu-assistance-contained?tab=readme#environment-setup) for more details.

Run `docker compose up -d` in the root directory.

## Usage

Example walkthrough can be found at [Here](Walkthrough.md)

## Access

This program is intended to be interracted with either through the included GUI service, or through a 3rd party bot (TBD), allowing flexibility of use.

GUI: Default access http://localhost:5000/`

Bot API: Under development.

OBS script: Run inside OBS, checkout the [ReadMe](https://github.com/Linkcube/shizu-assistance-contained/blob/main/OBS%20Script/README.md) for detailed execution.

## Environment Setup
The `.env` file manages shared file mounts and secrets for the services.

**Required to change:**
| Key | Description |
| ----- | ----- |
| `LOCAL_LOGOS_PATH` | Host machine path to mount for logo files |
| `LOCAL_RECORDINGS_PATH` | Host machine path to mount for dj recording files |
| `LOCAL_THEMES_PATH` | Host machine path to mount for theme assets |
| `LOCAL_EXPORT_PATH` | Host machine path to mount for event exports |
| `LOCAL_IMPORT_PATH` | Host machine path to mount for [Shizu OBS Assisstant](https://github.com/Linkcube/ShizuObsAssistant) ledger and exported lineups |
| `RTMP_SERVER` | Format string for DJ RTMP live stream, is formatted with `rtmp-zone, dj-key` |
| `FILE_SERVER_AUTHORIZATION` | Authorization header for downloading URL assets |
| `OBS_CHAT_URL` | Link for OBS browser scene source, only used if a theme is configured for the event |

<br>**System definitions, change at your own risk:**
| Key | Description |
| ----- | ----- |
| `DOCKER_*_PATH` | Same as the above `LOCAL*_PATH` but for internal docker paths |
| `POSTGRES_*` | Postgresql config |


## Changes from Shizu OBS Assistance

This section will list the impact of architectural changes made to aspects of the program, going in depth on new features.

**Data storage**

- Moved to a SQL database for storing program data
- Upgrades will use DB migrations to preserve table validity

**Asset References**

- Assets can now be referenced either as a local file or URL
- URL assets without a local file will be downloaded at event export

**DJ previous events**

- When exporting an event, all included DJ members will have the event added to a new `last_events` field.

**Program Settings**

- Settings are now defined and managed by docker
- Shared across all services to maintain consistency of file paths and secrets
- No longer managed in the GUI

**Theme Management**

- A new entry has been added for OBS themes, this keeps track of assets for starting, ending, and overlay files.
- Events now have a `theme` field for export

**New UI**

- A new UI is used in this version, using the shadcn UI library for a more standard layout

## API Documentation

After standing up the docker containers, a redoc .html file will have been built. This can be accessed from {your-host}:4004/openapi/redoc for barebones documentation on the backend api.

## Using the old UI

Changing the frontend image in `comopose.yaml` from `frontend-svelte-5` to `frontend` will use the older UI image, which currently still has most features supported.

## Volume Migration
Due to the DB docker volume being configured improperly, after v0.1.2 the volume mount has been corrected to `/var/lib/postgresql/data`. In order to preserve data across this, before updating you will need to run the following steps:
- Dump the current DB to the existing volume `/data/postgres`. `pg_dump -F c -d shizu_db -f /data/postgres/db.dump` should work.
- Verify the `db.dump` file is present in your docker volume, and save it to your host system.
- Change the volume mount to `/var/lib/postgresql/data`, which is what it will point to in the future. Make sure the existing volume is empty.
- Create a bind mount in the `db` image, `/data/postgres` or some other unused path is fine to mount to in the container.
- Place `db.dump` into your bind mount, so that it is accesible from the rebuilt container.
- Destory both image and container for db, and rebuild both.
- Run `pg_restore`, i.e `pg_restore -c -F c -d shizu_db /path/to/your/db.dump`
- Restart your backend container, and everything should be correctly restored from before the change.
- Continue updating the software as instructed through `git pull` or copy release data.

