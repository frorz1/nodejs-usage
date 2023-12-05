const Koa = require('koa')
const mount = require('koa-mount')
const fs = require('node:fs')
const static = require('koa-static')
const app = new Koa()

// 指定静态服务器的目录，这样html中引用静态资源时 './static/xxx.css' 就会去source目录下找
app.use(static(__dirname + '/source'))

// 先声明一个应用，完成中间件后，再去mount，否则中间件会应用不上
const detailApp = new Koa()
detailApp.use(async (ctx, next) => {
  ctx.status = 200
  res = await next()
  ctx.body = res
})

detailApp.use(async (ctx, next) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('hello wrold')
    }, 1000)
  })
})

app.use(
  mount('/favicon.ico', (ctx) => {
    ctx.status === 200
  }),
)

app.use(mount('/detail', detailApp))

// 跟目录要放到最后，因为所有目录都可以匹配到 /
app.use(
  mount('/', async (ctx, next) => {
    // fs.readFileSync(__dirname + '/source/index.html') 直接读是流的形式，会触发浏览器的下载。所以需要用文本形式
    ctx.body = fs.readFileSync(__dirname + '/source/index.html', 'utf-8')
  }),
)

app.listen(4000, () => {
  console.log('server is running on port 4000')
})
