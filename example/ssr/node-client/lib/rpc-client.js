const net = require('node:net')

module.exports = class {
  constructor({ host, port, timeout, keepAlive }) {
    this.host = host
    this.port = port
    this.timeout = timeout
    this.keepAlive = keepAlive
    const socket = new net.Socket()
    this.socket = socket
    this.seq = 0
    this.handlers = []

    socket.connect({
      port,
      host,
      keepAlive,
    })
    socket.setTimeout(timeout)
    socket.on('timeout', () => {
      console.log('timeout---')
      // socket.end()
    })
    this.addListener()
  }
  addListener() {
    let buffer = null
    this.socket.on('data', (data) => {
      // 解码
      // 拼接旧buffer
      if (buffer && buffer.length > 0) {
        buffer = Buffer.concat([buffer, data])
      } else {
        buffer = data
      }
      let pkgLength = null
      while (buffer && (pkgLength = this.isReceiveComplete(buffer))) {
        let respBuffer = null
        if (pkgLength === buffer.length) {
          respBuffer = buffer
          buffer = null
        } else {
          respBuffer = buffer.subarray(0, pkgLength)
          buffer = buffer.subarray(pkgLength)
        }
        const { seq, result } = this.decode(respBuffer)
        const handlerIndex = this.handlers.findIndex((item) => item.seq === seq)
        const handler = this.handlers.splice(handlerIndex, 1)[0]
        if (handler) {
          handler.callback(null, result)
        }
      }
    })
    // this.socket.on('error', (err) => {
    //   console.log('connect error', err)
    // })
  }
  write(data, callback) {
    // 发送数据
    const reqBuffer = this.encode(data, this.seq)
    this.handlers.push({
      seq: this.seq,
      callback,
    })
    this.seq++
    this.socket.write(reqBuffer, (err) => {
      if (err) {
        callback(err)
      }
    })
  }
}
