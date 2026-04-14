import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TimeAgo from "react-timeago";
import { makeIntlFormatter } from "react-timeago/defaultFormatter";
import { hueActions } from "../store/features/hue/hueSlice";
import { useSelector } from "../store/store";
import Console from "./Console";
import HueController from "./HueController";

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

function ShowAfterTime({
  waitTime_ms,
  children,
}: {
  waitTime_ms: number;
  children?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, waitTime_ms);
  });

  return show ? children : <></>;
}
export function App() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const { phase, ipAddress } = useSelector((state) => state.hue);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const getMainTabContent = () => {
    if (ipAddress === "") {
      return (
        <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h3">IP address not set</Typography>
          <Typography>
            Enter an IP address in the plugin config to continue setup
          </Typography>
        </Stack>
      );
    }
    if (phase.type === "authenticated_synced") {
      return <HueController />;
    } else if (phase.type === "authenticated_not_synced") {
      return (
        <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h3">Syncing with Bridge</Typography>
          <CircularProgress />
        </Stack>
      );
    } else if (phase.type === "authenticating_with_bridge") {
      return (
        <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h3">Pairing with Bridge</Typography>
          <CircularProgress />
          <Alert severity="info">
            Press the button on the top of your Hue Bridge to continue
          </Alert>
        </Stack>
      );
    } else if (phase.type === "finding_bridge_id") {
      return (
        <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h3">Connecting to Hue Bridge</Typography>
          <CircularProgress />
          <ShowAfterTime waitTime_ms={5000}>
            <Alert severity="warning">
              Please check the IP is correct and that your Hue bridge has power
              and network lights on solid.
            </Alert>
          </ShowAfterTime>
        </Stack>
      );
    } else if (phase.type === "fail") {
      return (
        <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h3">Connection Failed</Typography>
          <Alert severity="error">
            Please turn your Hue bridge off and on again, then restart COGS.
          </Alert>
        </Stack>
      );
    } else if (phase.type === "waiting_for_cogs") {
      return (
        <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="h3">Loading Data</Typography>
          <CircularProgress />
        </Stack>
      );
    } else {
      // Unreachable
      return <></>;
    }
  };

  const timeAgoFormatter = makeIntlFormatter({ style: "narrow" });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Stack direction="column" sx={{ height: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tab} onChange={handleTabChange} centered>
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
        {phase.type === "authenticated_synced" ? (
          <Stack
            direction="row"
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              m: "15px",
              alignItems: "center",
            }}
            spacing={2}
          >
            <Typography>
              Last sync:{" "}
              <TimeAgo
                date={phase.lastSynced}
                minPeriod={60}
                formatter={timeAgoFormatter}
              />
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                dispatch(
                  hueActions.moveToState({
                    type: "authenticated_not_synced",
                    apiKeys: phase.apiKeys,
                    bridgeId: phase.bridgeId,
                  }),
                );
              }}
            >
              Sync
            </Button>
          </Stack>
        ) : (
          <></>
        )}
        <TabPanel value={tab} index={0}>
          {getMainTabContent()}
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <Console />
        </TabPanel>
      </Stack>
    </ThemeProvider>
  );
}
