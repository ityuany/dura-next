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

export interface Action<P = {}, M = {}, E = ""> {
  type: string;
  payload: P;
  meta: M;
  error: E;
}

type WrapStore<
  N extends Namespace,
  S,
  T extends Store<N, S> = Store<N, S>
> = Omit<T, "reducers" | "effects"> & {
  reducers: {
    [K in keyof T["reducers"]]: (state: S, action: Action) => void;
  };
  effects: {
    [K in keyof T["effects"]]: (
      getState: <S>() => S,
      action: Action
    ) => Promise<void>;
  };
};

export function defineStore<N extends Namespace, S>(
  store: WrapStore<N, S>
): Store<N, S>;
