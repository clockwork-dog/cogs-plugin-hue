import { useEffect } from "react";
import { getBridgeHomes, getLights, getScenes, getZones } from "./hueApi/hueV2";
import { HueV2ResponseError } from "./hueApi/hueV2.types";
import { HueSyncedData, UnsyncedHueBridgeConnection } from "./types";

export default function HueSyncer({
  connection,
  syncCallback,
  errorCallback,
}: {
  connection: UnsyncedHueBridgeConnection;
  syncCallback: (data: HueSyncedData) => void;
  errorCallback: (error: HueV2ResponseError) => void;
}) {
  useEffect(() => {
    Promise.all([
      getScenes(connection),
      getLights(connection),
      getZones(connection),
      getBridgeHomes(connection),
    ]).then(
      ([
        scenesResponse,
        lightsResponse,
        zonesResponse,
        bridgeHomesResponse,
      ]) => {
        if (scenesResponse.result === "success") {
          if (lightsResponse.result === "success") {
            if (zonesResponse.result === "success") {
              if (bridgeHomesResponse.result === "success") {
                syncCallback({
                  scenes: scenesResponse.response
                    .filter((hueV2Scene) => hueV2Scene.group.rtype === "zone")
                    .map((hueV2Scene) => ({
                      name: hueV2Scene.metadata.name,
                      id: hueV2Scene.id,
                      lightgroupId: hueV2Scene.group.rid,
                    })),
                  lights: lightsResponse.response.map((hueV2Light) => ({
                    id: hueV2Light.id,
                    name: hueV2Light.metadata.name,
                  })),
                  zones: zonesResponse.response.map((hueV2Zone) => ({
                    id: hueV2Zone.id,
                    name: hueV2Zone.metadata.name,
                    lightgroupId: hueV2Zone.services[0].rid,
                  })),
                  bridgeHomeLightgroupId:
                    bridgeHomesResponse.response[0].services[0].rid,
                });
              } else {
                errorCallback(bridgeHomesResponse);
              }
            } else {
              errorCallback(zonesResponse);
            }
          } else {
            errorCallback(lightsResponse);
          }
        } else {
          errorCallback(scenesResponse);
        }
      },
    );
  }, [connection]);

  return (
    <div>
      <h1>Syncing</h1>
    </div>
  );
}
