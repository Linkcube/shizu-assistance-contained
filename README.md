# Shizu Assistance (Contained)

Status: **Do not use**

Manage organization members, assets, events and themes for OBS DJ steams. 

This is a containerization and subsequent development of [Shizu OBS Assisstant](https://github.com/Linkcube/ShizuObsAssistant), with support to import JSON data from the previous program.

## Setup

Install [docker](https://docs.docker.com/get-docker/)

Copy `.env_defaults` to `.env`, and fill out the use specific values as needed.<br>
Check out [Environment Setup](https://github.com/Linkcube/shizu-assistance-contained?tab=readme#environment-setup) for more details.

Run `docker compose up -d` in the root directory.

## Access

This program is intended to be interracted with either through the included GUI service, or through a 3rd party bot (TBD), allowing flexibility of use.

GUI: Under development.

Bot API: Under development.

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
| `LOCAL_OBS_RECORDINGS_PATH` | Host machine path to mount for OBS recordings |
| `RTMP_SERVER` | Format string for DJ RTMP live stream, is formatted with `rtmp-zone, dj-key` |
| `FILE_SERVER_AUTHORIZATION` | Authorization header for downloading URL assets |

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