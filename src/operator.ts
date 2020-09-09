import type { ReducersMapObject } from "redux";
import type { EffectsMapObject, Store } from "./types";
import invariant from "invariant";
import { produceWithPatches, produce } from "immer";
import { defineHiddenConstantProperty } from "./defineHiddenConstantProperty";
import { DURA_PATCHES_SYMBOL } from "./Symbol";

export function operatorFactory() {
  const reducers: ReducersMapObject = {};
  const effects: EffectsMapObject = {};

  function use<N extends string, S, P extends Store<N, S>[]>(...storeArray: P) {
    let index = -1;
    while (++index < storeArray.length) {
      const store = storeArray[index];
      invariant(
        !(store.namespace in reducers),
        "store already exists, please note that the namespace needs to be unique!"
      );
      reducers[store.namespace] = function (state = store.state, action) {
        const [, reducerName] = action.type.split("/");
        const [nextState, patches] = produceWithPatches(function (draftState) {
          store.reducers[reducerName]?.(draftState, action);
        })(state);
        const patchesOfStringify = patches.map(
          (n) => `${store.namespace}.${n.path.join(".")}`
        );
        defineHiddenConstantProperty(
          nextState,
          DURA_PATCHES_SYMBOL,
          patchesOfStringify
        );
        return nextState;
      };

      effects[store.namespace] = store.effects;
    }
  }

  function unUse<N extends string, S, P extends Store<N, S>[]>(
    ...storeArray: P
  ) {
    let index = -1;
    while (++index < storeArray.length) {
      const store = storeArray[index];
      delete reducers[store.namespace];
      delete effects[store.namespace];
    }
  }

  function has(namespace: string) {
    return namespace in reducers;
  }

  function getReducers() {
    return reducers;
  }

  function getEffects() {
    return effects;
  }

  return {
    use,
    unUse,
    getReducers,
    getEffects,
    has,
  };
}
