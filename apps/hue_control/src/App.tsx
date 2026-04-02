import { useCogsConfig, useIsConnected } from "@clockworkdog/cogs-client-react";
import { useEffect, useState } from "react";

import { CogsConnection } from "@clockworkdog/cogs-client";
import "./App.css";
import { useTypedCogsConnection } from "./hooks/useTypedCogsConnection";
import HueAuthenticator from "./HueAuthenticator";
import HueConnectionChecker from "./HueConnectionChecker";
import HueController from "./HueController";
import { HueApiKeys, HueApiKeysStore, HueBridgeConnection } from "./types";

function getApiKeysFromStore<Connection extends CogsConnection<any>>(
  connection: Connection,
  bridgeId: string,
): HueApiKeys | undefined {
  return (connection.store.getItem("apiKeys") as HueApiKeysStore | undefined)?.[
    bridgeId
  ];
}

export function App() {
  const cogsConnection = useTypedCogsConnection();
  const isCogsConnected = useIsConnected(cogsConnection);

  const bridgeIpAddress = useCogsConfig(cogsConnection)["Bridge IP Address"];
  const [hueBridgeConnection, setHueBridgeConnection] =
    useState<HueBridgeConnection>({
      type: "potential",
      ipAddress: bridgeIpAddress,
    });
  useEffect(() => {
    if (bridgeIpAddress !== hueBridgeConnection.ipAddress) {
      setHueBridgeConnection({
        type: "potential",
        ipAddress: bridgeIpAddress,
      });
    }
  }, [bridgeIpAddress]);

  // const [latestScene, setLatestScene] = useState("");

  // useCogsEvent(cogsConnection, "Show Scene", setLatestScene);

  if (isCogsConnected) {
    if (hueBridgeConnection.type === "authenticated") {
      return (
        <div className="App">
          <div>Bridge IP: {bridgeIpAddress}</div>
          <div>
            API Application Key: {hueBridgeConnection.apiKeys.applicationkey}
          </div>
          <HueController connection={hueBridgeConnection} />
        </div>
      );
    } else if (hueBridgeConnection.type === "connected") {
      return (
        <div className="App">
          <div>Bridge IP: {bridgeIpAddress}</div>
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
        </div>
      );
    } else if (
      hueBridgeConnection.type === "potential" &&
      hueBridgeConnection.ipAddress
    ) {
      return (
        <div className="App">
          <div>Bridge IP: {bridgeIpAddress}</div>
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
        </div>
      );
    } else {
      return (
        <div className="App">
          <div>
            Please enter a valid IP for your Hue bridge in the config menu
          </div>
        </div>
      );
    }
  } else {
    return (
      <div className="App">
        <div>Not connected to COGS</div>
      </div>
    );
  }
}
