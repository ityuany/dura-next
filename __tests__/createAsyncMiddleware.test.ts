import { configura, defineStore } from "..";
import { createAsyncMiddleware } from "../src/createAsyncMiddleware";

const userModel = defineStore({
  namespace: "user",
  state: {
    /** 姓名 */
    name: "张三",
  },
  reducers: {
    onChangeName(state, action: any) {
      console.log("action->", action);

      return { ...state, name: action.payload.name };
    },
  },
  effects: {},
});

describe("test dura-async", function () {
  it("test async middleware", function () {
    let name = "张三";
    let effects = {
      user: {
        async hello(getState, action) {
          name = action.payload.name;
        },
      },
    };
    const asyncMiddleware = createAsyncMiddleware(
      (namespace, methodName) => effects[namespace][methodName]
    );
    const storeFactory = configura({
      middlewares: [asyncMiddleware],
    });
    const prepare = storeFactory([userModel]);
    expect(name).toEqual("张三");
    prepare().dispatch({ type: "user/hello", payload: { name: "xx" } });
    expect(name).toEqual("xx");
  });
});
