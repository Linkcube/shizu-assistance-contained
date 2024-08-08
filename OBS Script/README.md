# Shizu OBS Hijack Script

This is a python script for importing exported events into OBS, generating scenes, sources and macro transitions for an event.

## Setup

After exporting an event, load this script in your OBS instance (tools > scripts).
<br>Note: Python must be setup and pointed to in your OBS install

Once the script is added, the following options will appear for the script:

| GUI | Description |
| ----- | ----- |
| `Location of the Lineup` | File dialog that lets your select the exported event file |
| `Translate to Host Paths` | Check if running OBS/the script on your host machine instead of inside Docker |
| `Generate OBS Macros` | Creates a *_macro.txt file to be imported into [Advanced Scene Switcher](https://github.com/WarmUpTill/SceneSwitcher) |

## Use

Select the exported event you intend to use, and check the values depending on your preference. Once the values are setup, click `Update Lineup` and you should now have new scenes for DJs and Promotional Videos.

If a theme was configured for the event before export, new `Overlay`, `Starting Soon` and `Ending` scenes will be created using the assets supplied.

When macros are generated and imported into Advanced Scene Switcher, they will automatically switch to the next scene on prerecorded sets, going from the first DJ through promotional videos and the ending scene.
Macros have no handling for live DJs, and as such those scenes will need to be transitioned manually.
<br>Note: Macros are saved in the same folder as the exported lineup was selected from.