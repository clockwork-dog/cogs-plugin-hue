import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LogMessage, LogMessageWithId } from "./logging";

export interface LoggingState {
  logs: LogMessageWithId[];
  currentId: number;
}

const initialState: LoggingState = {
  logs: [],
  currentId: 0,
};

const MAX_LOG_LENGTH = 100;

export const loggingSlice = createSlice({
  name: "logging",
  initialState,
  reducers: {
    log: (state, action: PayloadAction<LogMessage>) => {
      state.logs.push({ ...action.payload, id: state.currentId });
      state.currentId++;
      if (state.logs.length > MAX_LOG_LENGTH) {
        state.logs = state.logs.slice(-MAX_LOG_LENGTH);
      }
    },
    clear: (state) => {
      state.logs = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const loggingActions = loggingSlice.actions;

export default loggingSlice.reducer;
