export interface ConfiguraOptions {
  enhancers?: import("redux").StoreEnhancer[];
  middlewares?: import("redux").Middleware[];
  compose?: any;
}

export type Namespace = string | number | symbol;

export interface MapObject<V = any> {
  [name: string]: V;
}

export interface GetStateFn<S> {
  (): S;
}

export interface Effect<S> {
  (getState: GetStateFn<S>, action: import("redux").AnyAction): Promise<void>;
}

export interface Reducer<S = any> {
  (state: S, action): void;
}

export interface Reducers<S> {
  [name: string]: Reducer<S>;
}

export interface EffectsMapObject {
  [name: string]: Effects<any>;
}

export type Effects<S> = MapObject<Effect<S>>;

export interface Store<N extends Namespace, S = MapObject, R = Reducers<S>> {
  namespace: N;
  state: S;
  reducers?: R;
  effects?: Effects<any>;
}

export type ExtractStateByStoreUnion<T> = T extends Store<infer N, infer S>
  ? {
      [K in N]: {
        [SK in keyof S]: S[SK];
      };
    }
  : never;

export type UnionToIntersection<T> = (
  T extends any ? (param: T) => any : never
) extends (param: infer P) => any
  ? P
  : never;

export type ReactFC<T extends string, SS = {}, P = {}> = React.FC<
  { [K in T]: SS } & P
>;

export interface DefineComponent<N extends string, SS> {
  (functionComponent: ReactFC<N, SS>): React.FC;
  <P extends MapObject>(functionComponent: ReactFC<N, SS, P>): React.FC<P>;
}

export type Return<T> = <
  N extends string,
  S extends MapObject,
  P extends Store<N, S>[],
  GS = UnionToIntersection<ExtractStateByStoreUnion<P[number]>>
>(
  ...thunkStores: P
) => import("redux").Store<T & GS> & {
  use: () => () => void;
  defineComponent: DefineComponent<"store", T & GS>;
  defineStoreName: <N extends string>(
    name: N
  ) => { defineComponent: DefineComponent<N, T & GS> };
};
