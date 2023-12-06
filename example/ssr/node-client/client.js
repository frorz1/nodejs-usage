const net = require('node:net')
const fs = require('node:fs')
const socket = new net.Socket()
const protobuf = require('protocol-buffers')

const schemas = protobuf(fs.readFileSync(__dirname + '/detail.proto'))
socket.connect({
  port: 4000,
  host: '127.0.0.1',
  keepAlive: true,
})

let listening = false

const helper = {
  seq: 0,
  encode: (data, seq) => {
    const body = schemas.ColumnRequest.encode(data)

    const header = Buffer.alloc(8)
    header.writeInt32BE(seq)
    header.writeInt32BE(body.length, 4)

    return Buffer.concat([header, body])
  },
  decode: (buffer) => {
    const seq = buffer.readInt32BE()
    const body = schemas.ColumnResponse.decode(buffer.slice(8))
    return {
      seq,
      result: body,
    }
  },
  isReceiveComplete: (buffer) => {
    if (buffer.length < 8) {
      return 0
    }
    const bodyLength = buffer.readInt32BE(4)

    if (buffer.length >= bodyLength + 8) {
      return bodyLength + 8
    } else {
      return 0
    }
  },
  write: (data, callback) => {
    const reqBuffer = helper.encode(data, helper.seq)
    helper.seq++
    console.log('req: ', reqBuffer)
    socket.on('data', (buffer) => {
      // 解数据
      const { result } = helper.decode(buffer)
      callback(null, result)
    })
    socket.write(reqBuffer, (err) => {
      if (err) {
        callback(err)
      }
    })
  },
}

// 模拟easy_sock
module.exports = helper
