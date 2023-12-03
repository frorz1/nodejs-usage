const net = require('node:net')

const client = new net.Socket()

client.connect({
  port: 4000,
  host: 'localhost',
})

const ids = ['906', '907', '1015', '1040', '1070']

const getId = () => {
  return ids[Math.floor(Math.random() * ids.length)]
}

let seq = 0
const encodeId = (id) => {
  const buffer = Buffer.alloc(4)
  buffer.writeInt16BE(seq++) // 用两个字节存储序号
  buffer.writeInt16BE(id, 2) // 用两个字节存储id
  return buffer
}

client.on('data', (buffer) => {
  // console.log(buffer.toString())
  const seq = buffer.subarray(0, 2)
  const body = buffer.subarray(2)

  console.log(`seq: ${seq.readInt16BE()}, body: ${body.toString()}`)
})

// 全双工因为无需等待响应即可发送下一次请求，数据的发送顺序和接受顺序不一样（服务端的耗时不同），我们不知道这中间的对应关系。有点类似HTTP的队头堵塞原理
// 所以我们需要对每一次请求进行一个编号, 这样我们就可以通过编号拿到对应的数据了
setInterval(() => {
  client.write(encodeId(getId()))
}, 50)

// 但如果更暴力一点还是会出现问题
// 直接并行发送, 发现会只有一次返回，因为TCP链接底层会自动把同时发送的数据包进行粘包，一次性的发送给另一方，以达到优化效果
// 这就需要我们在对粘包的数据（比如100个）进行解包，将其拆分开成100个分别发送
// for (let i = 0; i < 10; i++) {
//   client.write(encodeId(getId()))
// }
