import { useTypedCogsConnection } from "../hooks/useTypedCogsConnection";
import { useSelector } from "../store/store";
import HueAuthenticator from "./HueAuthenticator";
import HueConnectionChecker from "./HueConnectionChecker";
import HueController from "./HueController";
import HueSyncer from "./HueSyncer";
// function getApiKeysFromStore<Connection extends CogsConnection<any>>(
//   connection: Connection,
//   bridgeId: string,
// ): HueApiKeys | undefined {
//   return (connection.store.getItem("apiKeys") as HueApiKeysStore | undefined)?.[
//     bridgeId
//   ];
// }

export function HueConnectionManager({
  bridgeIpAddress,
  startupMode,
  resetBehaviourDone,
}: {
  bridgeIpAddress: string;
  startupMode: boolean;
  resetBehaviourDone: () => void;
}) {
  const cogsConnection = useTypedCogsConnection();
  const phase = useSelector((state) => state.hue.phase);

  // useEffect(() => {
  //   const listener = (event: DataStoreItemsEvent) => {
  //     console.log("Data store event: " + JSON.stringify(event.items));
  //     if (hueBridgeConnection.type === "connected") {
  //       const keys = getApiKeysFromStore(
  //         cogsConnection,
  //         hueBridgeConnection.bridgeInfo.bridgeid,
  //       );
  //       if (keys) {
  //         console.log("Found keys in store on data store event");
  //         console.log(keys);
  //         setHueBridgeConnection({
  //           type: "authenticated",
  //           synced: false,
  //           ipAddress: hueBridgeConnection.ipAddress,
  //           bridgeInfo: hueBridgeConnection.bridgeInfo,
  //           apiKeys: keys,
  //         });
  //       } else {
  //         console.log("No keys found on data store event");
  //       }
  //     }
  //   };

  //   cogsConnection.store.addEventListener("items", listener);
  //   return () => {
  //     cogsConnection.store.removeEventListener("items", listener);
  //   };
  // }, [cogsConnection, hueBridgeConnection, setHueBridgeConnection]);

  // cogsConnection.setState({
  //   ["Bridge Connected"]:
  //     hueBridgeConnection.type === "authenticated" &&
  //     hueBridgeConnection.synced,
  // });

  if (phase.type === "authenticated_synced") {
    return <HueController />;
  } else if (phase.type === "authenticated_not_synced") {
    return <HueSyncer />;
  } else if (phase.type === "authenticating_with_bridge") {
    return <HueAuthenticator />;
  } else if (phase.type === "finding_bridge_id") {
    return <HueConnectionChecker />;
  } else {
    return (
      <div>Please enter a valid IP for your Hue bridge in the config menu</div>
    );
  }
}
