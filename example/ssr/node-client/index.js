const Koa = require('koa')
const mount = require('koa-mount')
const fs = require('node:fs')
const static = require('koa-static')
const createTemplate = require('./template')
const protobuf = require('protocol-buffers')
const tcpClientServer = require('./client')
const schemas = protobuf(fs.readFileSync(__dirname + '/detail/detail.proto'))

const detailClient = tcpClientServer(
  schemas.ColumnRequest,
  schemas.ColumnResponse,
)
const app = new Koa()

const detailTemplate = createTemplate(__dirname + '/template/detail.html')

// 指定静态服务器的目录，这种形式访问时， html,css,js等都会自动去source目录下找
// 访问时跟路径时（http://localhost:3000/），会直接返回source下的index.html
// app.use(static(__dirname + '/source/'))

// 这种只针对/static 的静态资源
app.use(mount('/static', static(__dirname + '/source/static/')))

// 先声明一个应用，完成中间件后，再去mount，否则中间件会应用不上
const detailApp = new Koa()
// 指定静态服务器的目录，只有/static的资源才会去/source/static/下找
detailApp.use(mount('/static', static(__dirname + '/source/static/')))

detailApp.use(async (ctx, next) => {
  const id = ctx.query.columnid
  console.log('idsssss: ', id)

  if (!ctx.query.columnid) {
    ctx.status = 400
    ctx.body = 'invalid columnid'
    return
  }

  // try {
  const result = await new Promise((resolve, reject) => {
    detailClient.write(
      {
        columnid: id,
      },
      (err, data) => {
        console.log('err', err)
        err ? reject(err) : resolve(data)
      },
    )
  })
  ctx.status = 200
  ctx.body = detailTemplate(result)
  await next()
})

// app.use(
//   mount('/favicon.ico', (ctx) => {
//     ctx.status === 200
//   }),
// )

app.use(mount('/detail', detailApp))

// // 跟目录要放到最后，因为所有目录都可以匹配到 /
// app.use(
//   mount('/', async (ctx, next) => {
//     // fs.readFileSync(__dirname + '/template/download.html') 直接读是流的形式，会触发浏览器的下载。所以需要用文本形式
//     ctx.body = fs.readFileSync(__dirname + '/template/download.html', 'utf-8')
//   }),
// )

app.listen(3000, () => {
  console.log('server is running on port 3000')
})
