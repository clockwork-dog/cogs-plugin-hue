import {
  AuthenticatedHueBridgeConnection,
  HueApiResponse,
  HueBridgeConnection,
} from "../types";

function apiBaseUrl(connection: HueBridgeConnection): string {
  return `https://${connection.ipAddress}/clip/v2`;
}

async function apiFetch<BodyType, ResponseType>(
  connection: AuthenticatedHueBridgeConnection,
  path: string,
  method: string,
  body?: BodyType,
): Promise<HueApiResponse<ResponseType>> {
  try {
    const response = await fetch(apiBaseUrl(connection) + path, {
      headers: { ["hue-application-key"]: connection.apiKeys.applicationkey },
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
