# OBS script to import a JSON lineup
# Provided as is, use at your own risk.
# Contact linkcube @ Anison Hijack for assistance.

import obspython as S
import json
import os


DJ_KEY = "djs"
PROMO_KEY = "promos"
TARGET_VIDEO_WIDTH = 1530
TARGET_VIDEO_HEIGHT = 857
OVERLAY_OFFSET_X = 20
OVERLAY_OFFSET_Y = 20

OVERLAY_SCENE = "# - Overlay"
STARTING_SCENE = "! - Starting"
ENDING_SCENE = "! - Ending"
PROMOS_SCENE = "promos"

class ObsSceneValue:
    name = None
    is_dj = False
    logo_path = None
    recording_path = None
    stream_url = None
    resolution = None
    vj = None

    def __init__(self, name, is_dj, logo_path, recording_path, stream_url, resolution):
        self.name = name
        self.is_dj = is_dj
        self.logo_path = logo_path
        self.recording_path = recording_path
        self.stream_url = stream_url
        self.resolution = resolution
    
    def __str__(self) -> str:
        return f"Name: {self.name}, is_dj: {self.is_dj}, logo: {self.logo_path}, rec: {self.recording_path}, url: {self.stream_url}, vj: {self.vj}"

class ObsPromoScene(ObsSceneValue):
    def __init__(self, paths):
        self.paths = paths
        self.is_dj = False
        self.name = "Promotional Videos"

class Hijack:
    lineup_path = None
    render_width = 1920
    render_height = 1080
    overlay_scene = None

    def begin(self):        
        if self.lineup_path:
            lineup_data = self.validate_json_file(self.lineup_path)
        else:
            raise Exception("No lineup submitted")
        
        print("Retreived lineup data, processing..")

        lineup = self.init_lineup_data(lineup_data)

        print("Data processed! Beginning scene generation..")

        self.generate_scenes(lineup)

        print(f"Generation is done! {len(lineup)} scenes created.")
    
    def validate_json_file(self, path):
        # Validate file exists, and load JSON data
        if not os.path.exists(path):
            raise Exception("Supplied file does not exist at: " + path)
        with open(path, 'r') as f:
            data = json.load(f)
        return data
    
    def init_lineup_data(self, lineup_data):
        # Initialize djs->promos scenes in memory
        lineup_scenes = []
        for dj_entry in lineup_data[DJ_KEY]:
            print(dj_entry)
            dj_scene = ObsSceneValue(
                dj_entry.get("name"),
                True,
                dj_entry.get("logo_path"),
                None,
                None,
                dj_entry.get("resolution")
            )
            if dj_entry.get("url"):
                dj_scene.stream_url = dj_entry.get("url")
            else:
                dj_scene.recording_path = dj_entry.get("recording_path")
            dj_scene.vj = dj_entry.get("vj")
            lineup_scenes.append(dj_scene)
        promos = []
        for promo in lineup_data[PROMO_KEY]:
            promos.append(promo.get("path"))
        lineup_scenes.append(ObsPromoScene(promos))

        return lineup_scenes

    def generate_scenes(self, lineup: list['ObsSceneValue']):
        # Fetch static information
        self.overlay_scene = S.obs_get_scene_by_name(OVERLAY_SCENE)
        # Create scenes in OBS
        for scene_values in lineup:
            scene = S.obs_scene_create(scene_values.name)
            # generate sources
            if scene_values.is_dj:
                self.setup_dj_scene_items(scene, scene_values)
            else:
                self.setup_promo_scene_items(scene, scene_values)

            S.obs_scene_release(scene)
        S.obs_scene_release(self.overlay_scene)
    
    def setup_dj_scene_items(self, scene, scene_values: 'ObsSceneValue'):
        # Load recording or setup vlc stream
        if scene_values.recording_path:
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

        video_item = S.obs_scene_add(scene, video_source)

        pos = S.vec2()
        # Offset for overlay
        pos.x = OVERLAY_OFFSET_X
        pos.y = OVERLAY_OFFSET_Y
        S.obs_sceneitem_set_pos(video_item, pos)
        source_width = S.obs_source_get_width(video_source)
        source_height = S.obs_source_get_height(video_source)
        if scene_values.resolution:
            source_width = scene_values.resolution[0]
            source_height = scene_values.resolution[1]

        # Fallback if no frame is rendered
        if source_width == 0 or source_height == 0:
            source_width = 1920
            source_height = 1080
        scale = S.vec2()
        scale.x = TARGET_VIDEO_WIDTH / source_width
        scale.y = TARGET_VIDEO_HEIGHT / source_height
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
            pos.x = self.render_width
            pos.y = self.render_height
            S.obs_sceneitem_set_pos(logo_item, pos)

            S.obs_data_release(logo_settings)
            S.obs_source_release(logo_source)
        else:
            text_source_name = f"{scene_values.name}_text"
            text_settings = S.obs_data_create()
            S.obs_data_set_string(text_settings, "text", scene_values.name)
            font_data_obj = S.obs_data_create_from_json(json.dumps({"face":"Arial","style":"Regular","size":200,"flags":0}))
            S.obs_data_set_obj(text_settings, "font", font_data_obj)
            text_source = S.obs_source_create("text_ft2_source_v2", text_source_name, text_settings, None)
            text_item = S.obs_scene_add(scene, text_source)

            # From OBS c obs-defs.h
            align_right = 1 << 1
            align_bottom = 1 << 3

            alignment = align_right | align_bottom
            S.obs_sceneitem_set_alignment(text_item, alignment)

            pos = S.vec2()
            pos.x = self.render_width
            pos.y = self.render_height
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
            text_source = S.obs_source_create("text_ft2_source_v2", text_source_name, text_settings, None)
            text_item = S.obs_scene_add(scene, text_source)

            # From OBS c obs-defs.h
            align_right = 1 << 1
            align_bottom = 1 << 3

            alignment = align_right | align_bottom
            S.obs_sceneitem_set_alignment(text_item, alignment)

            pos = S.vec2()
            pos.x = self.render_width
            pos.y = self.render_height
            S.obs_sceneitem_set_pos(text_item, pos)

            scale = S.vec2()
            scale.x = 1
            scale.y = 1
            S.obs_sceneitem_set_scale(text_item, scale)

            S.obs_data_release(text_settings)
            S.obs_source_release(text_source)


    def setup_promo_scene_items(self, scene, promotion: 'ObsPromoScene'):
        # Load all promos into a single VLC playlist
        video_source_name = f"promo_videos"
        json_settings = {"playlist": []}
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


hijack = Hijack()

# OBS starts
def script_description():
    print("Shizu has infiltrated OBS, setup your config and she'll take care of the lineup")

def update_lineup(props, prop):
    hijack.begin()

def script_update(settings):
    hijack.lineup_path = S.obs_data_get_string(settings, "_lineup_path")

def script_properties():  # ui
    props = S.obs_properties_create()
    S.obs_properties_add_path(props, "_lineup_path", "Location of the Lineup:", S.OBS_PATH_FILE, "*.json", None)
    S.obs_properties_add_button(
        props, "button", "Update Lineup", update_lineup
    )
    return props
