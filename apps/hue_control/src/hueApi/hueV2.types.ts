// https://developers.meethue.com/develop/hue-api-v2/api-reference

export class HueV2ResponseErrorStatusCode extends Error {
  readonly type = "hue_v2_status_code";
  constructor(
    public status: number,
    public errors: HueV2ErrorType[],
  ) {
    super();
  }
}

export class HueV2ResponseErrorNetwork extends Error {
  readonly type = "hue_v2_network";
}

export type HueV2ErrorType = {
  description: string;
};

export type HueV2ResourceType =
  | "device"
  | "bridge_home"
  | "room"
  | "zone"
  | "service_group"
  | "light"
  | "button"
  | "bell_button"
  | "relative_rotary"
  | "temperature"
  | "light_level"
  | "motion"
  | "camera_motion"
  | "entertainment"
  | "contact"
  | "tamper"
  | "convenience_area_motion"
  | "security_area_motion"
  | "speaker"
  | "grouped_light"
  | "grouped_motion"
  | "grouped_light_level"
  | "device_power"
  | "device_software_update"
  | "zigbee_connectivity"
  | "zgp_connectivity"
  | "bridge"
  | "motion_area_candidate"
  | "wifi_connectivity"
  | "zigbee_device_discovery"
  | "homekit"
  | "matter"
  | "matter_fabric"
  | "scene"
  | "entertainment_configuration"
  | "public_image"
  | "auth_v1"
  | "behavior_script"
  | "behavior_instance"
  | "geofence_client"
  | "geolocation"
  | "smart_scene"
  | "motion_area_configuration"
  | "clip";

export type HueV2DeviceParentType = HueV2ResourceType &
  ("room" | "zone" | "bridge_home");

export type HueV2DeviceServiceType = HueV2ResourceType &
  (
    | "light"
    | "button"
    | "bell_button"
    | "relative_rotary"
    | "temperature"
    | "light_level"
    | "motion"
    | "camera_motion"
    | "entertainment"
    | "contact"
    | "tamper"
    | "convenience_area_motion"
    | "security_area_motion"
    | "speaker"
    | "device_power"
    | "device_software_update"
    | "zigbee_connectivity"
    | "zgp_connectivity"
    | "bridge"
    | "motion_area_candidate"
    | "zigbee_device_discovery"
  );

export type HueV2GroupedServiceType = HueV2ResourceType &
  ("grouped_light" | "grouped_motion" | "grouped_light_level");

export type HueV2GenericResource = {
  id: string;
  id_v1?: string;
  type: HueV2ResourceType;
};

export type HueV2GenericDeviceParent = HueV2GenericResource & {
  type: HueV2DeviceParentType;
  children: (HueV2DeviceReference | HueV2RoomReference)[];
  services: HueV2GenericGroupedServiceReference[];
};

export type HueV2GenericDeviceService = HueV2GenericResource & {
  id: string;
  id_v1?: string;
  type: HueV2DeviceServiceType;
  owner: HueV2DeviceReference;
};

export type HueV2GenericResourceReference = {
  rid: string;
  rtype: HueV2ResourceType;
};

export type HueV2GenericDeviceServiceReference =
  HueV2GenericResourceReference & {
    rtype: HueV2DeviceServiceType;
  };

export type HueV2GenericGroupedServiceReference =
  HueV2GenericResourceReference & {
    rtype: HueV2GroupedServiceType;
  };

export type HueV2GenericDeviceParentReference =
  HueV2GenericResourceReference & {
    rtype: HueV2DeviceParentType;
  };

export type HueV2BridgeHomeGet = HueV2GenericDeviceParent & {
  type: "bridge_home";
};

export type HueV2DeviceParentArchetype =
  | "living_room"
  | "kitchen"
  | "dining"
  | "bedroom"
  | "kids_bedroom"
  | "bathroom"
  | "nursery"
  | "recreation"
  | "office"
  | "gym"
  | "hallway"
  | "toilet"
  | "front_door"
  | "garage"
  | "terrace"
  | "garden"
  | "driveway"
  | "carport"
  | "home"
  | "downstairs"
  | "upstairs"
  | "top_floor"
  | "attic"
  | "guest_room"
  | "staircase"
  | "lounge"
  | "man_cave"
  | "computer"
  | "studio"
  | "music"
  | "tv"
  | "reading"
  | "closet"
  | "storage"
  | "laundry_room"
  | "balcony"
  | "porch"
  | "barbecue"
  | "pool"
  | "other";

export type HueV2DeviceParentMetadataGet = {
  name: string;
  archetype: HueV2DeviceParentArchetype;
};

export type HueV2RoomGet = HueV2GenericDeviceParent & {
  type: "room";
  children: HueV2DeviceReference[];
  metadata: HueV2DeviceParentMetadataGet;
};

export type HueV2ZoneGet = HueV2GenericDeviceParent & {
  type: "zone";
  children: HueV2DeviceReference[];
  metadata: HueV2DeviceParentMetadataGet;
};

export type HueV2GroupedLightPut = {
  //unfinished
  on?: { on?: boolean };
  dynamics?: { duration?: number };
};

export type HueV2LightArchetype =
  | "unknown_archetype"
  | "classic_bulb"
  | "sultan_bulb"
  | "flood_bulb"
  | "spot_bulb"
  | "candle_bulb"
  | "luster_bulb"
  | "pendant_round"
  | "pendant_long"
  | "ceiling_round"
  | "ceiling_square"
  | "floor_shade"
  | "floor_lantern"
  | "table_shade"
  | "recessed_ceiling"
  | "recessed_floor"
  | "single_spot"
  | "double_spot"
  | "table_wash"
  | "wall_lantern"
  | "wall_shade"
  | "flexible_lamp"
  | "ground_spot"
  | "wall_spot"
  | "plug"
  | "HueV2_go"
  | "HueV2_lightstrip"
  | "HueV2_iris"
  | "HueV2_bloom"
  | "bollard"
  | "wall_washer"
  | "HueV2_play"
  | "HueV2_chime"
  | "vintage_bulb"
  | "vintage_candle_bulb"
  | "ellipse_bulb"
  | "triangle_bulb"
  | "small_globe_bulb"
  | "large_globe_bulb"
  | "edison_bulb"
  | "christmas_tree"
  | "string_light"
  | "HueV2_centris"
  | "HueV2_lightstrip_tv"
  | "HueV2_lightstrip_pc"
  | "HueV2_tube"
  | "HueV2_signe"
  | "pendant_spot"
  | "ceiling_horizontal"
  | "ceiling_tube"
  | "up_and_down"
  | "up_and_down_up"
  | "up_and_down_down"
  | "HueV2_floodlight_camera"
  | "twilight"
  | "twilight_front"
  | "twilight_back"
  | "HueV2_play_wallwasher"
  | "HueV2_omniglow"
  | "HueV2_neon"
  | "string_globe"
  | "string_permanent";

export type HueV2DeviceArchetype =
  | HueV2LightArchetype
  | "bridge_v2"
  | "bridge_v3";

export type HueV2DeviceProductDataGet = {
  model_id: string;
  manufacturer_name: string;
  product_name: string;
  product_archetype: HueV2DeviceArchetype;
  certified: boolean;
  software_version: string;
  hardware_platform_type?: string;
};

export type HueV2DeviceMetadataGet = {
  name: string;
  archetype: HueV2DeviceArchetype;
};

export type HueV2DeviceUsertestGet = {
  status: "set" | "changing";
  usertest: boolean;
};

export type HueV2DeviceModeGet = any;

export type HueV2DeviceGet = HueV2GenericResource & {
  type: "device";
  services: HueV2DeviceServiceType[];
  product_data: HueV2DeviceProductDataGet;
  metadata: HueV2DeviceMetadataGet;
  usertest?: HueV2DeviceUsertestGet;
  device_mode?: HueV2DeviceModeGet;
};

export type HueV2LightMetadataGet = {
  name: string;
  archetype: HueV2LightArchetype;
  fixed_mired?: number;
  function: HueV2LightFunction;
};

export type HueV2LightMetadataPut = {
  name?: string;
  archetype?: HueV2LightArchetype;
  function?: HueV2LightFunction;
};

export type HueV2LightProductDataGet = {
  name?: string;
  archetype?: HueV2LightArchetype;
  function: HueV2LightFunction;
};

export type HueV2LightOnGet = { on: boolean };
export type HueV2LightOnPut = { on: boolean };

export type HueV2LightFunction =
  | "functional"
  | "decorative"
  | "mixed"
  | "unknown";

export type HueV2LightDimmingPut = {
  brightness: number;
};

export type HueV2LightDimmingGet = {
  brightness: number;
  min_dim_level?: number;
};

export type HueV2LightMirekSchema = {
  mirek_minimum: number;
  mirek_maximum: number;
};

export type HueV2LightColorTempPut = {
  mirek: number | null;
};

export type HueV2LightColorTempGet = {
  mirek: number | null;
  mirek_valid: boolean;
  mirek_schema: HueV2LightMirekSchema;
};

// https://en.wikipedia.org/wiki/CIE_1931_color_space
export type HueV2CieXyPos = {
  x: number;
  y: number;
};

export type HueV2Gamut = {
  red: HueV2CieXyPos;
  green: HueV2CieXyPos;
  blue: HueV2CieXyPos;
};

export type HueV2GamutType = "A" | "B" | "C" | "other";

export type HueV2LightColorPut = {
  xy: HueV2CieXyPos;
};

export type HueV2LightColorGet = {
  xy: HueV2CieXyPos;
  gamut?: HueV2Gamut;
  gamut_type: HueV2GamutType;
};

export type HueV2LightDynamicsGet = any;
export type HueV2LightAlertGet = any;
export type HueV2LightSignalingGet = any;
export type HueV2LightGradientGet = any;
export type HueV2LightContentConfigGet = any;
export type HueV2LightGeometryGet = any;

export type HueV2LightTimedEffectType = "sunrise" | "sunset" | "no_effect";

export type HueV2LightTimedEffectsPut = {
  effect: HueV2LightTimedEffectType;
};
export type HueV2LightTimedEffectsGet = any;

export type HueV2LightModeGet = "normal" | "streaming";

export type HueV2LightEffectType =
  | "prism"
  | "opal"
  | "glisten"
  | "sparkle"
  | "fire"
  | "candle"
  | "underwater"
  | "cosmos"
  | "sunbeam"
  | "enchant"
  | "no_effect";

export type HueV2LightEffectsDeprecatedPut = {
  effect: HueV2LightEffectType;
};

export type HueV2LightEffectsDeprecatedGet = {
  effect: HueV2LightEffectType;
  status_values: HueV2LightEffectType[];
  effect_values: HueV2LightEffectType[];
};

export type HueV2LightEffectsV2ActionParamsGet = {
  color?: HueV2LightColorPut;
  color_temperature?: HueV2LightColorTempPut;
  speed: number;
};

export type HueV2LightEffectsV2ActionParamsPut = {
  color?: HueV2LightColorPut;
  color_temperature?: HueV2LightColorTempPut;
  speed?: number;
};

export type HueV2LightEffectsV2ActionPut = {
  effect: HueV2LightEffectType;
  parameters?: HueV2LightEffectsV2ActionParamsPut;
};

export type HueV2LightEffectsV2ActionGet = {
  effect_values: HueV2LightEffectType[];
};

export type HueV2LightEffectsV2StatusGet = {
  effect: HueV2LightEffectType;
  effect_values: HueV2LightEffectType[];
  parameters?: HueV2LightEffectsV2ActionParamsGet;
};

export type HueV2LightEffectsV2Put = {
  action: HueV2LightEffectsV2ActionPut;
};

export type HueV2LightEffectsV2Get = {
  action: HueV2LightEffectsV2ActionGet;
  status: HueV2LightEffectsV2StatusGet;
};

export type HueV2LightPowerupPreset =
  | "safety"
  | "powerfail"
  | "last_on_state"
  | "custom";

export type HueV2LightPowerupGet = {
  preset: HueV2LightPowerupPreset;
  configured: boolean;
  on: {
    mode: "on" | "toggle" | "previous";
    on?: HueV2LightOnPut;
  };
  dimming?: {
    mode: "dimming" | "previous";
    dimming?: HueV2LightDimmingPut;
  };
  color?: {
    mode: "color_temperature" | "color" | "previous";
    color_temperature?: HueV2LightColorTempPut;
    color?: HueV2LightColorPut;
  };
};

export type HueV2LightPowerupPut = {
  preset: HueV2LightPowerupPreset;
  on?: {
    mode: "on" | "toggle" | "previous";
    on?: HueV2LightOnPut;
  };
  dimming?: {
    mode: "dimming" | "previous";
    dimming?: HueV2LightDimmingPut;
  };
  color?: {
    mode: "color_temperature" | "color" | "previous";
    color_temperature?: HueV2LightColorTempPut;
    color?: HueV2LightColorPut;
  };
};

export type HueV2LightGet = HueV2GenericDeviceService & {
  type: "light";
  metadata: HueV2LightMetadataGet;
  product_data: HueV2LightProductDataGet;
  service_id: number;
  on: HueV2LightOnGet;
  dimming?: HueV2LightDimmingGet;
  color_temperature?: HueV2LightColorTempGet;
  color?: HueV2LightColorGet;
  dynamics?: HueV2LightDynamicsGet;
  alert?: HueV2LightAlertGet;
  signaling?: HueV2LightSignalingGet;
  mode: HueV2LightModeGet;
  // Gradient used in e.g. LED strips
  gradient?: HueV2LightGradientGet;
  // effects is deprecated, use effects_v2
  effects?: HueV2LightEffectsDeprecatedGet;
  effects_v2?: HueV2LightEffectsV2Get;
  timed_effects?: HueV2LightTimedEffectsGet;
  powerup?: HueV2LightPowerupGet;
  content_configuration?: HueV2LightContentConfigGet;
  geometry?: HueV2LightGeometryGet;
};

export type HueV2DeviceIdentifyPut = {
  action: "identify";
  duration?: number;
};

export type HueV2DeltaAction = "up" | "down" | "stop";

export type HueV2LightDimmingDeltaPut = {
  action: HueV2DeltaAction;
  brightness_delta?: number;
};

export type HueV2LightColorTempDeltaPut = {
  action: HueV2DeltaAction;
  mirek_delta?: number;
};

export type HueV2LightDynamicsPut = any;
export type HueV2LightAlertPut = any;
export type HueV2LightSignalingPut = any;
export type HueV2LightGradientPut = any;
export type HueV2LightContentConfigPut = any;
export type HueV2LightGeometryPut = any;

export type HueV2LightPut = {
  metadata?: HueV2LightMetadataPut;
  identify?: HueV2DeviceIdentifyPut;
  on?: HueV2LightOnPut;
  dimming?: HueV2LightDimmingPut;
  dimming_delta?: HueV2LightDimmingDeltaPut;
  color_temperature?: HueV2LightColorTempPut;
  color_temperature_delta?: HueV2LightColorTempDeltaPut;
  color?: HueV2LightColorPut;
  dynamics?: HueV2LightDynamicsPut;
  alert?: HueV2LightAlertPut;
  signaling?: HueV2LightSignalingPut;
  gradient?: HueV2LightGradientPut;
  effects?: HueV2LightEffectsDeprecatedPut;
  effects_v2?: HueV2LightEffectsV2Put;
  timed_effects?: HueV2LightTimedEffectsPut;
  powerup?: HueV2LightPowerupPut;
  content_configuration?: HueV2LightContentConfigPut;
  geometry?: HueV2LightGeometryPut;
};

export type HueV2SceneActionDynamics = {
  duration: number;
};

export type HueV2SceneAction = {
  on?: HueV2LightOnPut;
  dimming?: HueV2LightDimmingPut;
  color?: HueV2LightColorPut;
  color_temperature?: HueV2LightColorTempPut;
  gradient?: HueV2LightGradientPut;
  effects?: HueV2LightEffectsDeprecatedPut;
  effects_v2?: HueV2LightEffectsV2Put;
  dynamics?: HueV2SceneActionDynamics;
};

export type HueV2SceneTargetedAction = {
  target: HueV2LightReference;
  action: HueV2SceneAction;
};

export type HueV2ScenePaletteGet = any;
export type HueV2ScenePalettePut = any;

export type HueV2SceneMetadataPut = {
  name?: string;
  appdata?: string;
};

export type HueV2SceneMetadataGet = {
  name: string;
  appdata: string;
  image: HueV2PublicImageReference;
};

export type HueV2SceneStatusGet = {
  active: "inactive" | "static" | "dynamic_palette";
  last_recall: string;
};

export type HueV2SceneGet = HueV2GenericResource & {
  type: "scene";
  actions: HueV2SceneTargetedAction[];
  palette: HueV2ScenePaletteGet;
  metadata: HueV2SceneMetadataGet;
  group: HueV2GenericDeviceParentReference;
  speed: number;
  auto_dynamic: boolean;
  status: HueV2SceneStatusGet;
};

export type HueV2SceneRecallPut = {
  action?: "active" | "dynamic_palette" | "static";
  duration?: number;
  dimming?: HueV2LightDimmingPut;
};

export type HueV2ScenePut = {
  actions?: HueV2SceneTargetedAction[];
  palette?: HueV2ScenePalettePut;
  metadata?: HueV2SceneMetadataPut;
  speed?: number;
  auto_dynamic?: boolean;
  recall?: HueV2SceneRecallPut;
};

export type HueV2DeviceReference = HueV2GenericResourceReference & {
  rtype: "device";
};
export type HueV2BridgeHomeReference = HueV2GenericResourceReference & {
  rtype: "bridge_home";
};
export type HueV2RoomReference = HueV2GenericResourceReference & {
  rtype: "room";
};
export type HueV2ZoneReference = HueV2GenericResourceReference & {
  rtype: "zone";
};
export type HueV2ServiceGroupReference = HueV2GenericResourceReference & {
  rtype: "service_group";
};
export type HueV2LightReference = HueV2GenericResourceReference & {
  rtype: "light";
};
export type HueV2ButtonReference = HueV2GenericResourceReference & {
  rtype: "button";
};
export type HueV2BellButtonReference = HueV2GenericResourceReference & {
  rtype: "bell_button";
};
export type HueV2RelativeRotaryReference = HueV2GenericResourceReference & {
  rtype: "relative_rotary";
};
export type HueV2TemperatureReference = HueV2GenericResourceReference & {
  rtype: "temperature";
};
export type HueV2LightLevelReference = HueV2GenericResourceReference & {
  rtype: "light_level";
};
export type HueV2MotionReference = HueV2GenericResourceReference & {
  rtype: "motion";
};
export type HueV2CameraMotionReference = HueV2GenericResourceReference & {
  rtype: "camera_motion";
};
export type HueV2EntertainmentReference = HueV2GenericResourceReference & {
  rtype: "entertainment";
};
export type HueV2ContactReference = HueV2GenericResourceReference & {
  rtype: "contact";
};
export type HueV2TamperReference = HueV2GenericResourceReference & {
  rtype: "tamper";
};
export type HueV2ConvenienceAreaMotionReference =
  HueV2GenericResourceReference & {
    rtype: "convenience_area_motion";
  };
export type HueV2SecurityAreaMotionReference = HueV2GenericResourceReference & {
  rtype: "security_area_motion";
};
export type HueV2SpeakerReference = HueV2GenericResourceReference & {
  rtype: "speaker";
};
export type HueV2GroupedLightReference = HueV2GenericResourceReference & {
  rtype: "grouped_light";
};
export type HueV2GroupedMotionReference = HueV2GenericResourceReference & {
  rtype: "grouped_motion";
};
export type HueV2GroupedLightLevelReference = HueV2GenericResourceReference & {
  rtype: "grouped_light_level";
};
export type HueV2DevicePowerReference = HueV2GenericResourceReference & {
  rtype: "device_power";
};
export type HueV2DeviceSoftwareUpdateReference =
  HueV2GenericResourceReference & {
    rtype: "device_software_update";
  };
export type HueV2ZigbeeConnectivityReference = HueV2GenericResourceReference & {
  rtype: "zigbee_connectivity";
};
export type HueV2ZgpConnectivityReference = HueV2GenericResourceReference & {
  rtype: "zgp_connectivity";
};
export type HueV2BridgeReference = HueV2GenericResourceReference & {
  rtype: "bridge";
};
export type HueV2MotionAreaCandidateReference =
  HueV2GenericResourceReference & {
    rtype: "motion_area_candidate";
  };
export type HueV2WifiConnectivityReference = HueV2GenericResourceReference & {
  rtype: "wifi_connectivity";
};
export type HueV2ZigbeeDeviceDiscoveryReference =
  HueV2GenericResourceReference & {
    rtype: "zigbee_device_discovery";
  };
export type HueV2HomekitReference = HueV2GenericResourceReference & {
  rtype: "homekit";
};
export type HueV2MatterReference = HueV2GenericResourceReference & {
  rtype: "matter";
};
export type HueV2MatterFabricReference = HueV2GenericResourceReference & {
  rtype: "matter_fabric";
};
export type HueV2SceneReference = HueV2GenericResourceReference & {
  rtype: "scene";
};
export type HueV2EntertainmentConfigurationReference =
  HueV2GenericResourceReference & {
    rtype: "entertainment_configuration";
  };
export type HueV2PublicImageReference = HueV2GenericResourceReference & {
  rtype: "public_image";
};
export type HueV2AuthV1Reference = HueV2GenericResourceReference & {
  rtype: "auth_v1";
};
export type HueV2BehaviorScriptReference = HueV2GenericResourceReference & {
  rtype: "behavior_script";
};
export type HueV2BehaviorInstanceReference = HueV2GenericResourceReference & {
  rtype: "behavior_instance";
};
export type HueV2GeofenceClientReference = HueV2GenericResourceReference & {
  rtype: "geofence_client";
};
export type HueV2GeolocationReference = HueV2GenericResourceReference & {
  rtype: "geolocation";
};
export type HueV2SmartSceneReference = HueV2GenericResourceReference & {
  rtype: "smart_scene";
};
export type HueV2MotionAreaConfigurationReference =
  HueV2GenericResourceReference & {
    rtype: "motion_area_configuration";
  };
export type HueV2ClipReference = HueV2GenericResourceReference & {
  rtype: "clip";
};
