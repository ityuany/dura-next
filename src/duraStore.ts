import { defineStore } from "./defineStore";

export default defineStore({
  namespace: "@@DURA",
  state: {
    REFRESH: 0,
  },
  reducers: {
    UPDATE(state, { payload: { REFRESH } }) {
      state.REFRESH = REFRESH + Math.random();
      return state;
    },
  },
});
