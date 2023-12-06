// 要解决粘包问题，也就是把一整块的数据切割成一个个数据包，那么我们就需要知道每个数据包的长度
// 所以我们可以封装一个头部，除了存放序号以外，还需要存放传送的数据包的长度。我们规定 client & server的头部都是6字节

const { lessionIds } = require('./data')
module.exports.clientUtils = {
  encode(seq) {
    // 1、构造数据包， 请求的内容为4字节
    const id = lessionIds[Math.floor(Math.random() * lessionIds.length)]
    const body = Buffer.alloc(4)
    body.writeInt32BE(id)

    // 2、构造头部 = seq + body.length
    const header = Buffer.alloc(6)
    header.writeInt16BE(seq)
    header.writeInt32BE(body.length, 2)

    // 3、拼接
    const buffer = Buffer.concat([header, body])
    return buffer
  },
  decode: (buffer) => {
    // 1、解出序号
    const seqBuffer = buffer.subarray(0, 2)
    const seq = seqBuffer.readInt16BE()

    // 2、解出返回的内容
    const body = buffer.subarray(6)
    return {
      seq,
      body: body.toString(), // 服务端返回的数据可能就是个字符串buffer，所以直接toString()即可
    }
  },
  checkComplete: (buffer) => {
    // 一个包的组成位 header + body.  header = seq + body.length。因为后端返回的数据长度不定，所以我们需要根据header中的body.length得到一个完整包的长度，进行切割
    // 所以一个完整的包的长度是 6 + body.length

    // 表示剩余的buffer不是一个完整包
    if (buffer.length < 6) {
      // 6是包头的长度
      return 0
    }

    // 读取header中的body.length。 这个长度是4字节，所以我们读取32位
    const bodyLength = buffer.readInt32BE(2)
    if (buffer.length > bodyLength + 6) {
      return bodyLength + 6
    }
    return 0
  },
}

module.exports.serverUtils = {
  encode(data, seq) {
    // 1、构造数据包
    const body = Buffer.from(data)

    // 2、构造头部 = seq + body.length
    const header = Buffer.alloc(6)
    header.writeInt16BE(seq)
    header.writeInt32BE(body.length, 2)

    // 3、拼接
    const buffer = Buffer.concat([header, body])
    return buffer
  },
  decode: (buffer) => {
    // 1、解出序号
    const seqBuffer = buffer.subarray(0, 2)
    const seq = seqBuffer.readInt16BE()

    // 2、解出请求中的body
    const body = buffer.subarray(6)
    return {
      seq,
      body: body.readInt32BE(),
    }
  },
  checkComplete: (buffer) => {
    // 一个包的组成位 header + body.  header = seq + body.length。客户端请求的数据包的长度是固定的也就是上面写的10个字节，但是这里为了通用，我们就根据header中的body.length得到一个完整包的长度，进行切割
    // 所以一个完整的包的长度是 6 + body.length

    if (buffer.length < 6) {
      // 6是包头的长度
      return 0
    }
    const bodyLength = buffer.readInt32BE(2)

    if (buffer.length > bodyLength + 6) {
      return bodyLength + 6
    }
    return 0
  },
}
