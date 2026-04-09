import { HueV2Response } from "./hueV2.types";

export function getFirst<ResponseType>(
  response: HueV2Response<ResponseType[]>,
): HueV2Response<ResponseType> {
  if (response.result === "success") {
    return { result: "success", response: response.response[0] };
  } else {
    return response;
  }
}
