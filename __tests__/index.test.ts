import { configura } from "..";
import { DURA_STORE_EFFECTS, DURA_STORE_REDUCERS } from "../src/Symbol";

const user = {
  namespace: <const>"user",
  state: {
    name: "x",
    oriName: "default",
    isShow: false,
  },
  reducers: {
    onChangeName(state, { payload: { id, name } }) {
      state.users[id].name = name;
    },
    onChangeStreetAddress(state, { payload: { id, streetAddress } }) {
      state.users[id].streetAddress = streetAddress;
    },
    onChangeOriName(state, action) {
      state.oriName = String(Math.random());
    },
    onChangeIsShow(state, action) {
      state.isShow = !state.isShow;
    },
  },
  effects: {},
};

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
    factory.use();

    factory.defineComponent(function (props) {
      props.store.order;
      return null;
    });

    factory.defineComponent("ss", function (props) {
      props.ss.order;
      return null;
    });

    factory.defineComponent("ss", { name1: "" }, function (props) {
      props.ss.order;
      props.name1;
      return null;
    });

    factory.defineComponent({ name1: "" }, function (props) {
      props.store.user;
      return null;
    });

    console.log(prepare()[DURA_STORE_REDUCERS]);
    console.log(prepare()[DURA_STORE_EFFECTS]);
  });
});
