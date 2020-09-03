export function createAsyncMiddleware(getEffects) {
  return (store) => (next) => (action) => {
    const [namespace, methodName] = action.type.split("/");
    const effect = getEffects(namespace, methodName);
    if (effect) {
      const getState = () => {
        if (process.env.NODE_ENV === "production") {
          return store.getState();
        }
        return Object.freeze(store.getState());
      };
      effect(getState, action);
    }
    return next(action);
  };
}
