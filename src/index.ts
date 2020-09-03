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
import { createDefineComponent } from "./createDefineComponent";

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

    operator.use(...stores);

    const reduxStore = createStore(
      combineReducers(operator.getReducers()),
      preloadState,
      compose(applyMiddleware(...middlewares), ...enhancers)
    );

    return function prepare(...thunkStores) {
      const defineComponent = createDefineComponent(reduxStore);

      function use() {
        operator.use(...thunkStores);
        reduxStore.replaceReducer(combineReducers(operator.getReducers()));
      }

      function unUse() {
        operator.unUse(...thunkStores);
        reduxStore.replaceReducer(combineReducers(operator.getReducers()));
      }

      const factory = {
        ...reduxStore,
        use,
        unUse,
        defineComponent,
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
