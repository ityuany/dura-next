import type {
  ConfiguraOptions,
  MapObject,
  Store,
  UnionToIntersection,
  ExtractStateByStoreUnion,
  Return,
  Namespace,
} from "./src/types";

export function configura(
  options?: ConfiguraOptions
): <
  N extends string,
  S extends MapObject,
  P extends Store<N, S>[],
  GS = UnionToIntersection<ExtractStateByStoreUnion<P[number]>>
>(
  stores: P,
  preloadState?: import("redux").PreloadedState<GS>
) => Return<GS>;

export function defineStore<N extends Namespace, S>(
  store: Store<N, S>
): Store<N, S>;
