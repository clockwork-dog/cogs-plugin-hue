import { CogsShowPhaseChangedEvent } from "@clockworkdog/cogs-client";
import { useCogsConfig, useCogsEvent } from "@clockworkdog/cogs-client-react";
import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTypedCogsConnection } from "./hooks/useTypedCogsConnection";
import { putGroupedLight, putLight, putScene } from "./hueApi/hueV2";
import { HueV2ResponseError } from "./hueApi/hueV2.types";
import { SyncedHueBridgeConnection } from "./types";

function parseCommand(command: string): { name: string; duration?: number } {
  const splitted = command.split(":");
  return {
    name: splitted[0],
    duration: splitted[1] ? parseInt(splitted[1]) : undefined,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ flex: "1", overflow: "auto" }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

type StaticWarningType =
  | "scene_name_clash"
  | "zone_name_clash"
  | "no_default"
  | "scene_name_colon"
  | "zone_name_colon";

interface StaticWarning {
  static: true;
  key: string;
  type: StaticWarningType;
  data?: string;
}

function getDuplicates<T>(arr: T[]): T[] {
  const uniques = new Set<T>();
  const duplicates = new Set<T>();
  for (const x of arr) {
    if (uniques.has(x)) {
      duplicates.add(x);
    } else {
      uniques.add(x);
    }
  }
  return Array.from(duplicates);
}

function warningDisplayText(warning: StaticWarning): string {
  if (warning.type === "no_default") {
    return `Reset behaviour is "Custom Scene" but no scene named "Default" was found. Create scene named "Default".`;
  }
  if (warning.type === "scene_name_clash") {
    return `Duplicate scene with name ${warning.data}. Ensure all scene names are unique.`;
  }
  if (warning.type === "zone_name_clash") {
    return `Duplicate zone with name ${warning.data}. Ensure all zone names are unique.`;
  }
  if (warning.type === "scene_name_colon") {
    return `Scene name ${warning.data} contains ":". Ensure all scene names do not contain colons.`;
  }
  if (warning.type === "zone_name_colon") {
    return `Zone name ${warning.data} contains ":". Ensure all zone names do not contain colons.`;
  }
  return "";
}

function WarningDisplay({ warning }: { warning: StaticWarning }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ p: "5px", backgroundColor: "#E9D502" }}
    >
      <WarningAmberIcon />
      <Typography>{warningDisplayText(warning)}</Typography>
    </Stack>
  );
}

export type LogMessage = {
  log: string;
  time: Date;
};

export default function HueController({
  connection,
  startupMode,
  errorCallback,
  resetBehaviourDone,
}: {
  connection: SyncedHueBridgeConnection;
  startupMode: boolean;
  errorCallback: (error: HueV2ResponseError) => void;
  resetBehaviourDone: () => void;
}) {
  const cogsConnection = useTypedCogsConnection();

  const [logMessages, setLogMessages] = useState<LogMessage[]>([]);

  const addLog = useCallback(
    (log: string) => {
      setLogMessages((prev) => prev.concat([{ log, time: new Date() }]));
    },
    [setLogMessages],
  );

  const doScene = useCallback(
    (id: string, duration?: number) => {
      putScene(connection, id, {
        recall: { action: "active", duration },
      }).then((response) => {
        if (response.result === "error") {
          errorCallback(response);
        }
      });
    },
    [connection, errorCallback],
  );

  const doSceneCommand = useCallback(
    (command: string) => {
      const { name, duration } = parseCommand(command);
      const showScene = connection.syncedData.scenes.filter(
        (scene) => scene.name === name,
      )[0];
      if (showScene) {
        addLog(`Executing: “Set Zone To Scene” for scene "${name}"`);
        doScene(showScene.id, duration);
      } else {
        addLog(
          `Ignored “Set Zone To Scene” for scene "${name}". Scene does not exist.`,
        );
      }
    },
    [connection, doScene, addLog],
  );

  const doLightgroupOff = useCallback(
    (lightgroup_id: string, duration?: number) => {
      putGroupedLight(connection, lightgroup_id, {
        on: { on: false },
        dynamics: { duration },
      }).then((response) => {
        if (response.result === "error") {
          errorCallback(response);
        }
      });
    },
    [connection, errorCallback],
  );

  const doZoneOffCommand = useCallback(
    (command: string) => {
      const { name, duration } = parseCommand(command);
      const zone = connection.syncedData.zones.filter(
        (zone) => zone.name === name,
      )[0];
      if (zone) {
        addLog(`Executing: “Set Zone Off” for zone "${name}"`);
        doLightgroupOff(zone.lightgroupId, duration);
      } else {
        addLog(
          `Ignored “Set Zone Off” for zone "${name}". Zone does not exist.`,
        );
      }
    },
    [connection, doLightgroupOff, addLog],
  );

  const doDevice = useCallback(
    (id: string, on: boolean, duration?: number) => {
      putLight(connection, id, {
        on: { on },
        dynamics: { duration },
      }).then((response) => {
        if (response.result === "error") {
          errorCallback(response);
        }
      });
    },
    [connection, errorCallback],
  );

  const doDeviceCommand = useCallback(
    (command: string, on: boolean) => {
      const { name, duration } = parseCommand(command);
      const light = connection.syncedData.lights.filter(
        (light) => light.name === name,
      )[0];
      if (light) {
        addLog(`Executing: “Set Device On/Off” for device "${name}"`);
        doDevice(light.id, on, duration);
      } else {
        addLog(
          `Ignored “Set Device On/Off” for device "${name}". Device does not exist.`,
        );
      }
    },
    [connection, doDevice, addLog],
  );

  useCogsEvent(cogsConnection, "Set Zone To Scene", (command) => {
    doSceneCommand(command);
  });

  useCogsEvent(cogsConnection, "Set Zone Off", (command) => {
    doZoneOffCommand(command);
  });

  useCogsEvent(cogsConnection, "Set Device Off", (command) => {
    doDeviceCommand(command, false);
  });

  useCogsEvent(cogsConnection, "Set Device On", (command) => {
    doDeviceCommand(command, true);
  });

  const resetBehaviour = useCogsConfig(cogsConnection)["Reset Behaviour"];

  const resetCallback = useCallback(() => {
    if (resetBehaviour === "All Off") {
      addLog(`Executing: Reset "All Off"`);
      doLightgroupOff(connection.syncedData.bridgeHomeLightgroupId);
    } else if (resetBehaviour === "Default Scene") {
      addLog(`Executing: Reset "Default Scene"`);
      doSceneCommand("Default");
    }
  }, [resetBehaviour, doSceneCommand, doLightgroupOff, connection, addLog]);

  if (startupMode) {
    resetCallback();
    resetBehaviourDone();
  }

  useEffect(() => {
    const listener = (event: CogsShowPhaseChangedEvent) => {
      if (event.showPhase === "setup") {
        resetCallback();
      }
    };
    cogsConnection.addEventListener("showPhase", listener);
    return () => {
      cogsConnection.removeEventListener("showPhase", listener);
    };
  }, [cogsConnection, resetCallback]);

  const staticWarnings = useMemo(() => {
    var warnings: StaticWarning[] = [];
    warnings = warnings.concat(
      getDuplicates(
        connection.syncedData.scenes.map((scene) => scene.name),
      ).map((duplicate) => ({
        type: "scene_name_clash",
        static: true,
        key: `scene_name_clash_${duplicate}`,
        data: duplicate,
      })),
    );
    warnings = warnings.concat(
      connection.syncedData.scenes
        .filter((scene) => scene.name.includes(":"))
        .map((scene) => ({
          type: "scene_name_colon",
          static: true,
          key: `scene_name_colon_${scene.name}`,
          data: scene.name,
        })),
    );
    warnings = warnings.concat(
      getDuplicates(connection.syncedData.zones.map((zone) => zone.name)).map(
        (duplicate) => ({
          type: "zone_name_clash",
          static: true,
          key: `zone_name_clash_${duplicate}`,
          data: duplicate,
        }),
      ),
    );
    warnings = warnings.concat(
      connection.syncedData.zones
        .filter((zone) => zone.name.includes(":"))
        .map((zone) => ({
          type: "zone_name_colon",
          static: true,
          key: `zone_name_colon_${zone.name}`,
          data: zone.name,
        })),
    );
    if (
      resetBehaviour === "Default Scene" &&
      !connection.syncedData.scenes.some((scene) => scene.name === "Default")
    ) {
      warnings.push({ type: "no_default", static: true, key: "no_default" });
    }
    return warnings;
  }, [connection, resetBehaviour]);

  console.log(staticWarnings);

  const [tab, setTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Stack direction="column" sx={{ height: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="basic tabs example"
          centered
        >
          <Tab
            icon={<EditIcon />}
            iconPosition="start"
            label="Setup"
            {...a11yProps(0)}
          />
          <Tab
            icon={<ListIcon />}
            iconPosition="start"
            label="Console"
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <Stack direction="column" spacing={1}>
          {staticWarnings.map((warning) => (
            <WarningDisplay warning={warning} />
          ))}
        </Stack>
        <Typography variant="h3">Zones</Typography>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
            gap: 2,
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          {connection.syncedData.zones.map((zone) => {
            return (
              <Card key={zone.id}>
                <CardContent>
                  <List
                    dense
                    subheader={
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                          pb: "4px",
                        }}
                      >
                        <Typography variant="h6">{zone.name}</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            doLightgroupOff(zone.lightgroupId);
                          }}
                        >
                          Off
                        </Button>
                      </Stack>
                    }
                  >
                    {connection.syncedData.scenes
                      .filter((scene) => scene.lightgroupId === zone.id)
                      .map((scene) => {
                        return (
                          <ListItem disableGutters>
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <Typography>{scene.name}</Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  doScene(scene.id);
                                }}
                              >
                                Set
                              </Button>
                            </Stack>
                          </ListItem>
                        );
                      })}
                  </List>
                </CardContent>
              </Card>
            );
          })}
        </Box>
        <Typography variant="h3">Devices</Typography>
        <Stack direction="column" spacing={2}>
          {connection.syncedData.lights
            .flatMap((light) => [light, light, light, light, light])
            .map((light) => {
              return (
                <Card key={light.id} sx={{ width: "30em" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography>{light.name}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            doDevice(light.id, false);
                          }}
                        >
                          Off
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            doDevice(light.id, true);
                          }}
                        >
                          On
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
        </Stack>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Stack spacing={1}>
          {logMessages.map((log) => (
            <Box sx={{ backgroundColor: "lightgrey" }}>
              <Typography>
                {log.time.toISOString()}: {log.log}
              </Typography>
            </Box>
          ))}
        </Stack>
      </TabPanel>
    </Stack>
  );
}
