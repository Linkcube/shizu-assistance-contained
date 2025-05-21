# OBS script to import a JSON lineup
# Provided as is, use at your own risk.
# Contact linkcube @ Anison Hijack for assistance.

import obspython as S
import json
import os
from pathlib import Path
from PIL import Image
from copy import deepcopy

# Export json properties
DJ_KEY = "djs"
PROMO_KEY = "promos"
THEME_KEY = "theme"
ENV_FILE_NAME = ".env"
ASS_DEFAULT_OBS = "advanced_scene_switcher_obs.json"

# Expected existing scenes if not supplying a theme
OVERLAY_SCENE = "# - Overlay"
STARTING_SCENE = "! - Starting"
ENDING_SCENE = "! - Ending"
PROMOS_SCENE = "Promotional Videos"

# OBS output
RENDER_WIDTH = 1920
RENDER_HEIGHT = 1080

# Tailor to your use case
CHAT_CSS = (
    "body {background-color: rgba(0,0,0,0);font-family: 'Comic Sans MS';" + 
    "margin: 0px auto;overflow: hidden;}.name {font-family: 'Comic Sans MS';}"
)

IMG_EXTS = [*Image.registered_extensions()]


class Hijack:
    # Input values
    lineup_path = None
    host_paths = False
    path_translation_map = {}
    generate_macros = False

    # Theme default values
    target_video_width = 1530
    target_video_height = 857
    video_offset_x = 20
    video_offset_y = 20
    chat_width = 300
    chat_height = 800
    chat_offset_x = 0
    chat_offset_y = 0

    overlay_scene = None
    promos_scene = None
    ending_scene = None
    ass_manager = None

    def begin(self):
        if self.lineup_path:
            lineup_data = self.validate_json_file(self.lineup_path)
        else:
            raise Exception("No lineup submitted")

        if self.host_paths:
            self.parse_env_paths()
        
        if self.generate_macros:
            self.parse_ass_objs()

        
        print("Retreived lineup data, processing..")

        lineup = self.init_lineup_data(lineup_data)

        print("Data processed! Beginning scene generation..")

        self.generate_scenes(lineup)

        print(f"Generation is done! {len(lineup)} scenes created.")

        if self.generate_macros:
            self.generate_ass_file()
    
    def validate_json_file(self, path):
        # Validate file exists, and load JSON data
        if not os.path.exists(path):
            raise Exception("Supplied file does not exist at: " + path)
        with open(path, 'r') as f:
            data = json.load(f)
        return data
    
    def parse_env_paths(self):
        # Prepare translation map for docker->host paths
        env_fp = Path(__file__).absolute().parent.parent.joinpath(ENV_FILE_NAME)
        if not env_fp.exists():
            raise Exception("Could not find .env file for path translation: " + str(env_fp))
        
        with env_fp.open() as f:
            for line in f.readlines():
                key, value = line.rstrip("\n").split("=", 1)
                self.path_translation_map[key] = value
        
        print(".env paths translated")
    
    def generate_host_path(self, docker_key, host_key, raw_path):
        docker_root = self.path_translation_map[docker_key]
        host_root = self.path_translation_map[host_key]
        val = str(Path(host_root).joinpath(raw_path[len(docker_root)+1:]))
        return val
    
    def parse_ass_objs(self):
        self.ass_manager = AdvancedSceneSwitchManager()
    
    def generate_ass_file(self):
        print("Generating Automatic Scene Switch Macros")
        json_data = self.ass_manager.generate_objects(self.promos_scene, self.ending_scene)

        macro_file_name = ''.join(Path(self.lineup_path).name.split(".")[:-1]) + "_macro.txt"
        new_macro_path = Path(self.lineup_path).absolute().parent.joinpath(macro_file_name)
        with open(new_macro_path, "w") as f:
            f.write(json_data)
        
        print("Wrote new macro to: " + str(new_macro_path))

    
    def init_lineup_data(self, lineup_data):
        # Initialize djs->promos scenes in memory
        lineup_scenes = []
        for dj_entry in lineup_data[DJ_KEY]:
            print(dj_entry)
            dj_scene = ObsDjScene(dj_entry.get("name"), dj_entry.get("logo_path"))
            if dj_entry.get("url"):
                dj_scene.stream_url = dj_entry.get("url")
            else:
                dj_scene.recording_path = dj_entry.get("recording_path")
                dj_scene.visuals_path = dj_entry.get("visuals_path")
                dj_scene.resolution = dj_entry.get("resolution")
            if self.host_paths:
                if dj_scene.logo_path:
                    dj_scene.logo_path = self.generate_host_path(
                        "DOCKER_LOGOS_PATH", "LOCAL_LOGOS_PATH", dj_scene.logo_path
                    )
                if dj_scene.recording_path:
                    dj_scene.recording_path = self.generate_host_path(
                        "DOCKER_RECORDINGS_PATH", "LOCAL_RECORDINGS_PATH", dj_scene.recording_path
                    )
                if dj_scene.visuals_path:
                    recording_visuals_path = self.generate_host_path(
                        "DOCKER_RECORDINGS_PATH", "LOCAL_RECORDINGS_PATH", dj_scene.visuals_path
                    )
                    if os.path.isfile(recording_visuals_path):
                        dj_scene.visuals_path = recording_visuals_path
                    else:
                        dj_scene.visuals_path = self.generate_host_path(
                            "DOCKER_GENERIC_VISUALS_PATH", "LOCAL_GENERIC_VISUALS_PATH", dj_scene.visuals_path
                        )

            dj_scene.vj = dj_entry.get("vj")
            lineup_scenes.append(dj_scene)
        promos = []
        for promo in lineup_data[PROMO_KEY]:
            print(promo)
            if self.host_paths:
                promos.append(self.generate_host_path(
                    "DOCKER_RECORDINGS_PATH", "LOCAL_RECORDINGS_PATH", promo.get("path")
                ))
            else:
                promos.append(promo.get("path"))
        if len(promos) > 0:
            lineup_scenes.append(ObsPromoScene(promos))
        theme_items = []
        if lineup_data.get(THEME_KEY):
            theme_data = lineup_data.get(THEME_KEY)
            print(theme_data)
            # Update overlay offset and scale
            self.target_video_width = theme_data.get("video_width", self.target_video_width)
            self.target_video_height = theme_data.get("video_height", self.target_video_height)
            self.video_offset_x = theme_data.get("video_offset_x", self.video_offset_x)
            self.video_offset_y = theme_data.get("video_offset_y", self.video_offset_y)
            self.chat_width = theme_data.get("chat_width", self.chat_width)
            self.chat_height = theme_data.get("chat_height", self.chat_height)
            self.chat_offset_x = theme_data.get("chat_offset_x", self.chat_offset_x)
            self.chat_offset_y = theme_data.get("chat_offset_y", self.chat_offset_y)

            # Theme scenes
            if (theme_data.get("overlay")):
                print("Overlay Theme")
                overlay_scene = ObsThemeScene(OVERLAY_SCENE, "Overlay", theme_data.get("overlay"))
                if self.host_paths:
                    overlay_scene.path = self.generate_host_path(
                        "DOCKER_THEMES_PATH", "LOCAL_THEMES_PATH", overlay_scene.path
                    )
                theme_items.append(overlay_scene)
            if (theme_data.get("starting")):
                print("Starting Theme")
                starting_scene = ObsThemeScene(STARTING_SCENE, "Starting", theme_data.get("starting"))
                if self.host_paths:
                    starting_scene.path = self.generate_host_path(
                        "DOCKER_THEMES_PATH", "LOCAL_THEMES_PATH", starting_scene.path
                    )
                theme_items.append(starting_scene)
            # Not looking viable through scripting
            # if (theme_data.get("stinger")):
            #     stinger_scene = ObsThemeScene("Stinger", "Stinger", theme_data.get("stinger"))
            #     if self.host_paths:
            #         stinger_scene.path = self.generate_host_path(
            #             "DOCKER_THEMES_PATH", "LOCAL_THEMES_PATH", stinger_scene.path
            #         )
            #     theme_items.append(stinger_scene)
            if (theme_data.get("ending")):
                print("Ending Theme")
                ending_scene = ObsThemeScene(ENDING_SCENE, "Ending", theme_data.get("ending"))
                if self.host_paths:
                    ending_scene.path = self.generate_host_path(
                        "DOCKER_THEMES_PATH", "LOCAL_THEMES_PATH", ending_scene.path
                    )
                lineup_scenes.append(ending_scene)
            else:
                self.ending_scene = S.obs_get_scene_by_name(ENDING_SCENE)
            
            # Prepend theme items
            lineup_scenes = theme_items + lineup_scenes

        return lineup_scenes

    def generate_scenes(self, lineup: list['ObsSceneValue']):
        # Declare shared scenes
        if lineup[0].name == OVERLAY_SCENE:
            self.overlay_scene = S.obs_scene_create(OVERLAY_SCENE)
        else:
            self.overlay_scene = S.obs_get_scene_by_name(OVERLAY_SCENE)
        # Create scenes in OBS
        for scene_values in lineup:
            # generate sources
            if scene_values.type == "DJ":
                scene = S.obs_scene_create(scene_values.name)
                self.setup_dj_scene_items(scene, scene_values)
                S.obs_scene_release(scene)
            elif scene_values.type == "Promos":
                self.promos_scene = S.obs_scene_create(scene_values.name)
                self.setup_promo_scene_items(self.promos_scene, scene_values)
                S.obs_scene_release(scene)
            else:
                self.setup_theme_scene_items(scene_values)
        S.obs_scene_release(self.overlay_scene)
    
    def setup_theme_scene_items(self, scene_values: 'ObsThemeScene'):
        if scene_values.type == "Overlay":
            scene = self.overlay_scene
        else:
            scene = S.obs_scene_create(scene_values.name)
            if (scene_values.name == ENDING_SCENE):
                self.ending_scene = scene
        if ("." + scene_values.path.split(".")[-1]) in IMG_EXTS:
            image_settings = S.obs_data_create()
            S.obs_data_set_string(image_settings, "file", scene_values.path)
            image_source = S.obs_source_create("image_source", scene_values.type, image_settings, None)
            S.obs_scene_add(scene, image_source)
        else:
            json_settings = {
                "local_file": scene_values.path,
                "hw_decode": True,
                "looping": True
            }
            video_settings = S.obs_data_create_from_json(json.dumps(json_settings))
            video_source = S.obs_source_create("ffmpeg_source", scene_values.type, video_settings, None)
            S.obs_scene_add(scene, video_source)
        if scene_values.type == "Overlay":
            if self.path_translation_map.get("OBS_CHAT_URL"):
                json_settings = {
                    "url": self.path_translation_map.get("OBS_CHAT_URL"),
                    "height": self.chat_height,
                    "width": self.chat_width,
                    "css": CHAT_CSS
                }
                chat_settings = S.obs_data_create_from_json(json.dumps(json_settings))
                chat_source = S.obs_source_create("browser_source", "Chat", chat_settings, None)
                chat_item = S.obs_scene_add(scene, chat_source)
                pos = S.vec2()
                # Offset for overlay
                pos.x = self.chat_offset_x
                pos.y = self.chat_offset_y
                print(pos)
                S.obs_sceneitem_set_pos(chat_item, pos)
                S.obs_data_release(chat_settings)
                S.obs_source_release(chat_source)
        else:
            S.obs_scene_release(scene)

    
    def setup_dj_scene_items(self, scene, scene_values: 'ObsDjScene'):
        # Load recording or setup vlc stream
        visuals_source = None
        if scene_values.recording_path:
            if scene_values.visuals_path:
                visuals_source_name = f"{scene_values.name}_visuals"
                visuals_json_settings = {
                    "local_file": scene_values.visuals_path,
                    "hw_decode": True,
                    "looping": True
                }
                visuals_settings = S.obs_data_create_from_json(json.dumps(visuals_json_settings))
                visuals_source = S.obs_source_create("ffmpeg_source", visuals_source_name, visuals_settings, None)
                S.obs_source_set_volume(visuals_source, 0.0)
                
            video_source_name = f"{scene_values.name}_recording"
            json_settings = {
                "local_file": scene_values.recording_path,
                "hw_decode": True
            }
            video_settings = S.obs_data_create_from_json(json.dumps(json_settings))
            video_source = S.obs_source_create("ffmpeg_source", video_source_name, video_settings, None)
        else:
            video_source_name = f"{scene_values.name}_live"
            json_settings = {
                "playlist": [
                    {
                        "hidden": False,
                        "value": scene_values.stream_url
                    }
                ]
            }
            video_settings = S.obs_data_create_from_json(json.dumps(json_settings))
            video_source = S.obs_source_create("vlc_source", video_source_name, video_settings, None)
        
        self.ass_manager.add_dj(
            scene_values.name,
            S.obs_source_get_name(S.obs_scene_get_source(scene)),
            not bool(scene_values.recording_path),
            video_source_name
        )

        video_item = S.obs_scene_add(scene, video_source)
        if visuals_source:
            visuals_item = S.obs_scene_add(scene, visuals_source)

        pos = S.vec2()
        # Offset for overlay
        pos.x = self.video_offset_x
        pos.y = self.video_offset_y
        
        if scene_values.resolution:
            source_width = scene_values.resolution[0]
            source_height = scene_values.resolution[1]
        elif visuals_source:
            source_width = S.obs_source_get_width(visuals_source)
            source_height = S.obs_source_get_height(visuals_source)
        else:
            source_width = S.obs_source_get_width(video_source)
            source_height = S.obs_source_get_height(video_source)

        # Fallback if no frame is rendered
        if source_width == 0 or source_height == 0:
            source_width = RENDER_WIDTH
            source_height = RENDER_HEIGHT
        scale = S.vec2()
        scale.x = self.target_video_width / source_width
        scale.y = self.target_video_height / source_height
        if visuals_source:
            S.obs_sceneitem_set_pos(visuals_item, pos)
            S.obs_sceneitem_set_scale(visuals_item, scale)
            S.obs_data_release(visuals_settings)
            S.obs_source_release(visuals_source)
        else:
            S.obs_sceneitem_set_pos(video_item, pos)
            S.obs_sceneitem_set_scale(video_item, scale)

        S.obs_data_release(video_settings)
        S.obs_source_release(video_source)

        # Insert overlay
        S.obs_scene_add(scene, S.obs_scene_get_source(self.overlay_scene))

        # Load logo
        if scene_values.logo_path:
            logo_source_name = f"{scene_values.name}_logo"
            logo_settings = S.obs_data_create()
            S.obs_data_set_string(logo_settings, "file", scene_values.logo_path)
            logo_source = S.obs_source_create("image_source", logo_source_name, logo_settings, None)
            logo_item = S.obs_scene_add(scene, logo_source)

            # From OBS c obs-defs.h
            align_right = 1 << 1
            align_bottom = 1 << 3

            alignment = align_right | align_bottom
            S.obs_sceneitem_set_alignment(logo_item, alignment)

            pos = S.vec2()
            pos.x = RENDER_WIDTH
            pos.y = RENDER_HEIGHT
            S.obs_sceneitem_set_pos(logo_item, pos)

            S.obs_data_release(logo_settings)
            S.obs_source_release(logo_source)
        else:
            text_source_name = f"{scene_values.name}_text"
            text_settings = S.obs_data_create()
            S.obs_data_set_string(text_settings, "text", scene_values.name)
            font_data_obj = S.obs_data_create_from_json(json.dumps({"face":"Arial","style":"Regular","size":200,"flags":0}))
            S.obs_data_set_obj(text_settings, "font", font_data_obj)
            text_source = S.obs_source_create("text_gdiplus", text_source_name, text_settings, None)
            text_item = S.obs_scene_add(scene, text_source)

            # From OBS c obs-defs.h
            align_right = 1 << 1
            align_bottom = 1 << 3

            alignment = align_right | align_bottom
            S.obs_sceneitem_set_alignment(text_item, alignment)

            pos = S.vec2()
            pos.x = RENDER_WIDTH
            pos.y = RENDER_HEIGHT
            S.obs_sceneitem_set_pos(text_item, pos)

            scale = S.vec2()
            scale.x = 1
            scale.y = 1
            S.obs_sceneitem_set_scale(text_item, scale)

            S.obs_data_release(text_settings)
            S.obs_source_release(text_source)
    
        # Setup VJ
        if scene_values.vj:
            text_source_name = f"{scene_values.name}_vj"
            text_settings = S.obs_data_create()
            S.obs_data_set_string(text_settings, "text", "VJ: " + scene_values.vj)
            font_data_obj = S.obs_data_create_from_json(json.dumps({"face":"Arial","style":"Regular","size":200,"flags":0}))
            S.obs_data_set_obj(text_settings, "font", font_data_obj)
            text_source = S.obs_source_create("text_gdiplus", text_source_name, text_settings, None)
            text_item = S.obs_scene_add(scene, text_source)

            # From OBS c obs-defs.h
            align_right = 1 << 1
            align_bottom = 1 << 3

            alignment = align_right | align_bottom
            S.obs_sceneitem_set_alignment(text_item, alignment)

            pos = S.vec2()
            pos.x = RENDER_WIDTH
            pos.y = RENDER_HEIGHT
            S.obs_sceneitem_set_pos(text_item, pos)

            scale = S.vec2()
            scale.x = 1
            scale.y = 1
            S.obs_sceneitem_set_scale(text_item, scale)

            S.obs_data_release(text_settings)
            S.obs_source_release(text_source)


    def setup_promo_scene_items(self, scene, promotion: 'ObsPromoScene'):
        # Load all promos into a single VLC playlist
        video_source_name = "promo_videos"
        json_settings = {"playlist": [], "loop": False}
        for path in promotion.paths:
            json_settings["playlist"].append({
                "hidden": False,
                "value": path
            })
        promo_settings = S.obs_data_create_from_json(json.dumps(json_settings))
        promo_source = S.obs_source_create("vlc_source", video_source_name, promo_settings, None)
        promo_item = S.obs_scene_add(scene, promo_source)

        pos = S.vec2()
        pos.x = 0
        pos.y = 0
        scale = S.vec2()
        scale.x = 1
        scale.y = 1
        S.obs_sceneitem_set_scale(promo_item, scale)
        S.obs_data_release(promo_settings)
        S.obs_source_release(promo_source)

class ObsSceneValue:
    name = None
    type = None

    def __init__(self, name, type):
        self.name = name
        self.type = type

class ObsDjScene(ObsSceneValue):
    logo_path = None
    recording_path = None
    visuals_path = None
    stream_url = None
    resolution = None
    vj = None

    def __init__(self, name, logo_path):
        self.name = name
        self.logo_path = logo_path
        self.type = "DJ"
    
    def __str__(self) -> str:
        return f"Name: {self.name}, logo: {self.logo_path}, rec: {self.recording_path}, url: {self.stream_url}, vj: {self.vj}"

class ObsPromoScene(ObsSceneValue):
    def __init__(self, paths):
        self.paths = paths
        self.type = "Promos"
        self.name = PROMOS_SCENE

class ObsThemeScene(ObsDjScene):
    path = None

    def __init__(self, name, type, path):
        self.name = name
        self.type = type
        self.path = path

class AdvancedSceneSwitchManager:
    default_action = None
    djs = []

    def __init__(self):
        ass_fp = Path(__file__).absolute().parent.joinpath(ASS_DEFAULT_OBS)
        if not ass_fp.exists():
            raise Exception("Could not find default advanced scene switcher file for macros: " + str(ass_fp))
        
        with open(ass_fp, 'r') as f:
            data = json.load(f)

        self.default_action = data["switch_from_action"]
    
    def add_dj(self, dj_name, scene_name, is_live, video_source) -> None:
        self.djs.append([
            dj_name,
            scene_name,
            is_live,
            video_source
        ])
    
    def generate_objects(self, promos_scene, ending_scene):
        actions = []
        total_actions = len(self.djs)

        for index, dj in enumerate(self.djs):
            print(dj)
            # Skip waiting on media end for live DJs
            if dj[2]:
                continue
            action = deepcopy(self.default_action)
            action["name"] = "switch_from_" + dj[0]
            # Set target scene to switch to
            if index < total_actions - 1:
                action["actions"][0]["sceneSelection"]["name"] = self.djs[index+1][1]
            elif promos_scene:
                action["actions"][0]["sceneSelection"]["name"] = S.obs_source_get_name(S.obs_scene_get_source(promos_scene))
            else:
                action["actions"][0]["sceneSelection"]["name"] = S.obs_source_get_name(S.obs_scene_get_source(ending_scene))
            # Set conditional media to switch on end
            action["conditions"][0]["source"]["name"] = dj[3]
            action["conditions"][1]["sceneSelection"]["name"] = dj[1]
            actions.append(action)
            print(f"Added {dj[0]} pointing to scene {action['actions'][0]['sceneSelection']['name']}")
        
        if promos_scene:
            promos_action = deepcopy(self.default_action)
            promos_action["name"] = "switch_from_promos"
            promos_action["actions"][0]["sceneSelection"]["name"] = S.obs_source_get_name(S.obs_scene_get_source(ending_scene))
            promos_action["conditions"][0]["source"]["name"] = "promo_videos"
            promos_action["conditions"][1]["sceneSelection"]["name"] = S.obs_source_get_name(S.obs_scene_get_source(promos_scene))
            actions.append(promos_action)

        return json.dumps({
            "macros": actions
        })



hijack = Hijack()

# OBS starts
def script_description():
    print("Shizu has infiltrated OBS, setup your config and she'll take care of the lineup")

def update_lineup(props, prop):
    hijack.begin()

def script_update(settings):
    hijack.lineup_path = S.obs_data_get_string(settings, "_lineup_path")
    hijack.host_paths = S.obs_data_get_bool(settings, "_host_bool")
    hijack.generate_macros = S.obs_data_get_bool(settings, "_ass_bool")

def script_properties():  # ui
    props = S.obs_properties_create()
    S.obs_properties_add_path(props, "_lineup_path", "Location of the Event:", S.OBS_PATH_FILE, "*.json", None)
    bool_prop = S.obs_properties_add_bool(props, "_host_bool", "Translate to Host Paths");
    S.obs_property_set_long_description(bool_prop, "Leave unchecked if running in Docker")
    S.obs_properties_add_bool(props, "_ass_bool", "Generate OBS Macros");
    S.obs_properties_add_button(
        props, "button", "Update Event", update_lineup
    )
    return props
