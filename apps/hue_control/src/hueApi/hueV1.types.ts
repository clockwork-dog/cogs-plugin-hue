export type HueV1Response<ResponseType> =
  | HueV1ResponseSuccess<ResponseType>
  | HueV1ResponseError;

export type HueV1ResponseSuccess<ResponseType> = {
  result: "success";
  response: ResponseType;
};

export type HueV1ResponseError =
  | HueV1ResponseErrorStatusCode
  | HueV1ResponseErrorBody
  | HueV1ResponseErrorNetwork;

export type HueV1ResponseErrorStatusCode = {
  result: "error";
  error_cause: "status_code";
  status: number;
};

export type HueV1ResponseErrorBody = {
  result: "error";
  error_cause: "body_error";
  errors: HueV1ErrorType[];
};

export type HueV1ResponseErrorNetwork = {
  result: "error";
  error_cause: "network_error";
};

export type HueV1ErrorType = {
  type: number;
  address: string;
  description: string;
};

export type HueV1BridgeConfigUnauthenticated = {
  name: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  modelid: string;
};

export type HueV1AuthBody = {
  devicetype: string;
  generateclientkey?: true;
};

export type HueV1AuthResponse = { success: HueV1AuthKeys }[];

export type HueV1AuthKeys = {
  username: string;
  clientkey: string;
};
