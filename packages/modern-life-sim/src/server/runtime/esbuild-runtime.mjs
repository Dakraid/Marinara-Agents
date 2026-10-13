// esbuild export helpers and hoisted crypto import
var esbuildDefineProperty = Object.defineProperty;
var defineModuleExports = (target, getters) => {
  for (var key in getters) {
    esbuildDefineProperty(target, key, {
      get: getters[key],
      enumerable: true,
    });
  }
};

export { defineModuleExports };
