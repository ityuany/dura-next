import { configura, defineStore, Action } from "..";
import { DURA_STORE_EFFECTS, DURA_STORE_REDUCERS } from "../src/Symbol";

interface OnChangeShowPayload {
  isShow: boolean;
}

interface OnChangeNamePayload {
  name: string;
}

const user = defineStore({
  namespace: <const>"user",
  state: {
    newName: "x",
    oriName: "default",
    isShow: false,
  },
  reducers: {
    onChangeName(state, action: Action<OnChangeNamePayload>) {
      state.newName = action.payload.name;
    },
    onChangeShow(state, action: Action<OnChangeShowPayload>) {
      state.isShow = action.payload.isShow;
    },
    onChangeOriName(state, action) {
      state.oriName = String(Math.random());
    },
    onChangeIsShow(state, action) {
      state.isShow = !state.isShow;
    },
  },
  effects: {
    async onAsyncChangeName(action) {},
  },
});

const order = {
  namespace: <const>"order",
  state: {
    orderId: 12,
  },
  reducers: {
    changeOrderId(state, action) {
      state.orderId = 100;
    },
  },
  effects: {},
};

describe("test", function () {
  it("dd", function () {
    const createStoreFactory = configura();

    const prepare = createStoreFactory([user]);
    console.log(prepare()[DURA_STORE_REDUCERS]);
    console.log(prepare()[DURA_STORE_EFFECTS]);

    const factory = prepare(order);

    const unUse = factory.use();

    factory.defineComponent(function (props) {
      props.store.user.newName;

      props.store.order;
      return null;
    });

    factory.defineComponent<{ name1: string }>(function (props) {
      props.store.user.isShow = false;
      return null;
    });

    factory.defineComponent("a", function (props) {
      props.a.order.orderId;
      return null;
    });

    factory.defineComponent<"ss", { name1: string }>("ss", function (props) {
      props.ss.order.orderId;
      props.name1;

      return null;
    });

    console.log(prepare()[DURA_STORE_REDUCERS]);
    console.log(prepare()[DURA_STORE_EFFECTS]);
  });
});
