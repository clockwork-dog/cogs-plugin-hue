import { Alert, Button, Stack } from "@mui/material";
import { useDispatch } from "react-redux";
import { loggingActions } from "../store/features/logging/loggingSlice";
import { useSelector } from "../store/store";

export default function Console() {
  const logMessages = useSelector((state) => state.logging.logs);
  const dispatch = useDispatch();

  return (
    <>
      <Button
        onClick={() => {
          dispatch(loggingActions.clear());
        }}
      >
        Clear
      </Button>
      <Stack spacing={0.5}>
        {logMessages.map((log) => (
          <Alert variant="filled" severity={log.level} key={log.id}>
            {new Date(log.datetime).toLocaleString()}: {log.message}
          </Alert>
        ))}
      </Stack>
    </>
  );
}
