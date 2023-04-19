import {
  useCogsConfig,
  useCogsConnection,
  useCogsEvent,
  useWhenShowReset,
} from "@clockworkdog/cogs-client-react";
import { useCallback, useEffect, useState } from "react";
import { CogsConnectionParams } from "./App";
import { HueScenes } from "./types";

const getScenesUrl = (ipAddress: string, apiKey: string) =>
  `http://${ipAddress}/api/${apiKey}/scenes`;

const recallSceneUrl = (ipAddress: string, apiKey: string) =>
  `http://${ipAddress}/api/${apiKey}/groups/0/action`;

function findSceneByName(scenes: HueScenes, sceneName: string) {
  if (scenes) {
    return Object.entries(scenes).find(
      ([id, scene]) => scene.name === sceneName
    )?.[0];
  }
}

export default function HueController() {
  const connection = useCogsConnection<CogsConnectionParams>();

  const apiKey = useCogsConfig(connection)["API Key"];
  const bridgeIpAddress = useCogsConfig(connection)["Bridge IP Address"];
  const defaultScene = useCogsConfig(connection)["Default Scene"];

  const [scenes, setScenes] = useState<HueScenes>();

  const getScenesFromBridge = useCallback(async () => {
    if (!bridgeIpAddress) {
      console.warn("Bridge IP address not set");
      return;
    }
    if (!apiKey) {
      console.warn("API Key not set");
      return;
    }
    try {
      const response = await fetch(getScenesUrl(bridgeIpAddress, apiKey), {
        method: "GET",
      });

      if (response.status === 200) {
        const scenesData = (await response.json()) as HueScenes;
        setScenes(scenesData);
        return scenesData;
      }

      return undefined;
    } catch (e) {
      console.error("Error fetching Hue scenes", e);
      return undefined;
    }
  }, [apiKey, bridgeIpAddress]);

  const showScene = useCallback(
    async (sceneName: string) => {
      console.log("Showing scene with name", sceneName);
      try {
        let sceneId = scenes ? findSceneByName(scenes, sceneName) : undefined;
        console.log("Found sceneId", sceneId);

        // If can't find the scene, maybe we don't have the scenes yet or the scene is newly added - try and fetch again
        if (!sceneId) {
          console.log("Couldn't find scene ID - fetching scenes again");
          const refreshedScenes = await getScenesFromBridge();

          if (refreshedScenes) {
            sceneId = findSceneByName(refreshedScenes, sceneName);
            console.log("Now found sceneId", sceneId);
          }
        }

        // If we now have an ID - recall the scene
        if (sceneId) {
          await fetch(recallSceneUrl(bridgeIpAddress, apiKey), {
            method: "PUT",
            body: JSON.stringify({ scene: sceneId }),
          });
        }
      } catch (e) {
        console.error("Failed to set scene", sceneName);
      }
    },
    [getScenesFromBridge, apiKey, bridgeIpAddress, scenes]
  );

  const showDefaultScene = useCallback(
    () => showScene(defaultScene),
    [showScene, defaultScene]
  );

  // Find scenes on first load
  useEffect(() => {
    if (
      !scenes &&
      apiKey !== undefined &&
      bridgeIpAddress !== undefined &&
      defaultScene !== undefined
    ) {
      getScenesFromBridge().then(() => {
        if (defaultScene) {
          showDefaultScene();
        }
      });
    }
  }, [
    scenes,
    apiKey,
    bridgeIpAddress,
    defaultScene,
    getScenesFromBridge,
    showDefaultScene,
  ]);

  useCogsEvent(connection, "Show Scene", showScene);

  useWhenShowReset(connection, showDefaultScene);

  return null;
}
