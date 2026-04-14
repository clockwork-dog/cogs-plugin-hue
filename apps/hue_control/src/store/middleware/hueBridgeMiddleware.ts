import { Middleware } from "@reduxjs/toolkit";
import { Result } from "typescript-result";
import { HueBridgeConnection } from "../../hueApi/hue.types";
import {
  getConfigUnathenticated,
  LINK_BUTTON_NOT_PRESSED,
  postAuthRequest,
} from "../../hueApi/hueV1";
import { HueV1AuthBody } from "../../hueApi/hueV1.types";
import {
  getBridgeHomes,
  getLights,
  getScenes,
  getZones,
  putGroupedLight,
  putLight,
  putScene,
} from "../../hueApi/hueV2";
import {
  HueV2ResponseErrorNetwork,
  HueV2ResponseErrorStatusCode,
} from "../../hueApi/hueV2.types";
import { hueActions } from "../features/hue/hueSlice";
import { loggingActions } from "../features/logging/loggingSlice";
import { AppMiddlewareAPI } from "../store";

const AUTH_BODY: HueV1AuthBody = {
  devicetype: "cogs#cogs",
  generateclientkey: true,
};

class DurationNanError extends Error {
  readonly type = "duration_nan";
  constructor(public duration_str: string) {
    super();
  }
}

class DurationLargeError extends Error {
  readonly type = "duration_large";
  constructor(public duration_str: string) {
    super();
  }
}

class DurationNegativeError extends Error {
  readonly type = "duration_neg";
  constructor(public duration_str: string) {
    super();
  }
}

function splitAtPossibleChar(
  str: string,
  delimiter: string,
): [string, string?] {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.substring(0, index), str.substring(index + 1)];
  } else {
    return [str, undefined];
  }
}

function parseCommand(
  command: string,
):
  | Result.Ok<{ name: string; duration_ms?: number }>
  | Result.Error<DurationNanError>
  | Result.Error<DurationLargeError>
  | Result.Error<DurationNegativeError> {
  const [name, duration_str] = splitAtPossibleChar(command, ":");
  if (duration_str === undefined) {
    return Result.ok({ name });
  } else {
    // Use implicit cast as it is more restrictive than parseFloat
    const duration_seconds = +duration_str;
    if (!isNaN(duration_seconds)) {
      if (isFinite(duration_seconds)) {
        if (duration_seconds >= 0) {
          return Result.ok({
            name,
            duration_ms: Math.round(duration_seconds * 1000),
          });
        } else {
          return Result.error(new DurationNegativeError(duration_str));
        }
      } else {
        return Result.error(new DurationLargeError(duration_str));
      }
    } else {
      return Result.error(new DurationNanError(duration_str));
    }
  }
}

export const createHueBridgeMiddleware = (): Middleware => {
  return (api: AppMiddlewareAPI) => {
    const { dispatch, getState } = api;

    setInterval(() => {
      const phase = getState().hue.phase;
      if (phase.type === "finding_bridge_id") {
        void findBridgeId();
      }

      if (phase.type === "authenticating_with_bridge") {
        void getApiKeys();
      }
    }, 4000);

    const findBridgeId = async () => {
      const ipAddress = getState().hue.ipAddress;
      const configResult = await getConfigUnathenticated({
        ipAddress,
      });
      if (configResult.ok) {
        dispatch(
          loggingActions.log({
            message: `Connected: Confirmed connection at ${ipAddress} to bridge "${configResult.value.bridgeid}"`,
            datetime: Date.now(),
            level: "info",
          }),
        );
        dispatch(
          hueActions.moveToState({
            type: "authenticating_with_bridge",
            bridgeId: configResult.value.bridgeid,
          }),
        );
      } else {
        if (configResult.error.type === "hue_v1_response_error_network") {
          dispatch(
            loggingActions.log({
              message:
                "Disconnected: Hue bridge did not respond to request. Retrying.",
              datetime: Date.now(),
              level: "warning",
            }),
          );
        } else if (
          configResult.error.type === "hue_v1_response_error_status_code"
        ) {
          console.error(configResult.error);
          dispatch(
            loggingActions.log({
              message: `Fatal: Bridge responded with error code ${configResult.error.status} to config request. Full error has been printed to developer logs. Restart your bridge, then restart COGS`,
              datetime: Date.now(),
              level: "warning",
            }),
          );
          dispatch(hueActions.moveToState({ type: "fail" }));
        } else {
          console.error(configResult.error);
          dispatch(
            loggingActions.log({
              message: `Fatal: Bridge responded with error to config request. Full error has been printed to developer logs. Restart your bridge, then restart COGS`,
              datetime: Date.now(),
              level: "warning",
            }),
          );
          dispatch(hueActions.moveToState({ type: "fail" }));
        }
      }
    };

    const getApiKeys = async () => {
      const ipAddress = getState().hue.ipAddress;
      const phase = getState().hue.phase;
      if (phase.type === "authenticating_with_bridge") {
        const authResult = await postAuthRequest({ ipAddress }, AUTH_BODY);
        if (authResult.ok) {
          dispatch(
            loggingActions.log({
              message: `Authenticated: Recieved API keys for bridge "${phase.bridgeId}"`,
              datetime: Date.now(),
              level: "info",
            }),
          );
          dispatch(
            hueActions.moveToState({
              type: "authenticated_not_synced",
              bridgeId: phase.bridgeId,
              apiKeys: {
                applicationkey: authResult.value.username,
                clientkey: authResult.value.clientkey,
              },
            }),
          );
        } else {
          if (authResult.error.type === "hue_v1_response_error_network") {
            dispatch(
              loggingActions.log({
                message:
                  "Disconnect: Network issue while syncing with bridge. Will attempt to reconnect.",
                datetime: Date.now(),
                level: "warning",
              }),
            );
            dispatch(hueActions.moveToState({ type: "finding_bridge_id" }));
          } else if (
            authResult.error.type === "hue_v1_response_error_status_code"
          ) {
            console.error(authResult.error);
            dispatch(
              loggingActions.log({
                message: `Fatal: Bridge responded with error code ${authResult.error.status} to config request. Full error has been printed to developer logs. Restart your bridge, then restart COGS`,
                datetime: Date.now(),
                level: "warning",
              }),
            );
            dispatch(hueActions.moveToState({ type: "fail" }));
          } else {
            if (authResult.error.errors[0].type === LINK_BUTTON_NOT_PRESSED) {
              dispatch(
                loggingActions.log({
                  message: `Waiting: Press the link button on the bridge to authenticate`,
                  datetime: Date.now(),
                  level: "info",
                }),
              );
            } else {
              console.error(authResult.error);
              dispatch(
                loggingActions.log({
                  message: `Fatal: Bridge responded with error to config request. Full error has been printed to developer logs. Restart your bridge, then restart COGS`,
                  datetime: Date.now(),
                  level: "warning",
                }),
              );
              dispatch(hueActions.moveToState({ type: "fail" }));
            }
          }
        }
      }
    };

    const syncWithBridge = async () => {
      const ipAddress = getState().hue.ipAddress;
      const phase = getState().hue.phase;
      if (phase.type === "authenticated_not_synced") {
        const connection: HueBridgeConnection = {
          ipAddress,
          apiKeys: phase.apiKeys,
        };
        const syncResult = await Result.all(
          getScenes(connection),
          getLights(connection),
          getZones(connection),
          getBridgeHomes(connection),
        );

        if (syncResult.ok) {
          const [
            scenesResponse,
            lightsResponse,
            zonesResponse,
            bridgeHomesResponse,
          ] = syncResult.value;
          dispatch(
            loggingActions.log({
              message: `Synced: Found ${scenesResponse.length} scenes, ${zonesResponse.length} zones and ${lightsResponse.length} devices`,
              datetime: Date.now(),
              level: "info",
            }),
          );
          dispatch(
            hueActions.moveToState({
              type: "authenticated_synced",
              apiKeys: phase.apiKeys,
              bridgeId: phase.bridgeId,
              lastSynced: Date.now(),
              syncedData: {
                scenes: scenesResponse
                  .filter((hueV2Scene) => hueV2Scene.group.rtype === "zone")
                  .map((hueV2Scene) => ({
                    name: hueV2Scene.metadata.name,
                    id: hueV2Scene.id,
                    lightgroupId: hueV2Scene.group.rid,
                  })),
                lights: lightsResponse.map((hueV2Light) => ({
                  id: hueV2Light.id,
                  name: hueV2Light.metadata.name,
                })),
                zones: zonesResponse.map((hueV2Zone) => ({
                  id: hueV2Zone.id,
                  name: hueV2Zone.metadata.name,
                  lightgroupId: hueV2Zone.services[0].rid,
                })),
                bridgeHomeLightgroupId: bridgeHomesResponse[0].services[0].rid,
              },
            }),
          );
        } else {
          if (syncResult.error.type === "hue_v2_network") {
            dispatch(
              loggingActions.log({
                message:
                  "Disconnect: Network issue while syncing with bridge. Will attempt to reconnect.",
                datetime: Date.now(),
                level: "warning",
              }),
            );
            dispatch(hueActions.moveToState({ type: "finding_bridge_id" }));
          } else if (syncResult.error.type === "hue_v2_status_code") {
            if (syncResult.error.status === 401) {
              dispatch(
                loggingActions.log({
                  message:
                    "Unathenticated: Bridge may have been factory reset or the API key revoked. Will attempt to reauthenticate.",
                  datetime: Date.now(),
                  level: "warning",
                }),
              );
              dispatch(
                hueActions.moveToState({
                  type: "authenticating_with_bridge",
                  bridgeId: phase.bridgeId,
                }),
              );
            } else {
              console.error(syncResult.error);
              dispatch(
                loggingActions.log({
                  message: `Fatal: Bridge responded with error code ${syncResult.error.status} to sync. Full error has been printed to developer logs. Restart your bridge, then restart COGS.`,
                  datetime: Date.now(),
                  level: "error",
                }),
              );
            }
          }
        }
      }
    };

    return (next) => (action) => {
      const prevPhase = getState().hue.phase;
      const result = next(action);
      const phase = getState().hue.phase;

      // Respond to specific actions
      if (prevPhase.type !== phase.type) {
        if (phase.type === "finding_bridge_id") {
          void findBridgeId();
        }

        if (phase.type === "authenticated_not_synced") {
          void syncWithBridge();
        }
      }

      if (
        hueActions.setZoneToScene.match(action) ||
        hueActions.setZoneOff.match(action) ||
        hueActions.setDevice.match(action) ||
        hueActions.setAllOff.match(action)
      ) {
        if (phase.type === "authenticated_synced") {
          const processErrorInAction = (
            error: HueV2ResponseErrorNetwork | HueV2ResponseErrorStatusCode,
          ) => {
            if (error.type === "hue_v2_network") {
              dispatch(
                loggingActions.log({
                  message:
                    "Disconnect: Network issue while executing command. Will attempt to reconnect.",
                  datetime: Date.now(),
                  level: "warning",
                }),
              );
              dispatch(hueActions.moveToState({ type: "finding_bridge_id" }));
            } else if (error.type === "hue_v2_status_code") {
              if (error.status === 401) {
                dispatch(
                  loggingActions.log({
                    message:
                      "Unathenticated: Bridge may have been factory reset or the API key revoked. Will attempt to reauthenticate.",
                    datetime: Date.now(),
                    level: "warning",
                  }),
                );
                dispatch(
                  hueActions.moveToState({
                    type: "authenticating_with_bridge",
                    bridgeId: phase.bridgeId,
                  }),
                );
              } else if (error.status === 429) {
                dispatch(
                  loggingActions.log({
                    message: `Error: Too many requests to bridge. Please slow down your requests, or combine them using scenes if possible. For more information, see the documentation for this plugin.`,
                    datetime: Date.now(),
                    level: "error",
                  }),
                );
              } else {
                console.error(error);
                dispatch(
                  loggingActions.log({
                    message: `Error: Bridge responded with error code ${error.status} to command. Full error has been printed to developer logs.`,
                    datetime: Date.now(),
                    level: "error",
                  }),
                );
              }
            }
          };

          const ipAddress = getState().hue.ipAddress;
          const connection: HueBridgeConnection = {
            ipAddress,
            apiKeys: phase.apiKeys,
          };
          const syncedData = phase.syncedData;
          if (hueActions.setAllOff.match(action)) {
            putGroupedLight(connection, syncedData.bridgeHomeLightgroupId, {
              on: { on: false },
            }).then((result) => {
              if (!result.ok) {
                processErrorInAction(result.error);
              }
            });
          } else {
            const parseResult = parseCommand(action.payload.command);
            if (parseResult.ok) {
              const { name, duration_ms } = parseResult.value;

              const executeAction = () => {
                if (hueActions.setZoneToScene.match(action)) {
                  const showScene = syncedData.scenes.filter(
                    (scene) => scene.name === name,
                  )[0];
                  if (showScene) {
                    dispatch(
                      loggingActions.log({
                        message: `Executed: “Set Zone To Scene” for scene "${name}".`,
                        level: "info",
                        datetime: Date.now(),
                      }),
                    );
                    return putScene(connection, showScene.id, {
                      recall: { action: "active", duration: duration_ms },
                    });
                  } else {
                    dispatch(
                      loggingActions.log({
                        message: `Ignored: “Set Zone To Scene” for scene "${name}". Scene does not exist.`,
                        level: "warning",
                        datetime: Date.now(),
                      }),
                    );
                  }
                } else if (hueActions.setZoneOff.match(action)) {
                  const zone = syncedData.zones.filter(
                    (zone) => zone.name === name,
                  )[0];
                  if (zone) {
                    dispatch(
                      loggingActions.log({
                        message: `Executed: “Set Zone Off” for zone "${name}".`,
                        level: "info",
                        datetime: Date.now(),
                      }),
                    );
                    return putGroupedLight(connection, zone.lightgroupId, {
                      on: { on: false },
                    });
                  } else {
                    dispatch(
                      loggingActions.log({
                        message: `Ignored: “Set Zone Off” for zone "${name}". Zone does not exist.`,
                        level: "warning",
                        datetime: Date.now(),
                      }),
                    );
                  }
                } else if (hueActions.setDevice.match(action)) {
                  const light = syncedData.lights.filter(
                    (light) => light.name === name,
                  )[0];
                  if (light) {
                    dispatch(
                      loggingActions.log({
                        message: `Executed: “Set Device ${action.payload.on ? "On" : "Off"}" for device "${name}".`,
                        level: "info",
                        datetime: Date.now(),
                      }),
                    );
                    return putLight(connection, light.id, {
                      on: { on: action.payload.on },
                    });
                  } else {
                    dispatch(
                      loggingActions.log({
                        message: `Ignored: “Set Device ${action.payload.on ? "On" : "Off"}" for device "${name}". Device does not exist.`,
                        level: "warning",
                        datetime: Date.now(),
                      }),
                    );
                  }
                }
                return undefined;
              };

              executeAction()?.then((result) => {
                if (!result.ok) {
                  processErrorInAction(result.error);
                }
              });
            } else {
              const specificMessage = parseResult
                .match()
                .when(
                  DurationNanError,
                  (error) =>
                    `Duration ${error.duration_str} is not a number. Enter your duration as a number of seconds e.g. "my-scene:1".`,
                )
                .when(
                  DurationLargeError,
                  (error) =>
                    `Duration ${error.duration_str} is too large. Enter your duration as a number of seconds e.g. "my-scene:1".`,
                )
                .when(
                  DurationNegativeError,
                  (error) =>
                    `Duration ${error.duration_str} is negative. Enter your duration as a number of seconds e.g. "my-scene:1".`,
                )
                .run();
              dispatch(
                loggingActions.log({
                  message: `Error: Could not parse command ${action.payload.command}. ${specificMessage}`,
                  level: "error",
                  datetime: Date.now(),
                }),
              );
            }
          }
        }
      }

      return result;
    };
  };
};
