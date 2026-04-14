import { Middleware } from "@reduxjs/toolkit";
import { TypedCogsConnection } from "../../hooks/useTypedCogsConnection";
import { HueApiKeysStore } from "../../types";
import { hueActions } from "../features/hue/hueSlice";
import { loggingActions } from "../features/logging/loggingSlice";
import { AppMiddlewareAPI } from "../store";

export const createCogsMiddleware = (
  cogsConnection: TypedCogsConnection,
): Middleware => {
  return (api: AppMiddlewareAPI) => {
    const { dispatch, getState } = api;

    cogsConnection.addEventListener("config", ({ config }) => {
      if (config["Bridge IP Address"] !== getState().hue.ipAddress) {
        dispatch(hueActions.changeIpAddress(config["Bridge IP Address"]));
      }
      dispatch(hueActions.setResetBehaviour(config["Reset Behaviour"]));
    });

    cogsConnection.addEventListener("event", (event) => {
      if (event.name === "Set Zone To Scene") {
        dispatch(hueActions.setZoneToScene({ command: event.value }));
      }
      if (event.name === "Set Zone Off") {
        dispatch(hueActions.setZoneOff({ command: event.value }));
      }
      if (event.name === "Set Device Off") {
        dispatch(hueActions.setDevice({ command: event.value, on: false }));
      }
      if (event.name === "Set Device On") {
        dispatch(hueActions.setDevice({ command: event.value, on: true }));
      }
    });

    const doResetBehaviourIfNeeded = () => {
      const { phase, resetBehaviour } = getState().hue;
      if (
        phase.type === "authenticated_synced" &&
        cogsConnection.showPhase === "setup"
      ) {
        dispatch(
          loggingActions.log({
            message: `Executing: Reset behaviour "${resetBehaviour}"`,
            level: "info",
            datetime: Date.now(),
          }),
        );
        if (resetBehaviour === "All Off") {
          dispatch(hueActions.setAllOff());
        } else if (resetBehaviour === "Default Scene") {
          dispatch(hueActions.setZoneToScene({ command: "Default" }));
        }
      }
    };

    cogsConnection.addEventListener("showPhase", () => {
      doResetBehaviourIfNeeded();
    });

    cogsConnection.store.addEventListener("items", () => {
      // Initial store sync - update our local store
      if (getState().hue.phase.type === "waiting_for_cogs") {
        dispatch(
          hueActions.moveToState({
            type: "finding_bridge_id",
          }),
        );
      }
    });

    const getApiKeysFromStore = (bridgeId: string) => {
      return (
        cogsConnection.store.getItem("apiKeys") as HueApiKeysStore | undefined
      )?.[bridgeId];
    };

    return (next) => (action) => {
      const prevPhase = getState().hue.phase;
      const result = next(action);
      const phase = getState().hue.phase;

      if (prevPhase.type !== phase.type) {
        cogsConnection.setState({
          "Bridge Connected": phase.type === "authenticated_synced",
        });

        if (phase.type === "authenticating_with_bridge") {
          const apiKeys = getApiKeysFromStore(phase.bridgeId);
          if (apiKeys) {
            dispatch(
              loggingActions.log({
                message: `Authenticated: Found API keys for bridge "${phase.bridgeId}" in store`,
                datetime: Date.now(),
                level: "info",
              }),
            );
            dispatch(
              hueActions.moveToState({
                type: "authenticated_not_synced",
                bridgeId: phase.bridgeId,
                apiKeys,
              }),
            );
          }
        }

        if (phase.type === "authenticated_not_synced") {
          cogsConnection.store.setItems({
            apiKeys: {
              [phase.bridgeId]: phase.apiKeys,
            },
          });
        }

        if (phase.type === "authenticated_synced") {
          doResetBehaviourIfNeeded();
        }
      }

      return result;
    };
  };
};
