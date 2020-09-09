import {
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
} from "react";
import { DURA_PATCHES_SYMBOL } from "./Symbol";
import { createProxy } from "./createProxy";

export function useMonitor(reduxStore, subscribeDeps, key) {
  const [, setCount] = useState(0);
  const deps = useRef<Map<string, number>>(new Map<string, number>());
  const storeProxyRef = useRef(
    createProxy(reduxStore.getState(), deps.current)
  );
  const storeOriginalRef = useRef(reduxStore.getState());

  const subscribe = useCallback(() => {
    const originalStore = reduxStore.getState();

    const proxyStore = createProxy(originalStore, deps.current);
    const memo = deepEqualProxyStore(proxyStore, deps.current, key);

    if (!memo) {
      storeProxyRef.current = proxyStore;
      storeOriginalRef.current = originalStore;
      deps.current.clear();
      //TODO 更新逻辑需要优化
      setCount(Math.random());
    }
  }, []);

  useLayoutEffect(() => reduxStore.subscribe(subscribe), []);

  useLayoutEffect(() => {
    const originalStore = reduxStore.getState();
    storeProxyRef.current = createProxy(originalStore, deps.current);
    storeOriginalRef.current = originalStore;
    deps.current.clear();
    //TODO 更新逻辑需要优化
    setCount(Math.random());
  }, subscribeDeps);
  return storeProxyRef.current;
}

function deepEqualProxyStore<P, D extends Map<string, number>>(
  nextPropsStore: P,
  deps: D,
  key
) {
  const values = Object.values(nextPropsStore);

  if (
    key &&
    nextPropsStore["@@DURA"][DURA_PATCHES_SYMBOL].includes("@@DURA.REFRESH") &&
    nextPropsStore["@@DURA"]["REFRESH"].startsWith(key)
  ) {
    return false;
  }

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
