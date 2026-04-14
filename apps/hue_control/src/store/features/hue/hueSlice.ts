import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HueApiKeys } from "../../../hueApi/hue.types";

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

export interface HueSyncedData {
  scenes: HueScene[];
  lights: HueLight[];
  zones: HueZone[];
  bridgeHomeLightgroupId: string;
}

interface HueSetupPhaseFail {
  type: "fail";
}
interface HueSetupPhaseWaitingForCogs {
  type: "waiting_for_cogs";
}
interface HueSetupPhaseFindingBridgeId {
  type: "finding_bridge_id";
}
interface HueSetupPhaseConnected {
  bridgeId: string;
}
interface HueSetupPhaseAuthenticatingWithBridge extends HueSetupPhaseConnected {
  type: "authenticating_with_bridge";
}
interface HueSetupPhaseAuthenticated extends HueSetupPhaseConnected {
  apiKeys: HueApiKeys;
}
interface HueSetupPhaseAuthenticatedNotSynced extends HueSetupPhaseAuthenticated {
  type: "authenticated_not_synced";
}
interface HueSetupPhaseAuthenticatedSynced extends HueSetupPhaseAuthenticated {
  type: "authenticated_synced";
  lastSynced: number;
  syncedData: HueSyncedData;
}

type HueSetupPhase =
  | HueSetupPhaseFail
  | HueSetupPhaseWaitingForCogs
  | HueSetupPhaseFindingBridgeId
  | HueSetupPhaseAuthenticatingWithBridge
  | HueSetupPhaseAuthenticatedNotSynced
  | HueSetupPhaseAuthenticatedSynced;

export type ResetBehaviour = "None" | "All Off" | "Default Scene";

export interface HueState {
  phase: HueSetupPhase;
  ipAddress: string;
  resetBehaviour: ResetBehaviour;
}

const initialState: HueState = {
  phase: {
    type: "waiting_for_cogs",
  },
  ipAddress: "",
  resetBehaviour: "None",
};

export const hueSlice = createSlice({
  name: "hue",
  initialState,
  reducers: {
    changeIpAddress: (state, action: PayloadAction<string>) => {
      state.ipAddress = action.payload;
      if (state.phase.type !== "waiting_for_cogs") {
        state.phase = { type: "finding_bridge_id" };
      }
    },
    setResetBehaviour: (state, action: PayloadAction<ResetBehaviour>) => {
      state.resetBehaviour = action.payload;
    },
    moveToState: (state, action: PayloadAction<HueSetupPhase>) => {
      state.phase = action.payload;
    },
    setZoneToScene: (_state, _action: PayloadAction<{ command: string }>) => {},
    setZoneOff: (_state, _action: PayloadAction<{ command: string }>) => {},
    setDevice: (
      _state,
      _action: PayloadAction<{ command: string; on: boolean }>,
    ) => {},
    setAllOff: (_state) => {},
  },
});

export const hueActions = hueSlice.actions;

export default hueSlice.reducer;
