import {
  useCogsConfig,
  useCogsEvent,
  useWhenShowReset,
} from "@clockworkdog/cogs-client-react";
import { useCallback, useEffect, useState } from "react";
import { useTypedCogsConnection } from "./hooks/useTypedCogsConnection";
import { HueApiKeys, HueScenes } from "./types";

const getScenesUrl = (ipAddress: string, apiUsername: string) =>
  `http://${ipAddress}/api/${apiUsername}/scenes`;

const recallSceneUrl = (ipAddress: string, apiUsername: string) =>
  `http://${ipAddress}/api/${apiUsername}/groups/0/action`;

function findSceneByName(scenes: HueScenes, sceneName: string) {
  if (scenes) {
    return Object.entries(scenes).find(
      ([id, scene]) => scene.name === sceneName,
    )?.[0];
  }
}

export default function HueController({
  bridgeIpAddress,
  apiKeys,
}: {
  bridgeIpAddress: string;
  apiKeys: HueApiKeys;
}) {
  const connection = useTypedCogsConnection();
  const defaultScene = useCogsConfig(connection)["Default Scene"];

  const [scenes, setScenes] = useState<HueScenes>();

  const apiUsername = apiKeys.applicationkey;

  const getScenesFromBridge = useCallback(async () => {
    if (!bridgeIpAddress) {
      console.warn("Bridge IP address not set");
      return;
    }
    if (!apiUsername) {
      console.warn("API Key not set");
      return;
    }
    try {
      const response = await fetch(getScenesUrl(bridgeIpAddress, apiUsername), {
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
  }, [apiUsername, bridgeIpAddress]);

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
          await fetch(recallSceneUrl(bridgeIpAddress, apiUsername), {
            method: "PUT",
            body: JSON.stringify({ scene: sceneId }),
          });
        }
      } catch (e) {
        console.error("Failed to set scene", sceneName);
      }
    },
    [getScenesFromBridge, apiUsername, bridgeIpAddress, scenes],
  );

  const showDefaultScene = useCallback(
    () => showScene(defaultScene),
    [showScene, defaultScene],
  );

  // Find scenes on first load
  useEffect(() => {
    if (
      !scenes &&
      apiUsername !== undefined &&
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
    apiUsername,
    bridgeIpAddress,
    defaultScene,
    getScenesFromBridge,
    showDefaultScene,
  ]);

  useCogsEvent(connection, "Show Scene", showScene);

  useWhenShowReset(connection, showDefaultScene);

  return null;
}
