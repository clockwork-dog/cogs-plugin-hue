import { configureStore, MiddlewareAPI } from "@reduxjs/toolkit";
import {
  useSelector as reactReduxUseSelector,
  TypedUseSelectorHook,
} from "react-redux";
import { TypedCogsConnection } from "../hooks/useTypedCogsConnection";
import hueReducer from "./features/hue/hueSlice";
import loggingReducer from "./features/logging/loggingSlice";
import { createCogsMiddleware } from "./middleware/cogsMiddleware";
import { createHueBridgeMiddleware } from "./middleware/hueBridgeMiddleware";
import { createLoggingMiddleware } from "./middleware/loggingMiddleware";

export const createStore = (cogsConnection: TypedCogsConnection) =>
  configureStore({
    reducer: { logging: loggingReducer, hue: hueReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([
        createCogsMiddleware(cogsConnection),
        createHueBridgeMiddleware(),
        createLoggingMiddleware(),
      ]),
  });

type Store = ReturnType<typeof createStore>;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<Store["getState"]>;
export type AppDispatch = Store["dispatch"];
export type AppMiddlewareAPI = MiddlewareAPI<AppDispatch, RootState>;

export const useSelector: TypedUseSelectorHook<RootState> =
  reactReduxUseSelector;
