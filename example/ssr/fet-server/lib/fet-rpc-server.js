const RPC = require('./rpc-server')

/**
 * 因为所有服务用的包头格式都一样，不一样的只有protobuf协议，所以这里可以将这段逻辑封成一个模块
 *
 * 日常做项目的时候一定要注意把重复代码做封装
 */
module.exports = function (protobufRequestSchema, protobufResponseSchema) {
  return new RPC({
    decodeRequest(buffer) {
      const seq = buffer.readUInt32BE()

      return {
        seq,
        body: protobufRequestSchema.decode(buffer.subarray(8)),
      }
    },
    encodeResponse(data, seq) {
      const body = protobufResponseSchema.encode(data)

      const header = Buffer.alloc(8)
      header.writeUInt32BE(seq)
      header.writeUInt32BE(body.length, 4)

      return Buffer.concat([header, body])
    },
    isCompleteRequest(buffer) {
      if (buffer.length < 8) {
        return 0
      }
      // 写入的时候是以无符号整型的形式写的，所以读的时候也必须这样。如：写入可能是Uint 255，但读只能读到Int 127
      const bodyLength = buffer.readUInt32BE(4)
      // const bodyLength = buffer.readInt32BE(4)
      if (buffer.length >= bodyLength + 8) {
        return bodyLength + 8
      } else {
        return 0
      }
    },
  })
}
