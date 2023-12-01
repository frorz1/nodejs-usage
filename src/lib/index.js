console.log("require");
exports.name = "hello world";
exports.say = function () {
  console.error.log("say");
};

module.exports = function () {
  console.error.log("run");
};

setTimeout(() => {
  console.log("exports: ", exports);
  console.log("module.exports: ", module.exports);
}, 3000);
