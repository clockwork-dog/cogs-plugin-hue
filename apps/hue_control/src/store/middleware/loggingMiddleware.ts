import { Middleware } from "@reduxjs/toolkit";
import { AppMiddlewareAPI } from "../store";

export const createLoggingMiddleware = (): Middleware => {
  return (api: AppMiddlewareAPI) => {
    const { getState } = api;
    return (next) => (action) => {
      console.log("Action:", action, ", state:", getState());

      const result = next(action);

      return result;
    };
  };
};
