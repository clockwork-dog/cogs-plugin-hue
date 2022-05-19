import {
  useCogsConfig,
  useCogsConnection,
  useCogsEvent,
} from "@clockworkdog/cogs-client-react";
import { useCallback, useEffect, useState } from "react";
import { CogsConnectionParams } from "./App";
import { HueScenes } from "./types";

const getScenesUrl = (ipAddress: string, apiKey: string) =>
  `http://${ipAddress}/api/${apiKey}/scenes`;

const recallSceneUrl = (ipAddress: string, apiKey: string) =>
  `http://${ipAddress}/api/${apiKey}/groups/0/action`;

export default function HueController() {
  const connection = useCogsConnection<CogsConnectionParams>();

  const apiKey = useCogsConfig(connection)["API Key"];
  const bridgeIpAddress = useCogsConfig(connection)["Bridge IP Address"];

  const [scenes, setScenes] = useState<HueScenes>();

  const getScenesFromBridge = useCallback(
    async (apiKey: string, bridgeIpAddress: string) => {
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
    },
    []
  );

  // Find scenes on first load
  useEffect(() => {
    if (apiKey?.length && bridgeIpAddress?.length) {
      getScenesFromBridge(apiKey, bridgeIpAddress);
    }
  }, [apiKey, bridgeIpAddress]);

  useCogsEvent(connection, "Show Scene", (sceneName) => {
    function findSceneByName(scenes: HueScenes) {
      if (scenes) {
        return Object.entries(scenes).find(
          ([id, scene]) => scene.name === sceneName
        )?.[0];
      }
    }

    async function showScene() {
      try {
        let sceneId = scenes ? findSceneByName(scenes) : undefined;
        console.log("Found sceneId", sceneId);

        // If can't find the scene, maybe we don't have the scenes yet or the scene is newly added - try and fetch again
        if (!sceneId) {
          console.log("Couldn't find scene ID - fetching scenes again");
          const refreshedScenes = await getScenesFromBridge(
            apiKey,
            bridgeIpAddress
          );

          if (refreshedScenes) {
            sceneId = findSceneByName(refreshedScenes);
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
    }

    showScene();
  });

  return null;
}
