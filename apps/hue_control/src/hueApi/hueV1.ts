import { HueBridgeConnection } from "../types";
import { GET, HTTPMethod, POST } from "./httpConstants";
import {
  HueV1AuthBody,
  HueV1AuthKeys,
  HueV1AuthResponse,
  HueV1BridgeConfigUnauthenticated,
  HueV1Response,
} from "./hueV1.types";

const AUTH_ENDPOINT = "";
const CONFIG_ENDPOINT = "/config";

export const LINK_BUTTON_NOT_PRESSED = 101;

function apiV1BaseUrl(connection: HueBridgeConnection): string {
  return `https://${connection.ipAddress}/api`;
}

async function apiV1FetchUnauthenticated<BodyType, ResponseType>(
  connection: HueBridgeConnection,
  path: string,
  method: HTTPMethod,
  body?: BodyType,
): Promise<HueV1Response<ResponseType>> {
  try {
    const response = await fetch(apiV1BaseUrl(connection) + path, {
      body: JSON.stringify(body),
      method,
    });
    if (!response.ok) {
      return {
        result: "error",
        error_cause: "status_code",
        status: response.status,
      };
    }
    const response_json = await response.json();
    if (Array.isArray(response_json) && response_json[0].error) {
      return {
        result: "error",
        error_cause: "body_error",
        errors: response_json.map((obj) => obj.error),
      };
    }
    return { result: "success", response: response_json };
  } catch (error) {
    return {
      result: "error",
      error_cause: "network_error",
    };
  }
}

export async function getConfigUnathenticated(
  connection: HueBridgeConnection,
): Promise<HueV1Response<HueV1BridgeConfigUnauthenticated>> {
  return apiV1FetchUnauthenticated(connection, CONFIG_ENDPOINT, GET);
}

export async function postAuthRequest(
  connection: HueBridgeConnection,
  body: HueV1AuthBody,
): Promise<HueV1Response<HueV1AuthKeys>> {
  const response = await apiV1FetchUnauthenticated<
    HueV1AuthBody,
    HueV1AuthResponse
  >(connection, AUTH_ENDPOINT, POST, body);
  if (response.result === "success") {
    return { result: "success", response: response.response[0].success };
  } else {
    return response;
  }
}
