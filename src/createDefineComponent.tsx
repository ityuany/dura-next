import React, { useRef, memo, useEffect, useState } from "react";
import { DURA_PATCHES_SYMBOL } from "./Symbol";
import { createProxy } from "./createProxy";

function useMonitor(reduxStore) {
  const [, setCount] = useState(0);
  const deps = useRef<Map<string, number>>(new Map<string, number>());
  const storeProxyRef = useRef(
    createProxy(reduxStore.getState(), deps.current)
  );
  const storeOriginalRef = useRef(reduxStore.getState());
  useEffect(
    () =>
      reduxStore.subscribe(() => {
        const originalStore = reduxStore.getState();
        const proxyStore = createProxy(originalStore, deps.current);
        const memo = deepEqualProxyStore(proxyStore, deps.current);
        if (!memo) {
          storeProxyRef.current = proxyStore;
          storeOriginalRef.current = originalStore;
          deps.current.clear();
          //TODO 更新逻辑需要优化
          setCount(Math.random());
        }
      }),
    []
  );
  return [storeProxyRef];
}

function calcArguments(...args) {
  let storePropsKey = "store";

  let defaultProps = {};

  const ComponentOfDuraDefault = (ownProps) => <></>;

  let UComponent = ComponentOfDuraDefault;

  let index = -1;
  while (++index < args.length) {
    const argument = args[index];
    if (typeof argument === "string") {
      storePropsKey = argument;
    }
    if (typeof argument === "object") {
      defaultProps = argument;
    }
    if (typeof argument === "function") {
      UComponent = argument;
    }
  }
  return {
    storePropsKey,
    defaultProps,
    UComponent,
  };
}

export function createDefineComponent(reduxStore) {
  return function defineComponent(...args) {
    const { storePropsKey, defaultProps, UComponent } = calcArguments(...args);
    return memo(function ComponentOfDura(ownProps) {
      const [storeProxyRef] = useMonitor(reduxStore);
      return (
        <>
          <UComponent
            {...{
              ...defaultProps,
              ...ownProps,
              [storePropsKey]: storeProxyRef.current,
            }}
          />
        </>
      );
    }, createShallowEqual(storePropsKey));
  };
}

function deepEqualProxyStore<P, D extends Map<string, number>>(
  nextPropsStore: P,
  deps: D
) {
  const values = Object.values(nextPropsStore);
  let index = -1;
  while (++index < values.length) {
    const patches = values[index][DURA_PATCHES_SYMBOL];
    if (patches?.length > 0) {
      const hasDependencies = patches.some((n: string) => deps.has(n));
      if (hasDependencies) {
        return false;
      }
    }
  }
  return true;
}

function createShallowEqual(propsKey: string) {
  return function shallowEqual(prevProps, nextProps) {
    const filterStore = (key: string) => key !== propsKey;
    const prevPropsKey = Object.keys(prevProps).filter(filterStore);
    const nextPropsKey = Object.keys(nextProps).filter(filterStore);
    if (prevPropsKey.length !== nextPropsKey.length) {
      return false;
    }
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    let index = -1;
    const len = prevPropsKey.length;
    while (++index < len) {
      const prevKey = prevPropsKey[index];
      const nextPropsHasOwnProperty = hasOwnProperty.call(nextProps, prevKey);

      const referenceEqual = prevProps[prevKey][DURA_PATCHES_SYMBOL]
        ? shallowEqual(prevProps[prevKey], nextProps[prevKey])
        : prevProps[prevKey] === nextProps[prevKey];
      if (!nextPropsHasOwnProperty || !referenceEqual) {
        return false;
      }
    }
    return true;
  };
}
