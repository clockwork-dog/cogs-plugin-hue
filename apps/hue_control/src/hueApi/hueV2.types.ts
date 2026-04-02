// https://developers.meethue.com/develop/hue-api-v2/api-reference
export type HueResponse<ResponseType> =
  | HueResponseSuccess<ResponseType>
  | HueResponseError;

export type HueResponseSuccess<ResponseType> = {
  result: "success";
  response: ResponseType;
};

export type HueResponseError =
  | HueResponseErrorStatusCode
  | HueResponseErrorNetwork;

export type HueResponseErrorStatusCode = {
  result: "error";
  error_cause: "status_code";
  status: number;
  errors: HueErrorType[];
};

export type HueResponseErrorNetwork = {
  result: "error";
  error_cause: "network_error";
};

export type HueErrorType = {
  description: string;
};

export type HueResourceType =
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

export type HueDeviceParentType = HueResourceType &
  ("room" | "zone" | "bridge_home");

export type HueDeviceServiceType = HueResourceType &
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

export type HueGroupedServiceType = HueResourceType &
  ("grouped_light" | "grouped_motion" | "grouped_light_level");

export type HueGenericResource = {
  id: string;
  id_v1?: string;
  type: HueResourceType;
};

export type HueGenericDeviceParent = HueGenericResource & {
  type: HueDeviceParentType;
  children: (HueDeviceReference | HueRoomReference)[];
  services: HueGenericGroupedServiceReference[];
};

export type HueGenericDeviceService = HueGenericResource & {
  id: string;
  id_v1?: string;
  type: HueDeviceServiceType;
  owner: HueDeviceReference;
};

export type HueGenericResourceReference = {
  rid: string;
  rtype: HueResourceType;
};

export type HueGenericDeviceServiceReference = HueGenericResourceReference & {
  rtype: HueDeviceServiceType;
};

export type HueGenericGroupedServiceReference = HueGenericResourceReference & {
  rtype: HueGroupedServiceType;
};

export type HueGenericDeviceParentReference = HueGenericResourceReference & {
  rtype: HueDeviceParentType;
};

export type HueBridgeHome = HueGenericDeviceParent & {
  type: "bridge_home";
};

export type HueDeviceParentArchetype =
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

export type HueDeviceParentMetadata = {
  name: string;
  archetype: HueDeviceParentArchetype;
};

export type HueRoom = HueGenericDeviceParent & {
  type: "room";
  children: HueDeviceReference[];
  metadata: HueDeviceParentMetadata;
};

export type HueZone = HueGenericDeviceParent & {
  type: "zone";
  children: HueDeviceReference[];
  metadata: HueDeviceParentMetadata;
};

export type HueLightArchetype =
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
  | "hue_go"
  | "hue_lightstrip"
  | "hue_iris"
  | "hue_bloom"
  | "bollard"
  | "wall_washer"
  | "hue_play"
  | "hue_chime"
  | "vintage_bulb"
  | "vintage_candle_bulb"
  | "ellipse_bulb"
  | "triangle_bulb"
  | "small_globe_bulb"
  | "large_globe_bulb"
  | "edison_bulb"
  | "christmas_tree"
  | "string_light"
  | "hue_centris"
  | "hue_lightstrip_tv"
  | "hue_lightstrip_pc"
  | "hue_tube"
  | "hue_signe"
  | "pendant_spot"
  | "ceiling_horizontal"
  | "ceiling_tube"
  | "up_and_down"
  | "up_and_down_up"
  | "up_and_down_down"
  | "hue_floodlight_camera"
  | "twilight"
  | "twilight_front"
  | "twilight_back"
  | "hue_play_wallwasher"
  | "hue_omniglow"
  | "hue_neon"
  | "string_globe"
  | "string_permanent";

export type HueDeviceArchetype = HueLightArchetype | "bridge_v2" | "bridge_v3";

export type HueDeviceProductData = {
  model_id: string;
  manufacturer_name: string;
  product_name: string;
  product_archetype: HueDeviceArchetype;
  certified: boolean;
  software_version: string;
  hardware_platform_type?: string;
};

export type HueDeviceMetadata = {
  name: string;
  archetype: HueDeviceArchetype;
};

export type HueDeviceUsertest = {
  status: "set" | "changing";
  usertest: boolean;
};

export type HueDeviceMode = any;

export type HueDevice = HueGenericResource & {
  type: "device";
  services: HueDeviceServiceType[];
  product_data: HueDeviceProductData;
  metadata: HueDeviceMetadata;
  usertest?: HueDeviceUsertest;
  device_mode?: HueDeviceMode;
};

export type HueLightMetadata = {
  name: string;
  archetype: HueLightArchetype;
  fixed_mired?: number;
  function: HueLightFunction;
};

export type HueLightProductData = {
  name?: string;
  archetype?: HueLightArchetype;
  function: HueLightFunction;
};

export type HueLightOn = { on: boolean };

export type HueLightFunction =
  | "functional"
  | "decorative"
  | "mixed"
  | "unknown";

export type HueLightDimming = {
  brightness: number;
};

export type HueLightDimmingExtended = HueLightDimming & {
  min_dim_level?: number;
};

export type HueLightMirekSchema = {
  mirek_minimum: number;
  mirek_maximum: number;
};

export type HueLightColorTemp = {
  mirek: number | null;
};

export type HueLightColorTempExtended = HueLightColorTemp & {
  mirek_valid: boolean;
  mirek_schema: HueLightMirekSchema;
};

// https://en.wikipedia.org/wiki/CIE_1931_color_space
export type HueCieXyPos = {
  x: number;
  y: number;
};

export type HueGamut = {
  red: HueCieXyPos;
  green: HueCieXyPos;
  blue: HueCieXyPos;
};

export type HueGamutType = "A" | "B" | "C" | "other";

export type HueLightColor = {
  xy: HueCieXyPos;
};

export type HueLightColorExtended = HueLightColor & {
  gamut?: HueGamut;
  gamut_type: HueGamutType;
};

export type HueLightDynamics = any;
export type HueLightAlert = any;
export type HueLightSignaling = any;
export type HueLightGradient = any;
export type HueLightGradientExtended = any;
export type HueLightTimedEffects = any;
export type HueLightContentConfig = any;
export type HueLightGeometry = any;

export type HueLightMode = "normal" | "streaming";

export type HueLightDynamicsDuration = { duration?: number };

export type HueLightEffectType =
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

export type HueLightEffects = {
  effect: HueLightEffectType;
};

export type HueLightEffectsExtended = HueLightEffects & {
  status_values: HueLightEffectType[];
  effect_values: HueLightEffectType[];
};

export type HueLightEffectsV2ActionParams = {
  color?: HueLightColor;
  color_temperature?: HueLightColorTemp;
  speed?: number;
};

export type HueLightEffectsV2Action = {
  effect: HueLightEffectType;
  parameters?: HueLightEffectsV2ActionParams;
};

export type HueLightEffectsV2Status = {
  effect: HueLightEffectType;
  effect_values: HueLightEffectType[];
  parameters?: HueLightEffectsV2ActionParams & { speed: number };
};

export type HueLightEffectsV2 = {
  action: HueLightEffectsV2Action;
};

export type HueLightEffectsV2Extended = {
  action: {
    effect_values: HueLightEffectType[];
  };
  status: HueLightEffectsV2Status;
};

export type HueLightPowerupPreset =
  | "safety"
  | "powerfail"
  | "last_on_state"
  | "custom";

export type HueLightPowerup = {
  preset: HueLightPowerupPreset;
  configured: boolean;
  on: {
    mode: "on" | "toggle" | "previous";
    on?: boolean;
  };
  dimming?: {
    mode: "dimming" | "previous";
    dimming?: HueLightDimming;
  };
  color?: {
    mode: "color_temperature" | "color" | "previous";
    color_temperature?: HueLightColorTemp;
    color?: HueLightColor;
  };
};

export type HueLight = HueGenericDeviceService & {
  type: "light";
  metadata: HueLightMetadata;
  product_data: HueLightProductData;
  service_id: number;
  on: HueLightOn;
  dimming?: HueLightDimmingExtended;
  color_temperature?: HueLightColorTempExtended;
  color?: HueLightColorExtended;
  dynamics?: HueLightDynamics;
  alert?: HueLightAlert;
  signaling?: HueLightSignaling;
  mode: HueLightMode;
  // Gradient used in e.g. LED strips
  gradient?: HueLightGradientExtended;
  // effects is deprecated, use effects_v2
  effects?: HueLightEffectsExtended;
  effects_v2?: HueLightEffectsV2Extended;
  timed_effects?: HueLightTimedEffects;
  powerup?: HueLightPowerup;
  content_configuration?: HueLightContentConfig;
  geometry?: HueLightGeometry;
};

export type HueSceneAction = {
  on?: HueLightOn;
  dimming?: HueLightDimming;
  color?: HueLightColor;
  color_temperature?: HueLightColorTemp;
  gradient?: HueLightGradient;
  effects?: HueLightEffects;
  effects_v2?: HueLightEffectsV2;
  dynamics?: HueLightDynamicsDuration;
};

export type HueSceneTargetedAction = {
  target: HueLightReference;
  action: HueSceneAction;
};

export type HueScenePalette = any;

export type HueSceneMetadata = {
  name: string;
  appdata: string;
};

export type HueSceneMetadataExtended = HueSceneMetadata & {
  image: HuePublicImageReference;
};

export type HueSceneStatus = {
  active: "inactive" | "static" | "dynamic_palette";
  last_recall: string;
};

export type HueScene = HueGenericResource & {
  type: "scene";
  actions: HueSceneTargetedAction[];
  palette: HueScenePalette;
  metadata: HueSceneMetadataExtended;
  group: HueGenericGroupedServiceReference;
  speed: number;
  auto_dynamic: boolean;
  status: HueSceneStatus;
};

export type HueSceneRecall = {
  action?: "active" | "dynamic_palette" | "static";
  duration?: number;
  dimming?: HueLightDimming;
};

export type HueScenePut = {
  actions?: HueSceneTargetedAction[];
  palette?: HueScenePalette;
  metadata?: HueSceneMetadata;
  speed?: number;
  auto_dynamic?: boolean;
  recall?: HueSceneRecall;
};

// Unimplemented
export type HueButton = HueGenericDeviceService & { type: "button" };
// Unimplemented
export type HueBellButton = HueGenericDeviceService & { type: "bell_button" };
// Unimplemented
export type HueRelativeRotary = HueGenericDeviceService & {
  type: "relative_rotary";
};
// Unimplemented
export type HueTemperature = HueGenericDeviceService & { type: "temperature" };
// Unimplemented
export type HueLightLevel = HueGenericDeviceService & { type: "light_level" };
// Unimplemented
export type HueMotion = HueGenericDeviceService & { type: "motion" };
// Unimplemented
export type HueCameraMotion = HueGenericDeviceService & {
  type: "camera_motion";
};
// Unimplemented
export type HueEntertainment = HueGenericDeviceService & {
  type: "entertainment";
};
// Unimplemented
export type HueContact = HueGenericDeviceService & { type: "contact" };
// Unimplemented
export type HueTamper = HueGenericDeviceService & { type: "tamper" };
// Unimplemented
export type HueConvenienceAreaMotion = HueGenericDeviceService & {
  type: "convenience_area_motion";
};
// Unimplemented
export type HueSecurityAreaMotion = HueGenericDeviceService & {
  type: "security_area_motion";
};
// Unimplemented
export type HueSpeaker = HueGenericDeviceService & { type: "speaker" };
// Unimplemented
export type HueDevicePower = HueGenericDeviceService & { type: "device_power" };
// Unimplemented
export type HueDeviceSoftwareUpdate = HueGenericDeviceService & {
  type: "device_software_update";
};
// Unimplemented
export type HueZigbeeConnectivity = HueGenericDeviceService & {
  type: "zigbee_connectivity";
};
// Unimplemented
export type HueZgpConnectivity = HueGenericDeviceService & {
  type: "zgp_connectivity";
};
// Unimplemented
export type HueBridge = HueGenericDeviceService & { type: "bridge" };
// Unimplemented
export type HueMotionAreaCandidate = HueGenericDeviceService & {
  type: "motion_area_candidate";
};
// Unimplemented
export type HueZigbeeDeviceDiscovery = HueGenericDeviceService & {
  type: "zigbee_device_discovery";
};

export type HueDeviceReference = HueGenericResourceReference & {
  rtype: "device";
};
export type HueBridgeHomeReference = HueGenericResourceReference & {
  rtype: "bridge_home";
};
export type HueRoomReference = HueGenericResourceReference & {
  rtype: "room";
};
export type HueZoneReference = HueGenericResourceReference & {
  rtype: "zone";
};
export type HueServiceGroupReference = HueGenericResourceReference & {
  rtype: "service_group";
};
export type HueLightReference = HueGenericResourceReference & {
  rtype: "light";
};
export type HueButtonReference = HueGenericResourceReference & {
  rtype: "button";
};
export type HueBellButtonReference = HueGenericResourceReference & {
  rtype: "bell_button";
};
export type HueRelativeRotaryReference = HueGenericResourceReference & {
  rtype: "relative_rotary";
};
export type HueTemperatureReference = HueGenericResourceReference & {
  rtype: "temperature";
};
export type HueLightLevelReference = HueGenericResourceReference & {
  rtype: "light_level";
};
export type HueMotionReference = HueGenericResourceReference & {
  rtype: "motion";
};
export type HueCameraMotionReference = HueGenericResourceReference & {
  rtype: "camera_motion";
};
export type HueEntertainmentReference = HueGenericResourceReference & {
  rtype: "entertainment";
};
export type HueContactReference = HueGenericResourceReference & {
  rtype: "contact";
};
export type HueTamperReference = HueGenericResourceReference & {
  rtype: "tamper";
};
export type HueConvenienceAreaMotionReference = HueGenericResourceReference & {
  rtype: "convenience_area_motion";
};
export type HueSecurityAreaMotionReference = HueGenericResourceReference & {
  rtype: "security_area_motion";
};
export type HueSpeakerReference = HueGenericResourceReference & {
  rtype: "speaker";
};
export type HueGroupedLightReference = HueGenericResourceReference & {
  rtype: "grouped_light";
};
export type HueGroupedMotionReference = HueGenericResourceReference & {
  rtype: "grouped_motion";
};
export type HueGroupedLightLevelReference = HueGenericResourceReference & {
  rtype: "grouped_light_level";
};
export type HueDevicePowerReference = HueGenericResourceReference & {
  rtype: "device_power";
};
export type HueDeviceSoftwareUpdateReference = HueGenericResourceReference & {
  rtype: "device_software_update";
};
export type HueZigbeeConnectivityReference = HueGenericResourceReference & {
  rtype: "zigbee_connectivity";
};
export type HueZgpConnectivityReference = HueGenericResourceReference & {
  rtype: "zgp_connectivity";
};
export type HueBridgeReference = HueGenericResourceReference & {
  rtype: "bridge";
};
export type HueMotionAreaCandidateReference = HueGenericResourceReference & {
  rtype: "motion_area_candidate";
};
export type HueWifiConnectivityReference = HueGenericResourceReference & {
  rtype: "wifi_connectivity";
};
export type HueZigbeeDeviceDiscoveryReference = HueGenericResourceReference & {
  rtype: "zigbee_device_discovery";
};
export type HueHomekitReference = HueGenericResourceReference & {
  rtype: "homekit";
};
export type HueMatterReference = HueGenericResourceReference & {
  rtype: "matter";
};
export type HueMatterFabricReference = HueGenericResourceReference & {
  rtype: "matter_fabric";
};
export type HueSceneReference = HueGenericResourceReference & {
  rtype: "scene";
};
export type HueEntertainmentConfigurationReference =
  HueGenericResourceReference & {
    rtype: "entertainment_configuration";
  };
export type HuePublicImageReference = HueGenericResourceReference & {
  rtype: "public_image";
};
export type HueAuthV1Reference = HueGenericResourceReference & {
  rtype: "auth_v1";
};
export type HueBehaviorScriptReference = HueGenericResourceReference & {
  rtype: "behavior_script";
};
export type HueBehaviorInstanceReference = HueGenericResourceReference & {
  rtype: "behavior_instance";
};
export type HueGeofenceClientReference = HueGenericResourceReference & {
  rtype: "geofence_client";
};
export type HueGeolocationReference = HueGenericResourceReference & {
  rtype: "geolocation";
};
export type HueSmartSceneReference = HueGenericResourceReference & {
  rtype: "smart_scene";
};
export type HueMotionAreaConfigurationReference =
  HueGenericResourceReference & {
    rtype: "motion_area_configuration";
  };
export type HueClipReference = HueGenericResourceReference & {
  rtype: "clip";
};
