import {
  AuthenticatedHueBridgeConnection,
  HueBridgeConnection,
} from "../types";
import { GET, HTTPMethod, PUT } from "./httpConstants";
import { SCENE_ENDPOINT } from "./hueV2.endpoints";
import { HueResponse, HueScene, HueScenePut } from "./hueV2.types";
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
): Promise<HueResponse<ResponseType>> {
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
        console.log(response_json);
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
): Promise<HueResponse<HueScene[]>> {
  return await apiFetch(connection, SCENE_ENDPOINT, GET);
}

export async function getScene(
  connection: AuthenticatedHueBridgeConnection,
  id: string,
): Promise<HueResponse<HueScene>> {
  return getFirst(await apiFetch(connection, SCENE_ENDPOINT + `/${id}`, GET));
}

export async function putScene(
  connection: AuthenticatedHueBridgeConnection,
  id: string,
  scene: HueScenePut,
): Promise<HueResponse<HueScene>> {
  return getFirst(
    await apiFetch(connection, SCENE_ENDPOINT + `/${id}`, PUT, scene),
  );
}
