CommonJS里面的模块其实就是个对象，require就是调用模块中的属性。

CommonJs内置了exports和module.exports等变量，可以通过webpack打包的产物查看require和module的具体实现
## 原文件
```js
console.log("require");
exports.name = "hello world";
exports.say = function () {
  console.error.log("say");
};

module.exports.run = function () {
  console.error.log("run");
};

setTimeout(() => {
  console.log("exports: ", exports);
  console.log("module.exports: ", module.exports);
}, 3000);

```

## 产物
```js
// 使用自执行函数的目的是，每个文件都应该是一个单独的作用域，不能互相影响
(() => {
  // 可以看到入口文件即其其他模块其实就是一个对象的属性，它是一个方法
  var __webpack_modules__ = {
    "./src/lib/index.js": (module, exports) => {
      eval(
        'console.log("require");\nexports.name = "hello world";\nexports.say = function () {\n  console.error.log("say");\n};\n\nmodule.exports.run = function () {\n  console.error.log("run");\n};\n\nsetTimeout(() => {\n  console.log("exports: ", exports);\n  console.log("module.exports: ", module.exports);\n}, 3000);\n\n\n//# sourceURL=webpack://nodejs-usage/./src/lib/index.js?'
      );
    },

    "./src/module-explain.js": (
      __unused_webpack_module,
      __unused_webpack_exports,
      __webpack_require__
    ) => {
      eval(
        'console.log("start require");\nconst result = __webpack_require__(/*! ./lib/index */ "./src/lib/index.js");\nresult.age = 10;\nconsole.log("end require");\n\n\n//# sourceURL=webpack://nodejs-usage/./src/module-explain.js?'
      );
    },
  };
  var __webpack_module_cache__ = {};

  function __webpack_require__(moduleId) {
   // Check if module is in cache
   var cachedModule = __webpack_module_cache__[moduleId];
   if (cachedModule !== undefined) {
     return cachedModule.exports;
    
    }
   // Create a new module (and put it into the cache)
   var module = (__webpack_module_cache__[moduleId] = {
     // no module.id needed
     // no module.loaded needed
     exports: {},
    
    });
  
   // Execute the module function
   __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__
    );
  
   // Return the exports of the module
   return module.exports;
  
  }

  /************************************************************************/

 // 自动执行入口文件
 var __webpack_exports__ = __webpack_require__(
    "./src/module-explain.js"
  );
})();

```

## require
__webpack_require__接收一个path，并从__webpack_modules__中找到对应的方法执行，而模块内部使用的exports, module.exports其实是方法执行时传入的，参考这一部分
```js
var module = (__webpack_module_cache__[moduleId] = {
  // no module.id needed
  // no module.loaded needed
  exports: {},

});

// Execute the module function
// 这里传入了module和exports，所以在模块内部可以直接使用exports.xxx和module.exports.xxx
// 但其实他们是一个对象。修改一个的属性也会影响另一个
__webpack_modules__[moduleId](
  module,
  module.exports,
  __webpack_require__
);

// Return the exports of the module
return module.exports;
```

## exports和module.exports
```js
"./src/lib/index.js": (module, exports) => {
    // [...]
  },
```
我们在产物里看到，每一个模块都接受两个或三个参数，module, exports, require。 require之前已经说过了。而exports其实就是module对象的一个属性
```js
var module = {
  // no module.id needed
  // no module.loaded needed
  exports: {},

});
```
所以如果我们使用`exports.name='fet'`, 那么module.exports里面也会有这个属性，因为两个对象指向同一块内存地址。
但如果使用了 `module.exports = {}` 那么它就不再指向exports对应的内存地址了，就无法再互相影响。


