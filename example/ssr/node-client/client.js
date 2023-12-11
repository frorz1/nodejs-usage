const net = require('node:net')
const fs = require('node:fs')
const socket = new net.Socket()
const protobuf = require('protocol-buffers')
const RpcClient = require('./lib/rpc-client')

const client = new RpcClient({
  port: 4000,
  host: '127.0.0.1',
  keepAlive: true,
  timeout: 500,
})
// 模拟easy_sock
module.exports = function (protobufRequestSchema, protobufResponseSchema) {
  client.encode = (data, seq) => {
    const body = protobufRequestSchema.encode(data)

    const header = Buffer.alloc(8)
    header.writeUint32BE(seq)
    header.writeUint32BE(body.length)

    return Buffer.concat([header, body])
  }

  client.decode = (buffer) => {
    const seq = buffer.readUint32BE()
    const body = protobufResponseSchema.decode(buffer.subarray(8))
    return {
      seq,
      result: body,
    }
  }

  client.isReceiveComplete = (buffer) => {
    if (buffer.length < 8) {
      return 0
    }
    const bodyLength = buffer.readInt32BE(4)

    if (buffer.length >= bodyLength + 8) {
      return bodyLength + 8
    } else {
      return 0
    }
  }
  return client
}
