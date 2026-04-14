import { Middleware } from "@reduxjs/toolkit";
import { AppMiddlewareAPI } from "../store";

export const createLoggingMiddleware = (): Middleware => {
  return (api: AppMiddlewareAPI) => {
    const { dispatch, getState } = api;
    return (next) => (action) => {
      const result = next(action);

      return result;
    };
  };
};
