export type HueScenes = { [sceneId: string]: HueScene };

export interface HueScene {
  name: string;
}

export type HueApiKeys = {
  // Note: application keys were previously called usernames in API V1
  applicationkey: string;
  clientkey: string;
};

export type HueApiKeysStore = { [bridgeId: string]: HueApiKeys };

export type HueApiResponse<ResponseType> =
  | HueApiResponseSuccess<ResponseType>
  | HueApiResponseError;

export type HueApiResponseSuccess<ResponseType> = {
  result: "success";
  response: ResponseType[];
};

export type HueApiResponseError =
  | HueApiResponseErrorStatusCode
  | HueApiResponseErrorNetwork;

export type HueApiResponseErrorStatusCode = {
  result: "error";
  error_cause: "status_code";
  status: number;
  errors: HueApiErrorType[];
};

export type HueApiResponseErrorNetwork = {
  result: "error";
  error_cause: "network_error";
};

export type HueApiErrorType = {
  description: string;
};

export type HueApiV1Response<ResponseType> =
  | HueApiV1ResponseSuccess<ResponseType>
  | HueApiV1ResponseError;

export type HueApiV1ResponseSuccess<ResponseType> = {
  result: "success";
  response: ResponseType;
};

export type HueApiV1ResponseError =
  | HueApiV1ResponseErrorStatusCode
  | HueApiV1ResponseErrorBody
  | HueApiV1ResponseErrorNetwork;

export type HueApiV1ResponseErrorStatusCode = {
  result: "error";
  error_cause: "status_code";
  status: number;
};

export type HueApiV1ResponseErrorBody = {
  result: "error";
  error_cause: "body_error";
  errors: HueApiV1ErrorType[];
};

export type HueApiV1ResponseErrorNetwork = {
  result: "error";
  error_cause: "network_error";
};

export type HueApiV1ErrorType = {
  type: number;
  address: string;
  description: string;
};

export type HueBridgeConnection =
  | PotentialHueBridgeConnection
  | UnauthenticatedHueBridgeConnection
  | AuthenticatedHueBridgeConnection;

export type PotentialHueBridgeConnection = {
  type: "potential";
  ipAddress: string;
};

export type AuthenticatedHueBridgeConnection = {
  type: "authenticated";
  ipAddress: string;
  bridgeInfo: HueBridgeInfo;
  apiKeys: HueApiKeys;
};

export type UnauthenticatedHueBridgeConnection = {
  type: "connected";
  ipAddress: string;
  bridgeInfo: HueBridgeInfo;
};

export type HueBridgeInfo = {
  name: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  modelid: string;
};

export type HueApiV1BridgeConfigUnauthenticated = {
  name: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  modelid: string;
};

export type HueApiV1AuthBody = {
  devicetype: string;
  generateclientkey?: true;
};

export type HueApiV1AuthResponse = { success: HueApiV1AuthKeys }[];

export type HueApiV1AuthKeys = {
  username: string;
  clientkey: string;
};
