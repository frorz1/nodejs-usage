模拟一个简单的eventloop案例

```js
const eventLoop = {
  microQueue: [], // 微任务队列
  interactiveQueue: [], // 交互队列
  timeoutQueue: [], // 延时队列
  runningId: null,
  addTask(type, fn) {
    if (type === "micro") {
      this.microQueue.push(fn);
    } else if (type === "interactive") {
      this.interactiveQueue.push(fn);
    } else {
      this.timeoutQueue.push(fn);
    }
  },
  loop() {
    while (this.microQueue.length) {
      const task = this.microQueue.shift();
      task();
    }
    while (this.interactiveQueue.length) {
      const task = this.interactiveQueue.shift();
      task();
    }
    while (this.timeoutQueue.length) {
      const task = this.timeoutQueue.shift();
      task();
    }

    if (!this.runningId) {
      // 定期的去检查队列中是否事件，有就取出执行，这就形成了循环
      this.runningId = setInterval(() => {
        this.loop();
      }, 50);
    }
  },
};

eventLoop.loop();

eventLoop.addTask("timeout", () => {
  setTimeout(() => {
    console.log("我是一个延时任务");
  });
});

eventLoop.addTask("micro", async () => {
  console.log("我是一个微任务");
});

```