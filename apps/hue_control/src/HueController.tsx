import { Suspense, use } from "react";
import { getScenes } from "./hueApi/hueV2";
import { HueResponse, HueScene } from "./hueApi/hueV2.types";
import { AuthenticatedHueBridgeConnection } from "./types";

export default function HueController({
  connection,
}: {
  connection: AuthenticatedHueBridgeConnection;
}) {
  const scenesPromise = getScenes(connection);
  return (
    <Suspense fallback={<div>Waiting for bridge to sync</div>}>
      <ScenesList scenesPromise={scenesPromise} />
    </Suspense>
  );
}

function ScenesList({
  scenesPromise,
}: {
  scenesPromise: Promise<HueResponse<HueScene[]>>;
}) {
  const scenes = use(scenesPromise);
  if (scenes.result === "success") {
    return (
      <ul>
        {scenes.response.map((scene) => (
          <li>{scene.metadata.name}</li>
        ))}
      </ul>
    );
  } else {
    return null;
  }
}
