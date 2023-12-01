const express = require('express')
const { game } = require('./lib')
const fs = require('node:fs')

// express的几个主要功能点
// 1、Robust routing 健壮的路由
// 2、Focus on high performance 高性能
// 3、Super-high test coverage 高测试覆盖率
// 4、HTTP helpers (redirection, caching, etc) 简化一些http操作，如 重定向，302, 304, 设置accept,根据返回的内容设置Content-Type等
// 5、View system supporting 14+ template engines 支持更多的模版引擎
// 6、Content negotiation 内容协商，也就是304
// 7、Executable for generating applications quickly 脚手架

// 总结下来主要有三点： 提供健壮的路由，简化http操作，支持更多的模版引擎

const app = express()

app.get('/', (req, res) => {
  res.status = 200
  // 自动设置Content-Type: text/html; charset=UTF-8
  res.sendFile(__dirname + '/index.html')

  // 这样会返回一个读取的文件流，那么会自动设置Content-Type: application/octet-stream
  // 浏览器会认为是一个下载事件，就会触发下载
  // res.send(fs.readFileSync(__dirname + '/index.html'))

  // res.send(fs.readFileSync(__dirname + '/index.html', { encoding: 'utf-8' }))
})

app.get('/game', (req, res) => {
  const userAction = req.query.action
  const resultCode = game(userAction)
  let result = ''
  if (resultCode === 0) {
    result = '平局'
  } else if (resultCode === 1) {
    result = '你赢了'
  } else if (resultCode === 2) {
    result = '你输了'
  }
  res.send(result)
})

app.listen(3000, () => {
  console.log('server is running on port 3000')
})
