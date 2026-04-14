import { useCogsConfig, useCogsEvents } from "@clockworkdog/cogs-client-react";

import CssBaseline from "@mui/material/CssBaseline";

import { CogsShowPhaseChangedEvent } from "@clockworkdog/cogs-client";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTypedCogsConnection } from "../hooks/useTypedCogsConnection";
import { HueConnectionManager } from "./HueConnectionManager";

export function App() {
  const cogsConnection = useTypedCogsConnection();

  const [startupMode, setStartupMode] = useState(
    cogsConnection.showPhase === "setup",
  );

  useCogsEvents(cogsConnection, (event) => {
    setStartupMode(false);
  });

  useEffect(() => {
    const listener = (event: CogsShowPhaseChangedEvent) => {
      if (event.showPhase !== "setup") {
        setStartupMode(false);
      }
    };
    cogsConnection.addEventListener("showPhase", listener);
    return () => {
      cogsConnection.removeEventListener("showPhase", listener);
    };
  }, [cogsConnection, setStartupMode]);

  const bridgeIpAddress = useCogsConfig(cogsConnection)["Bridge IP Address"];

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HueConnectionManager
        bridgeIpAddress={bridgeIpAddress}
        startupMode={startupMode}
        key={bridgeIpAddress}
        resetBehaviourDone={() => {
          setStartupMode(false);
        }}
      />
    </ThemeProvider>
  );
}
