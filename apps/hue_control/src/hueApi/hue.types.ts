export interface UnathenticatedHueBridgeConnection {
  ipAddress: string;
}

export interface HueBridgeConnection extends UnathenticatedHueBridgeConnection {
  apiKeys: HueApiKeys;
}

export interface HueApiKeys {
  // Note: application keys were previously called usernames in API V1
  applicationkey: string;
  clientkey: string;
}
