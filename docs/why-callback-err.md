## 思考
这里有一个问题不知道大家有没有考虑过，**为什么nodejs的异步回调的第一个参数是err**?

我们通过一个例子来说明，首先我们有一个函数，它接收一个回调，并在异步任务中调用

```js
function inter(callback) {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      throw new Error("123");
    } else {
      callback();
    }
  }, 1000);
}
```

然后我们在try/catch语句中去调用它，试图捕获抛出的错误

```js
try {
  inter(() => {
    console.log("success");
  });
} catch (error) {
  console.log("catch: ", error);
}
```

执行结果为, 可以看到并没有成功。很明显，异步任务执行时，当前执行栈已经清空了，try/catch已经运行完了，他们完全处在不同的调用栈或者事件循环中，所以无法捕获错误。nodejs中跑出全局错误可能会让程序退出，所以很严重。

```sh
$ Error: 123
    at Timeout._onTimeout (/Users/rudy.feng/fet/my-github/nodejs-usage/src/why-callback-err.js:4:13)
    at listOnTimeout (node:internal/timers:569:17)
    at process.processTimers (node:internal/timers:512:7)
```

但这个问题可以通过await解决，try/catch可以捕获await所得到的错误。如

```js
async function () {
  try {
    await new Promise((resolve, reject) => {
      reject(new Error('fail'))
    })
  } catch (error) {
    console.log('catch: ', error)
  }
}
```

## 改造

我们把函数改成下面这样

```js
function inter(callback) {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      callback(new Error("failed"));
    } else {
      callback("success");
    }
  }, 1000);
}
```

他已经可以正常的处理错误了，不会向全局抛出错误。那我们在使用时就需要这样

```js
inter((res) => {
  if (res instanceof Error) {
    console.log(res.message);
    return;
  }
  console.log(res);
});
```

这会带来另一个问题，因为我并不知道你抛的是个什么错误，而且每一个异步回调里都需要去做一次这样的处理，这不够好。

## 最终

我们默认异步回调的第一个参数是错误，有就传，没有就传null。这样即清晰的约定好了，处理也更方便

```js
function inter(callback) {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      callback(new Error("failed"));
    } else {
      callback(null, "success");
    }
  }, 1000);
}

try {
  inter((err, res) => {
    if (err) {
      console.log(err.message);
      return;
    }
    console.log(res);
  });
} catch (error) {
  console.log("catch: ", error);
}
```

