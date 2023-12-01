// 异步I/O是为了有更高效的性能，提供更流畅的体验。假如有三个任务，A、B、C，那么同步耗时为 A + B + C, 而异步为Max(A, B, C)

// 看一个例子
const { glob, globSync } = require('glob')
// console.time("glob");
// const result = globSync(__dirname + "/**/*.js");
// console.log(result)
// console.log(1 + 1);
// console.timeEnd("glob");
// glob: 16.441ms

console.time('glob')
glob(__dirname + '/**/*.js').then((files) => {
  console.log('get files', files)
})
console.timeEnd('glob')
console.log(1 + 1)
// glob: 5.614ms
// 2

// 异步可以保证任务在执行的时候不堵塞，还可以处理其他的任务，也就是说可以处理更多的并发任务
