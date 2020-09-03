export function defineHiddenConstantProperty(target, name, value) {
  Object.defineProperty(target, name, {
    value: value,
    enumerable: true,
    writable: false,
    configurable: true,
  });
}
