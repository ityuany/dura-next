import type { PreloadedState } from "redux";
import type {
  ConfiguraOptions,
  MapObject,
  Store,
  UnionToIntersection,
  ExtractStateByStoreUnion,
  Return,
} from "./types";
import {
  compose as reduxCompose,
  applyMiddleware,
  combineReducers,
  createStore,
} from "redux";
import { operatorFactory } from "./operator";
import { DURA_STORE_EFFECTS, DURA_STORE_REDUCERS } from "./Symbol";
import { defineHiddenConstantProperty } from "./defineHiddenConstantProperty";
import { enablePatches, setAutoFreeze } from "immer";
import { useMonitor } from "./createDefineComponent";
import duraStore from "./duraStore";
import { createAsyncMiddleware } from "./createAsyncMiddleware";
import { useEffect, useLayoutEffect, useState } from "react";

enablePatches();
setAutoFreeze(false);

export const defaultConfiguraOptions: ConfiguraOptions = {
  middlewares: [],
  enhancers: [],
  compose: reduxCompose,
};

export * from "./defineStore";

export function configura(options?: ConfiguraOptions) {
  return function createStoreFactory<
    N extends string,
    S extends MapObject,
    P extends Store<N, S>[],
    GS = UnionToIntersection<ExtractStateByStoreUnion<P[number]>>
  >(stores: P, preloadState?: PreloadedState<GS>): Return<GS> {
    const { middlewares = [], enhancers = [], compose = reduxCompose } =
      options ?? defaultConfiguraOptions;

    const operator = operatorFactory();

    operator.use(...stores, duraStore);

    const reduxStore = createStore(
      combineReducers(operator.getReducers()),
      preloadState,
      compose(
        applyMiddleware(
          ...middlewares,
          createAsyncMiddleware(
            (namespace, effectName) =>
              operator.getEffects()?.[namespace]?.[effectName]
          )
        ),
        ...enhancers
      )
    );

    return function prepare(...thunkStores) {
      const key = thunkStores.map((n) => n.namespace).join(".");

      function useMountStore() {
        const [count, setCount] = useState(0);
        useLayoutEffect(() => {
          UNSAFE_use(...thunkStores);
          UNSAFE_refresh();
          setCount(Math.random());
          return () => {
            UNSAFE_unUse(...thunkStores);
            UNSAFE_refresh();
            setCount(Math.random());
          };
        }, []);
        return count;
      }

      function useStore(deps = []) {
        return useMonitor(reduxStore, deps, key);
      }

      function UNSAFE_refresh() {
        reduxStore.dispatch({
          type: "@@DURA/UPDATE",
          payload: { REFRESH: key },
        });
      }

      function UNSAFE_use(...args) {
        operator.use(...args);
        reduxStore.replaceReducer(combineReducers(operator.getReducers()));
      }

      function UNSAFE_unUse(...args) {
        operator.unUse(...args);
        reduxStore.replaceReducer(combineReducers(operator.getReducers()));
      }

      const factory = {
        ...reduxStore,
        useStore,
        useMountStore,
      };

      defineHiddenConstantProperty(
        factory,
        DURA_STORE_REDUCERS,
        operator.getReducers()
      );
      defineHiddenConstantProperty(
        factory,
        DURA_STORE_EFFECTS,
        operator.getEffects()
      );

      return factory;
    };
  };
}
