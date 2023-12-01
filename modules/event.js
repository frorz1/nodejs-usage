const EventEmitter = require("node:events");

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    setTimeout(this.emit.bind(this, "test", 123), 3000);
  }
}

const myEmitter = new MyEmitter();
const listener = (res) => {
  console.log(res);
};
myEmitter.addListener("test", listener);

setTimeout(() => {
  myEmitter.emit("test", 456);
  // remove之后，之前的emit不会再触发
  myEmitter.removeListener("test", listener);
}, 1000);

const target = new EventTarget();
target.addEventListener("foo", (res) => {
  console.log(res);
});

const event = new Event("foo");

target.dispatchEvent(event);
