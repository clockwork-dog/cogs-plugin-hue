import { HueApiKeys } from "./hueApi/hue.types";

// cogsConnection.store.getItem("apiKeys") : HueApiKeysStore
export type HueApiKeysStore = { [bridgeId: string]: HueApiKeys };

export type HueBridgeInfo = {
  name: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  modelid: string;
};
