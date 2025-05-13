# Walkthrough for Setup and Usage

## Setup

Not referring to installation (check the [README](/README.md) for that).

This section is for interracting with the program once setup.

## GUI Setup

Moved to `/help` in the GUI, as the process and parameters are subject to change.

## OBS Usage

After exporting an event, how to add it to OBS including setting up scene automation.

### Cleaning Up OBS

The OBS script only has the ability to create new scenes/items, so all previously generated content must be removed before importing.

If the event's theme has a starting/ending file, their scenes must be removed.

If using automation, open `Tools>Automatic Scene Switcher` and under the `Macros` tab remove all existing macros.

### Automating Cleanup

Searching online, you can find where OBS stores the current scene data (windows is in %APPDATA%, etc). Cleaning up OBS and keeping a copy of the scene `.json`, you can overwrite the scene data when preparing to import a new event instead of manually deleting scenes and automation sequences.

### Importing an Event

Open `Tools>Scripts` and select `shizu_obs_hijack_script.py`, if this doesn't exist then make sure to add it (as well have python setup for OBS). Specifics for this script can be found in [this README](/OBS%20Script/README.md), but generally the usage is:
- Select the Event's `json` file
- Select `Translate to Host Paths`
- Select `Generate OBS Macros` if using automation

After clicking `Update Event`, the new scenes/items will be generated.

### Importing Automation

After importing the event, an automation `.txt` will have been created in the same folder as the Event's `.json` file was located. open `Tools>Automatic Scene Switcher` and under the `General` tab click `Import` (you will probably have to scroll down for this) and select the `.txt` file with the Event's name.

The automation logic works only as DJs -> Promos (if added) -> Ending Scene. If any edits need to be made, they can be done from the Automatic Scene Switcher. Automations will only be created for DJs that are pre-recorded, as live DJs won't have any triggers to work with at this time.

### Adjusting Event Elements

While recordings and live streams will be placed correctly in the overlay, DJ Logos/text and VJ text will need to be scaled and positioned for each of the scenes.

## Done

Congratulations! You're ready to stream.