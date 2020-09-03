import { defineHiddenConstantProperty } from "../src/defineHiddenConstantProperty";

describe("test defineHiddenConstantProperty", function () {
  it("test defineProperty", function () {
    const target = {
      name: "张三",
    };
    expect(target.name).toEqual("张三");
    expect(target["sex"]).toBeUndefined();
    defineHiddenConstantProperty(target, "sex", "男");
    expect(target["sex"]).toEqual("男");
  });

  // it("test write", function () {
  //   const target = {};
  //   defineHiddenConstantProperty(target, "name", "张三");
  //   expect(() => defineHiddenConstantProperty(target, "name", "李四")).toThrow(
  //     "Cannot redefine property: name"
  //   );
  //   expect(() => {
  //     target["name"] = "李四";
  //   }).toThrow(
  //     "Cannot assign to read only property 'name' of object '#<Object>"
  //   );
  // });

  // it("test configurable", function () {
  //   const target = {};
  //   defineHiddenConstantProperty(target, "name", "张三");
  //   expect(() => {
  //     delete target["name"];
  //   }).toThrow("Cannot delete property 'name' of #<Object>");

  //   expect(() => {
  //     Object.defineProperty(target, "name", {
  //       writable: true,
  //       value: "张三",
  //     });
  //   }).toThrow("Cannot redefine property: name");
  // });
});
