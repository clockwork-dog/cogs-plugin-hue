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

export type SyncedHueBridgeConnection = {
  type: "authenticated";
  synced: true;
  ipAddress: string;
  bridgeInfo: HueBridgeInfo;
  apiKeys: HueApiKeys;
  syncedData: HueSyncedData;
  lastSync: Date;
};

export type UnsyncedHueBridgeConnection = {
  type: "authenticated";
  synced: false;
  ipAddress: string;
  bridgeInfo: HueBridgeInfo;
  apiKeys: HueApiKeys;
};

export type AuthenticatedHueBridgeConnection =
  | UnsyncedHueBridgeConnection
  | SyncedHueBridgeConnection;

export type UnauthenticatedHueBridgeConnection = {
  type: "connected";
  ipAddress: string;
  bridgeInfo: HueBridgeInfo;
};

export type PotentialHueBridgeConnection = {
  type: "potential";
  ipAddress: string;
};

export type HueBridgeInfo = {
  name: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  modelid: string;
};

export type HueScene = {
  name: string;
  id: string;
  lightgroupId: string;
};

export type HueLight = {
  name: string;
  id: string;
};

export type HueZone = {
  name: string;
  id: string;
  lightgroupId: string;
};

export type HueSyncedData = {
  scenes: HueScene[];
  lights: HueLight[];
  zones: HueZone[];
  bridgeHomeLightgroupId: string;
};
