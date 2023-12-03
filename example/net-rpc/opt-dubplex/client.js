const net = require('node:net')
const { clientUtils } = require('./util')

const client = new net.Socket()

client.connect({
  port: 4000,
  host: 'localhost',
})

let seq = 0

let oldBuffer = null
client.on('data', (buffer) => {
  // 拼接之前剩余的buffer, 比如上一次接受时，buffer总长度是12个字节，但是一个完整包的字节是10个，那么就剩余了两个字节，需要拼接到新接收的buffer中
  if (oldBuffer) {
    buffer = Buffer.concat([oldBuffer, buffer])
  }

  let pkgLength = 0

  // 将buffer中一个个的完整数据包切割出来
  while ((pkgLength = clientUtils.checkComplete(buffer))) {
    const onePkgBuffer = buffer.subarray(0, pkgLength)
    buffer = buffer.subarray(pkgLength)
    const { seq, body } = clientUtils.decode(onePkgBuffer)
    console.log(`seq: ${seq}, body: ${body}`)
  }
  oldBuffer = buffer
})

// 全双工因为无需等待响应即可发送下一次请求，数据的发送顺序和接受顺序不一样（服务端的耗时不同），我们不知道这中间的对应关系。有点类似HTTP的队头堵塞原理
// 所以我们需要对每一次请求进行一个编号, 这样我们就可以通过编号拿到对应的数据了
// setInterval(() => {
//   client.write(clientUtils.encode(seq++))
// }, 100)

// 但如果更暴力一点还是会出现问题
// 直接并行发送, 发现会只有一次返回，因为TCP链接底层会自动把同时发送的数据包进行粘包，一次性的发送给另一方，以达到优化效果
// 这就需要我们在对粘包的数据（比如100个）进行解包，将其拆分开成100个分别发送
for (let i = 0; i < 10; i++) {
  client.write(clientUtils.encode(seq++))
}
