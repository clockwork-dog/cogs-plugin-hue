import { CogsConnectionProvider } from "@clockworkdog/cogs-client-react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import * as manifest from "./cogs-plugin-manifest.js";
import { useTypedCogsConnection } from "./hooks/useTypedCogsConnection.js";
import { createStore } from "./store/store";
import "./style.css";
import { App } from "./ui/App.js";

function AppWithProvider() {
  const cogsConnection = useTypedCogsConnection();
  return (
    <Provider store={createStore(cogsConnection)}>
      <App />
    </Provider>
  );
}

createRoot(document.getElementById("root")!).render(
  <CogsConnectionProvider manifest={manifest}>
    <AppWithProvider />
  </CogsConnectionProvider>,
);
