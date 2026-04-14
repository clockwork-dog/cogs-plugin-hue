import { Result } from "typescript-result";
import { GET, HTTPMethod, PUT } from "./httpConstants";
import {
  HueBridgeConnection,
  UnathenticatedHueBridgeConnection,
} from "./hue.types";
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
  HueV2ResponseErrorNetwork,
  HueV2ResponseErrorStatusCode,
  HueV2SceneGet,
  HueV2ScenePut,
  HueV2SceneReference,
  HueV2ZoneGet,
} from "./hueV2.types";

const APPLICATION_KEY_HEADER_NAME = "hue-application-key";
const TIMEOUT = 5000;

function apiBaseUrl(connection: UnathenticatedHueBridgeConnection): string {
  return `https://${connection.ipAddress}/clip/v2`;
}

function apiFetch<BodyType, ResponseType>(
  connection: HueBridgeConnection,
  path: string,
  method: HTTPMethod,
  body?: BodyType,
) {
  return Result.try(
    async () =>
      await fetch(apiBaseUrl(connection) + path, {
        headers: {
          [APPLICATION_KEY_HEADER_NAME]: connection.apiKeys.applicationkey,
        },
        body: JSON.stringify(body),
        method,
        signal: AbortSignal.timeout(TIMEOUT),
      }),
    (error) => {
      console.error(error);
      return new HueV2ResponseErrorNetwork();
    },
  ).map(async (response) => {
    const response_json = await response.json();
    if (!response.ok) {
      return Result.error(
        new HueV2ResponseErrorStatusCode(response.status, response_json.errors),
      );
    } else {
      if (response_json.errors && response_json.errors.length !== 0) {
        console.warn("Unexpected: Error array was nonempty on OK response");
        console.warn(`Status: ${response.status}`);
        console.warn(response_json);
      }
      return Result.ok<ResponseType>(response_json.data);
    }
  });
}

export function getScenes(connection: HueBridgeConnection) {
  return apiFetch<never, HueV2SceneGet[]>(connection, SCENE_ENDPOINT, GET);
}

export function putScene(
  connection: HueBridgeConnection,
  id: string,
  scene: HueV2ScenePut,
) {
  return apiFetch<HueV2ScenePut, HueV2SceneReference[]>(
    connection,
    `${SCENE_ENDPOINT}/${id}`,
    PUT,
    scene,
  ).map((val) => val[0]);
}

export function getLights(connection: HueBridgeConnection) {
  return apiFetch<never, HueV2LightGet[]>(connection, LIGHT_ENDPOINT, GET);
}

export function putLight(
  connection: HueBridgeConnection,
  id: string,
  light: HueV2LightPut,
) {
  apiFetch<HueV2LightPut, HueV2LightReference[]>(
    connection,
    `${LIGHT_ENDPOINT}/${id}`,
    PUT,
    light,
  ).map((val) => val[0]);
}

export function getZones(connection: HueBridgeConnection) {
  return apiFetch<never, HueV2ZoneGet[]>(connection, ZONE_ENDPOINT, GET);
}

export function getBridgeHomes(connection: HueBridgeConnection) {
  return apiFetch<never, HueV2BridgeHomeGet[]>(
    connection,
    BRIDGE_HOME_ENDPOINT,
    GET,
  );
}

export function putGroupedLight(
  connection: HueBridgeConnection,
  id: string,
  grouped_light: HueV2GroupedLightPut,
) {
  return apiFetch<HueV2GroupedLightPut, HueV2GroupedLightReference[]>(
    connection,
    `${GROUPED_LIGHT_ENDPOINT}/${id}`,
    PUT,
    grouped_light,
  ).map((val) => val[0]);
}
