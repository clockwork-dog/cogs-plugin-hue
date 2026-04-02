import { HueResponse } from "./hueV2.types";

export function getFirst<ResponseType>(
  response: HueResponse<ResponseType[]>,
): HueResponse<ResponseType> {
  if (response.result === "success") {
    return { result: "success", response: response.response[0] };
  } else {
    return response;
  }
}
