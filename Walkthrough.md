# Walkthrough for Setup and Usage

## Setup

Not referring to installation (check the [README](/README.md) for that).

This section is for interracting with the GUI to setup and export an event, [Usage](#usage) will cover applying the output in OBS.

### Adding DJs

DJs can be added either on the main page, or inside of an event by clicking on the **+** button for DJs. Each entry has the following properties:

| Property | Description |
| ----- | ----- |
| `DJ Name` | Name used to reference the entry, this cannot be changed in the future |
| `Public Name` | Name to override `DJ Name` if updates are needed |
| `Discord ID` | Currently not used, but planned use in future functionality |
| `Logo File` | File pointing to the local file/url for the DJ's logo |
| `RTMP Server` | Which RTMP server the DJ is connecting to if live |
| `Stream Key` | DJ's unique stream key used when connecting for a live stream |
| `Recording File` | File pointing to the local file/url for the DJ's recording |

If a `Logo File` is not set, `DJ Name` as a text element will be used for OBS unless `Public Name` is set.

Both the `Logo File` and `Recording File` point to a `File` object, which can be accessed/set by clicking on the button next to each respective line.

`File` objects can either point to a local file set in the directories specified in the README (`LOCAL_LOGOS_PATH` and `LOCAL_RECORDINGS_PATH`), or to a URL which it will use the `FILE_SERVER_AUTHORIZATION` when accessing. When picking a local file, a preview will be displayed if the browser can render it (Firefox by default lacks a lot of compatibility).


### Adding Promos

Much like DJs, promos can be added either on the main page or in an event's popup. To display promos on the front page click the button next to the **+** with two arrows. Promos only have two properties:

| Property | Description |
| ----- | ----- |
| `Promo Name` | Name used to reference the entry, this cannot be changed in the future |
| `Recording File` | File pointing to the local file/url for the Promo's recording |

This is the same `File` object as for DJs.
In OBS, promos will be added as a single vlc playlist of all files.

### Accessing DJs and Promos

Existing entries can be accessed by clicking on the row with their name on it, in the case of having too many elements to easily find the table headers (#/Name/Logo/etc) can be clicked on to sort all entries in table. Additionally entries can be searched for by entering text in the search bar, and either hitting `Enter` clicking outside of the text box.

### Creating an Event

Events can be created by clicking on the **+** button under Events on the right side of the screen, the only input for this is the event's name. Like DJs and Promos, the name is immutable after creation.

### Accessing an Event

Events can be accessed, sorted, and filtered just as DJs/Promos. By default Events will be sorted by most recently created. Events have the following 

Events have the following values/windows:

- DJs
- Promos
- Day & Time
- Checklist
- Theme
- Export
- Event Info

### Event DJs

Each event will have a list of DJs, they can be added by clicking the **+** button next the `DJs`. In this window you can either select an existing DJ to add, or create a new entry. After adding DJs, their order can be changed by dragging and dropping their table row. Each Event DJ has the following properties:

| Property | Description |
| ----- | ----- |
| `Is Live` | If the DJ will be live streaming |
| `VJ Name` | If the DJ's visuals should be credited with a VJ |

By clicking on an Event DJ these values can be updated, along with a quick summary on the rest of the DJ's entry. The DJ can be edited as well by clicking on the pencil icon in the top right.

### Event Promos

Similar to `Event DJs`, but will have no proprties unique to the event.

### Event Day & Time

Accessed by clicking the Calendar icon in the top right, the day and time (eastern) can be set here.

### Event Checklist

Using the data from `Day & Time`, the checklist highlights what preperations should have been/to take based on the number of days left till the event.

### Event Theme

Defines files and dimensions for a Theme, once a Theme is created it can be used by any Event. Themes have the following properties:

| Property | Description |
| ----- | ----- |
| `Overlay` | `File` used for the stream overlay |
| `Starting File` | `File` used as "stream starting soon" or similar media |
| `Ending File` | `File` used as "stream has ended" or similar media |
| `Video Dimensions` | The height and width the overlay is designed to accomodate |
| `Video Offset` | The X and Y offsets (from the top left) to fit files inside the overlay |
| `Chat Dimensions` | Same as `Video Dimensions` for stream chat |
| `Chat Offset` | Same as `Video Offset` for stream chat |

`Overlay`, `Starting File`, and `Ending File` will have access to local files in `LOCAL_THEMES_PATH`.

### Event Info

A brief summary of the above values at a glance.

### Event Export

Exports a `json` file with the same name as the Event for use with the OBS script, files are written to `LOCAL_EXPORT_PATH`

*Note: Currently does not give any feedback on success/failure*

## Usage

After exporting an event, how to add it to OBS including setting up scene automation.

### Cleaning Up OBS

The OBS script only has the ability to create new scenes/items, so all previously generated content must be removed before importing.

If the event's theme has a starting/ending file, their scenes must be removed.

If using automation, open `Tools>Automatic Scene Switcher` and under the `Macros` tab remove all existing macros.

### Importing an Event

Open `Tools>Scripts` and select `shizu_obs_hijack_script.py`, if this doesn't exist then make sure to add it as well have python setup for OBS. Specifics for this script can be found in [this README](/OBS%20Script/README.md), but generally the usage is:
- Select the Event's `json` file
- Select `Translate to Host Paths`
- Select `Generate OBS Macros` if using automation

After clicking `Update Event`, the new scenes/items will be generated.

### Importing Automation

After importing the event, an automation `txt` will have been created in the same folder as the Event's `json` file was located. open `Tools>Automatic Scene Switcher` and under the `General` tab click `Import` (you will probably have to scroll down for this) and select the `txt` file with the Event's name.

The automation logic works only as DJs -> Last DJ -> Promos (if added) -> Ending Scene. If any edits need to be made, they can be done from the Automatic Scene Switcher.

### Adjusting Event Elements

While recordings and live streams will be placed correctly in the overlay, DJ Logos/text and VJ text will need to be scaled and positioned for each of the scenes.

## Done

Congratulations! You're ready to stream.