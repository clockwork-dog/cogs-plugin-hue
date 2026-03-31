import React, { useState } from "react";
import {
  useCogsConfig,
  useCogsConnection,
  useCogsEvent,
  useIsConnected,
} from "@clockworkdog/cogs-client-react";

import "./App.css";
import HueController from "./HueController";
import { useTypedCogsConnection } from "./hooks/useTypedCogsConnection";
import { useCogsDataStoreItem } from "./hooks/useCogsDataStoreItem";
import { CLIENTKEY_KEY_PREFIX, USERNAME_KEY_PREFIX } from "./constants";
import HueAuthenticator from "./HueAuthenticator";

export function App() {
  const connection = useTypedCogsConnection();
  const isConnected = useIsConnected(connection);

  const bridgeIpAddress = useCogsConfig(connection)["Bridge IP Address"];
  const apiUsername = useCogsDataStoreItem(connection, USERNAME_KEY_PREFIX + bridgeIpAddress) as string | undefined;
  const apiClientkey = useCogsDataStoreItem(connection, CLIENTKEY_KEY_PREFIX + bridgeIpAddress) as string | undefined;

  const [latestScene, setLatestScene] = useState("");

  useCogsEvent(connection, "Show Scene", setLatestScene);

  if (isConnected) {
    if (apiUsername) {
      return (
        <div className="App">
          <div>API Username: {apiUsername}</div>
          <div>Bridge IP: {bridgeIpAddress}</div>
          <div>Scene: {latestScene}</div>

          <HueController />
        </div>
      );
      // TODO verify valid IP
    } else if (bridgeIpAddress) {
      return (<div className="App">
        <div>Bridge IP: {bridgeIpAddress}</div>
        <HueAuthenticator />
      </div>);
    } else {
      return (<div className="App">
        <div>Please enter a valid IP for your Hue bridge in the config menu</div>
      </div>);
    }
  } else {
    return (
      <div className="App">
        <div>Not connected to COGS</div>
      </div>);
  }
}
