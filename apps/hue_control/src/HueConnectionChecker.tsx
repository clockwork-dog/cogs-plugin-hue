import { useEffect } from "react";
import { getConfigUnathenticated } from "./hueApi/hueV1";
import { HueBridgeInfo, PotentialHueBridgeConnection } from "./types";

async function pollConfigRequest({
  connection,
  bridgeInfoCallback,
}: {
  connection: PotentialHueBridgeConnection;
  bridgeInfoCallback: (hueBridgeInfo: HueBridgeInfo) => void;
}) {
  console.log("Sending unathenticated config request");
  const response = await getConfigUnathenticated(connection);
  if (response.result === "success") {
    bridgeInfoCallback(response.response);
  } else {
    console.warn("Config request unsuccessful");
    console.warn(response);
  }
}

export default function HueConnectionChecker({
  connection,
  bridgeInfoCallback,
}: {
  connection: PotentialHueBridgeConnection;
  bridgeInfoCallback: (hueBridgeInfo: HueBridgeInfo) => void;
}) {
  useEffect(() => {
    setTimeout(async () => {
      if (connection.type === "potential") {
        await pollConfigRequest({
          connection,
          bridgeInfoCallback,
        });
      }
    }, 0);
    // TODO This can cause tens of requests hanging around until they time out
    const interval = setInterval(async () => {
      await pollConfigRequest({
        connection,
        bridgeInfoCallback,
      });
    }, 4000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, bridgeInfoCallback]);

  return (
    <div>
      Attempting to connect to your Hue bridge. If this screen persists, please
      check the IP is correct and that your Hue bridge has power and network
      lights on solid.
    </div>
  );
}
