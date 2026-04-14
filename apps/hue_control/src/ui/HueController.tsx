import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { hueActions } from "../store/features/hue/hueSlice";
import { loggingActions } from "../store/features/logging/loggingSlice";
import { useSelector } from "../store/store";

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
  | "light_name_clash"
  | "no_default"
  | "scene_name_colon"
  | "zone_name_colon"
  | "light_name_colon";

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
  if (warning.type === "light_name_clash") {
    return `Duplicate device with name ${warning.data}. Ensure all device names are unique.`;
  }
  if (warning.type === "scene_name_colon") {
    return `Scene name ${warning.data} contains ":". Ensure all scene names do not contain colons.`;
  }
  if (warning.type === "zone_name_colon") {
    return `Zone name ${warning.data} contains ":". Ensure all zone names do not contain colons.`;
  }
  if (warning.type === "light_name_colon") {
    return `Device name ${warning.data} contains ":". Ensure all device names do not contain colons.`;
  }
  return "";
}

function WarningDisplay({ warning }: { warning: StaticWarning }) {
  return (
    <Alert variant="filled" severity="warning">
      {warningDisplayText(warning)}
    </Alert>
  );
}

export type LogMessage = {
  log: string;
  time: Date;
};

export default function HueController() {
  const dispatch = useDispatch();

  const { phase, resetBehaviour } = useSelector((state) => state.hue);

  const [tab, setTab] = useState(0);

  if (phase.type === "authenticated_synced") {
    const syncedData = phase.syncedData;
    const getStaticWarnings = () => {
      var warnings: StaticWarning[] = [];
      warnings = warnings.concat(
        getDuplicates(syncedData.scenes.map((scene) => scene.name)).map(
          (duplicate) => ({
            type: "scene_name_clash",
            static: true,
            key: `scene_name_clash_${duplicate}`,
            data: duplicate,
          }),
        ),
      );
      warnings = warnings.concat(
        syncedData.scenes
          .filter((scene) => scene.name.includes(":"))
          .map((scene) => ({
            type: "scene_name_colon",
            static: true,
            key: `scene_name_colon_${scene.name}`,
            data: scene.name,
          })),
      );
      warnings = warnings.concat(
        getDuplicates(syncedData.zones.map((zone) => zone.name)).map(
          (duplicate) => ({
            type: "zone_name_clash",
            static: true,
            key: `zone_name_clash_${duplicate}`,
            data: duplicate,
          }),
        ),
      );
      warnings = warnings.concat(
        syncedData.zones
          .filter((zone) => zone.name.includes(":"))
          .map((zone) => ({
            type: "zone_name_colon",
            static: true,
            key: `zone_name_colon_${zone.name}`,
            data: zone.name,
          })),
      );
      warnings = warnings.concat(
        getDuplicates(syncedData.lights.map((light) => light.name)).map(
          (duplicate) => ({
            type: "light_name_clash",
            static: true,
            key: `light_name_clash_${duplicate}`,
            data: duplicate,
          }),
        ),
      );
      warnings = warnings.concat(
        syncedData.lights
          .filter((light) => light.name.includes(":"))
          .map((light) => ({
            type: "light_name_colon",
            static: true,
            key: `light_name_colon_${light.name}`,
            data: light.name,
          })),
      );
      if (
        resetBehaviour === "Default Scene" &&
        !syncedData.scenes.some((scene) => scene.name === "Default")
      ) {
        warnings.push({ type: "no_default", static: true, key: "no_default" });
      }
      return warnings;
    };

    const staticWarnings = getStaticWarnings();

    return (
      <>
        {staticWarnings.length > 0 ? (
          <Stack direction="column" spacing={1} sx={{ pb: "30px" }}>
            {staticWarnings.map((warning) => (
              <WarningDisplay warning={warning} />
            ))}
          </Stack>
        ) : (
          <></>
        )}

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
          {syncedData.zones.map((zone) => {
            return (
              <Paper key={zone.id}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    width: "100%",
                    p: "16px",
                  }}
                >
                  <Typography variant="h6">{zone.name}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      dispatch(
                        loggingActions.log({
                          message: `Manual: “Set Zone Off” for zone "${zone.name}"`,
                          level: "info",
                          datetime: Date.now(),
                        }),
                      );
                      dispatch(hueActions.setZoneOff({ command: zone.name }));
                    }}
                  >
                    Off
                  </Button>
                </Stack>
                <Divider />
                <List dense>
                  {syncedData.scenes
                    .filter((scene) => scene.lightgroupId === zone.id)
                    .map((scene) => {
                      return (
                        <ListItem key={scene.id}>
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
                                dispatch(
                                  loggingActions.log({
                                    message: `Manual: “Set Zone To Scene” for scene "${scene.name}"`,
                                    level: "info",
                                    datetime: Date.now(),
                                  }),
                                );
                                dispatch(
                                  hueActions.setZoneToScene({
                                    command: scene.name,
                                  }),
                                );
                              }}
                            >
                              Set
                            </Button>
                          </Stack>
                        </ListItem>
                      );
                    })}
                </List>
              </Paper>
            );
          })}
        </Box>
        <Typography variant="h3" sx={{ pt: "30px" }}>
          Devices
        </Typography>
        <Stack
          direction="column"
          spacing={2}
          sx={{ marginTop: "10px", marginBottom: "10px" }}
        >
          {syncedData.lights
            //.flatMap((light) => [light, light, light, light, light])
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
                            dispatch(
                              loggingActions.log({
                                message: `Manual: “Set Device Off” for device "${light.name}"`,
                                level: "info",
                                datetime: Date.now(),
                              }),
                            );
                            dispatch(
                              hueActions.setDevice({
                                command: light.name,
                                on: false,
                              }),
                            );
                          }}
                        >
                          Off
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            dispatch(
                              loggingActions.log({
                                message: `Manual: “Set Device On" for device "${light.name}"`,
                                level: "info",
                                datetime: Date.now(),
                              }),
                            );
                            dispatch(
                              hueActions.setDevice({
                                command: light.name,
                                on: true,
                              }),
                            );
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
      </>
    );
  } else {
    return <></>;
  }
}
