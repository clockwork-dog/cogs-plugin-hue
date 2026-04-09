import {
  AuthenticatedHueBridgeConnection,
  HueBridgeConnection,
} from "../types";
import { GET, HTTPMethod, PUT } from "./httpConstants";
import {
  BRIDGE_HOME_ENDPOINT,
  GROUPED_LIGHT_ENDPOINT,
  LIGHT_ENDPOINT,
  SCENE_ENDPOINT,
  ZONE_ENDPOINT,
} from "./hueV2.endpoints";
import {
  HueV2BridgeHomeGet,
  HueV2GroupedLightPut,
  HueV2GroupedLightReference,
  HueV2LightGet,
  HueV2LightPut,
  HueV2LightReference,
  HueV2Response,
  HueV2SceneGet,
  HueV2ScenePut,
  HueV2SceneReference,
  HueV2ZoneGet,
} from "./hueV2.types";
import { getFirst } from "./hueV2.utils";

const APPLICATION_KEY_HEADER_NAME = "hue-application-key";

function apiBaseUrl(connection: HueBridgeConnection): string {
  return `https://${connection.ipAddress}/clip/v2`;
}

async function apiFetch<BodyType, ResponseType>(
  connection: AuthenticatedHueBridgeConnection,
  path: string,
  method: HTTPMethod,
  body?: BodyType,
): Promise<HueV2Response<ResponseType>> {
  try {
    const response = await fetch(apiBaseUrl(connection) + path, {
      headers: {
        [APPLICATION_KEY_HEADER_NAME]: connection.apiKeys.applicationkey,
      },
      body: JSON.stringify(body),
      method,
    });
    const response_json = await response.json();
    if (!response.ok) {
      return {
        result: "error",
        error_cause: "status_code",
        status: response.status,
        errors: response_json.errors,
      };
    } else {
      if (response_json.errors && response_json.errors.length !== 0) {
        console.warn("Unexpected: Error array was nonempty on OK response");
        console.warn(`Status: ${response.status}`);
        console.warn(response_json);
      }
      return {
        result: "success",
        response: response_json.data,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      result: "error",
      error_cause: "network_error",
    };
  }
}

export async function getScenes(
  connection: AuthenticatedHueBridgeConnection,
): Promise<HueV2Response<HueV2SceneGet[]>> {
  return await apiFetch(connection, SCENE_ENDPOINT, GET);
}

export async function putScene(
  connection: AuthenticatedHueBridgeConnection,
  id: string,
  scene: HueV2ScenePut,
): Promise<HueV2Response<HueV2SceneReference>> {
  return getFirst(
    await apiFetch(connection, `${SCENE_ENDPOINT}/${id}`, PUT, scene),
  );
}

export async function getLights(
  connection: AuthenticatedHueBridgeConnection,
): Promise<HueV2Response<HueV2LightGet[]>> {
  return await apiFetch(connection, LIGHT_ENDPOINT, GET);
}

export async function putLight(
  connection: AuthenticatedHueBridgeConnection,
  id: string,
  light: HueV2LightPut,
): Promise<HueV2Response<HueV2LightReference>> {
  return getFirst(
    await apiFetch(connection, `${LIGHT_ENDPOINT}/${id}`, PUT, light),
  );
}

export async function getZones(
  connection: AuthenticatedHueBridgeConnection,
): Promise<HueV2Response<HueV2ZoneGet[]>> {
  return await apiFetch(connection, ZONE_ENDPOINT, GET);
}

export async function getBridgeHomes(
  connection: AuthenticatedHueBridgeConnection,
): Promise<HueV2Response<HueV2BridgeHomeGet[]>> {
  return await apiFetch(connection, BRIDGE_HOME_ENDPOINT, GET);
}

export async function putGroupedLight(
  connection: AuthenticatedHueBridgeConnection,
  id: string,
  grouped_light: HueV2GroupedLightPut,
): Promise<HueV2Response<HueV2GroupedLightReference>> {
  return getFirst(
    await apiFetch(
      connection,
      `${GROUPED_LIGHT_ENDPOINT}/${id}`,
      PUT,
      grouped_light,
    ),
  );
}
