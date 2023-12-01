const http = require('node:http')
const path = require('node:path')
const querystring = require('node:querystring')
const fs = require('node:fs')
const { game } = require('./lib')

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost:3000')
    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-type': 'text/html' })
      // fs.readFile(__dirname + '/index.html').then((html) => {
      //   res.end(html)
      // })
      fs.createReadStream(__dirname + '/index.html').pipe(res)
      return
    }
    if (url.pathname === '/game') {
      const userAction = url.searchParams.get('action')
      const resultCode = game(userAction)
      let result = ''
      if (resultCode === 0) {
        result = '平局'
      } else if (resultCode === 1) {
        result = '你赢了'
      } else if (resultCode === 2) {
        result = '你输了'
      }
      res.writeHead(200, { 'Content-type': 'text/plain' })
      res.end(result)
    }
  })
  .listen(3000, () => {
    console.log(`listen on 3000`)
  })
