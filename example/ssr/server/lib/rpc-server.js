const net = require('node:net')

// 用于创建RPC服务，提供给服务端使用，不同业务可能又不同的加解包逻辑
module.exports = class RPC {
  constructor({ decodeRequest, encodeResponse, isCompleteRequest }) {
    this.decodeRequest = decodeRequest
    this.encodeResponse = encodeResponse
    this.isCompleteRequest = isCompleteRequest
  }
  createServer(callback) {
    let buffer = null
    const tcpServer = net.createServer((socket) => {
      socket.on('data', (data) => {
        // 拼接旧buffer
        if (buffer && buffer.length > 0) {
          buffer = Buffer.concat([buffer, data])
        } else {
          buffer = data
        }

        let pkgLength = null
        while (buffer && (pkgLength = this.isCompleteRequest(buffer))) {
          let pkgBuffer = null
          if (pkgLength === buffer.length) {
            pkgBuffer = buffer
            buffer = null
          } else {
            pkgBuffer = buffer.subarray(0, pkgLength)
            buffer = buffer.subarray(pkgLength)
          }

          const request = this.decodeRequest(pkgBuffer)

          // createServer((request, response) = >{}) 暴露request和response给调用方
          callback(
            {
              body: request.body,
              socket,
            },
            {
              // data为从数据库查询到的数据
              end: (data) => {
                const responseBuffer = this.encodeResponse(data, request.seq)
                socket.write(responseBuffer)
              },
            },
          )
        }
      })
    })
    return {
      listen() {
        tcpServer.listen.apply(tcpServer, arguments)
      },
    }
  }
}
