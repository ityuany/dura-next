import type { Store, Namespace } from "./types";

export function defineStore<N extends Namespace, S>(store: Store<N, S>) {
  return store;
}
