export type HueApiKeys = {
  // Note: application keys were previously called usernames in API V1
  applicationkey: string;
  clientkey: string;
};

export type HueApiKeysStore = { [bridgeId: string]: HueApiKeys };

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
