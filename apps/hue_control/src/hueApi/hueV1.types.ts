export class HueV1ResponseErrorStatusCode extends Error {
  readonly type = "hue_v1_response_error_status_code";
  constructor(public status: number) {
    super();
  }
}

export class HueV1ResponseErrorBody extends Error {
  readonly type = "hue_v1_response_error_body";
  constructor(public errors: HueV1ErrorType[]) {
    super();
  }
}

export class HueV1ResponseErrorNetwork extends Error {
  readonly type = "hue_v1_response_error_network";
}

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
