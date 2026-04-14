import { Result } from "typescript-result";
import { GET, HTTPMethod, POST } from "./httpConstants";
import { UnathenticatedHueBridgeConnection } from "./hue.types";
import {
  HueV1AuthBody,
  HueV1AuthResponse,
  HueV1BridgeConfigUnauthenticated,
  HueV1ResponseErrorBody,
  HueV1ResponseErrorNetwork,
  HueV1ResponseErrorStatusCode,
} from "./hueV1.types";

const AUTH_ENDPOINT = "";
const CONFIG_ENDPOINT = "/config";
const TIMEOUT = 5000;

export const LINK_BUTTON_NOT_PRESSED = 101;

function apiV1BaseUrl(connection: UnathenticatedHueBridgeConnection): string {
  return `https://${connection.ipAddress}/api`;
}

function apiV1FetchUnauthenticated<BodyType, ResponseType>(
  connection: UnathenticatedHueBridgeConnection,
  path: string,
  method: HTTPMethod,
  body?: BodyType,
) {
  return Result.try(
    async () =>
      await fetch(apiV1BaseUrl(connection) + path, {
        body: JSON.stringify(body),
        method,
        signal: AbortSignal.timeout(TIMEOUT),
      }),
    () => {
      return new HueV1ResponseErrorNetwork();
    },
  ).map(async (response) => {
    if (!response.ok) {
      return Result.error(new HueV1ResponseErrorStatusCode(response.status));
    }
    const response_json = await response.json();
    if (Array.isArray(response_json) && response_json[0].error) {
      return Result.error(
        new HueV1ResponseErrorBody(response_json.map((obj) => obj.error)),
      );
    }
    return Result.ok<ResponseType>(response_json);
  });
}

export function getConfigUnathenticated(
  connection: UnathenticatedHueBridgeConnection,
) {
  return apiV1FetchUnauthenticated<never, HueV1BridgeConfigUnauthenticated>(
    connection,
    CONFIG_ENDPOINT,
    GET,
  );
}

export function postAuthRequest(
  connection: UnathenticatedHueBridgeConnection,
  body: HueV1AuthBody,
) {
  return apiV1FetchUnauthenticated<HueV1AuthBody, HueV1AuthResponse>(
    connection,
    AUTH_ENDPOINT,
    POST,
    body,
  ).map((val) => val[0].success);
}
