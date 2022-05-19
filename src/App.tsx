import React, { useState } from "react";
import {
  useCogsConfig,
  useCogsConnection,
  useCogsEvent,
  useIsConnected,
} from "@clockworkdog/cogs-client-react";

import "./App.css";
import HueController from "./HueController";

export type CogsConnectionParams = {
  config: { "API Key": string; "Bridge IP Address": string };
  inputEvents: { "Show Scene": string };
};

export default function App() {
  const connection = useCogsConnection<CogsConnectionParams>();
  const isConnected = useIsConnected(connection);

  const apiKey = useCogsConfig(connection)["API Key"];
  const bridgeIpAddress = useCogsConfig(connection)["Bridge IP Address"];

  const [latestScene, setLatestScene] = useState("");

  useCogsEvent(connection, "Show Scene", (scene) => {
    setLatestScene(scene);
  });

  return (
    <div className="App">
      <div>Connected: {isConnected.toString()}</div>
      <div>API Key: {apiKey}</div>
      <div>Bridge IP: {bridgeIpAddress}</div>
      <div>Scene: {latestScene}</div>

      <HueController />
    </div>
  );
}
