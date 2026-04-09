import { useEffect, useState } from "react";

import { CogsConnection, DataStoreItemsEvent } from "@clockworkdog/cogs-client";
import { useTypedCogsConnection } from "./hooks/useTypedCogsConnection";
import HueAuthenticator from "./HueAuthenticator";
import HueConnectionChecker from "./HueConnectionChecker";
import HueController from "./HueController";
import HueSyncer from "./HueSyncer";
import { HueApiKeys, HueApiKeysStore, HueBridgeConnection } from "./types";

function getApiKeysFromStore<Connection extends CogsConnection<any>>(
  connection: Connection,
  bridgeId: string,
): HueApiKeys | undefined {
  return (connection.store.getItem("apiKeys") as HueApiKeysStore | undefined)?.[
    bridgeId
  ];
}

export function HueConnectionManager({
  bridgeIpAddress,
  startupMode,
  resetBehaviourDone,
}: {
  bridgeIpAddress: string;
  startupMode: boolean;
  resetBehaviourDone: () => void;
}) {
  const cogsConnection = useTypedCogsConnection();
  const [hueBridgeConnection, setHueBridgeConnection] =
    useState<HueBridgeConnection>({
      type: "potential",
      ipAddress: bridgeIpAddress,
    });

  useEffect(() => {
    const listener = (event: DataStoreItemsEvent) => {
      console.log("Data store event: " + JSON.stringify(event.items));
      if (hueBridgeConnection.type === "connected") {
        const keys = getApiKeysFromStore(
          cogsConnection,
          hueBridgeConnection.bridgeInfo.bridgeid,
        );
        if (keys) {
          console.log("Found keys in store on data store event");
          console.log(keys);
          setHueBridgeConnection({
            type: "authenticated",
            synced: false,
            ipAddress: hueBridgeConnection.ipAddress,
            bridgeInfo: hueBridgeConnection.bridgeInfo,
            apiKeys: keys,
          });
        } else {
          console.log("No keys found on data store event");
        }
      }
    };

    cogsConnection.store.addEventListener("items", listener);
    return () => {
      cogsConnection.store.removeEventListener("items", listener);
    };
  }, [cogsConnection, hueBridgeConnection, setHueBridgeConnection]);

  cogsConnection.setState({
    ["Bridge Connected"]:
      hueBridgeConnection.type === "authenticated" &&
      hueBridgeConnection.synced,
  });

  if (
    hueBridgeConnection.type === "authenticated" &&
    hueBridgeConnection.synced
  ) {
    return (
      <HueController
        connection={hueBridgeConnection}
        startupMode={startupMode}
        resetBehaviourDone={resetBehaviourDone}
        errorCallback={(error) => {
          console.error(error);
          if (error.error_cause === "status_code" && error.status === 401) {
            cogsConnection.store.setItems({
              apiKeys: {
                [hueBridgeConnection.bridgeInfo.bridgeid]: undefined,
              },
            });
          }
          setHueBridgeConnection({
            type: "potential",
            ipAddress: hueBridgeConnection.ipAddress,
          });
        }}
      />
    );
  } else if (
    hueBridgeConnection.type === "authenticated" &&
    !hueBridgeConnection.synced
  ) {
    return (
      <HueSyncer
        connection={hueBridgeConnection}
        syncCallback={(data) => {
          console.log(
            `Sync success, found ${data.zones.length} zones, ${data.scenes.length} scenes and ${data.lights.length} lights`,
          );
          setHueBridgeConnection({
            type: "authenticated",
            synced: true,
            ipAddress: hueBridgeConnection.ipAddress,
            bridgeInfo: hueBridgeConnection.bridgeInfo,
            apiKeys: hueBridgeConnection.apiKeys,
            syncedData: data,
            lastSync: new Date(),
          });
        }}
        errorCallback={(error) => {
          console.error(error);
          if (error.error_cause === "status_code" && error.status === 401) {
            cogsConnection.store.setItems({
              apiKeys: {
                [hueBridgeConnection.bridgeInfo.bridgeid]: undefined,
              },
            });
          }
          setHueBridgeConnection({
            type: "potential",
            ipAddress: hueBridgeConnection.ipAddress,
          });
        }}
      />
    );
  } else if (hueBridgeConnection.type === "connected") {
    return (
      <HueAuthenticator
        connection={hueBridgeConnection}
        authenticatedCallback={(keys) => {
          console.log("Keys obtained");
          console.log(keys);
          cogsConnection.store.setItems({
            apiKeys: { [hueBridgeConnection.bridgeInfo.bridgeid]: keys },
          });
          setHueBridgeConnection({
            type: "authenticated",
            synced: false,
            ipAddress: hueBridgeConnection.ipAddress,
            bridgeInfo: hueBridgeConnection.bridgeInfo,
            apiKeys: keys,
          });
        }}
        errorCallback={(error) => {
          console.error(error);
          setHueBridgeConnection({
            type: "potential",
            ipAddress: hueBridgeConnection.ipAddress,
          });
        }}
      />
    );
  } else if (
    hueBridgeConnection.type === "potential" &&
    hueBridgeConnection.ipAddress
  ) {
    return (
      <HueConnectionChecker
        connection={hueBridgeConnection}
        bridgeInfoCallback={(info) => {
          console.log("Connection confirmed");
          console.log(info);
          const keys = getApiKeysFromStore(cogsConnection, info.bridgeid);
          if (keys) {
            console.log("Found keys in store");
            console.log(keys);
            setHueBridgeConnection({
              type: "authenticated",
              synced: false,
              ipAddress: hueBridgeConnection.ipAddress,
              bridgeInfo: info,
              apiKeys: keys,
            });
          } else {
            console.log("No keys found in store");
            setHueBridgeConnection({
              type: "connected",
              ipAddress: hueBridgeConnection.ipAddress,
              bridgeInfo: info,
            });
          }
        }}
      />
    );
  } else {
    return (
      <div>Please enter a valid IP for your Hue bridge in the config menu</div>
    );
  }
}
