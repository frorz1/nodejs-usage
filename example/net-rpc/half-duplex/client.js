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

const sendRequest = (id) => {
  const buffer = Buffer.alloc(4)
  buffer.writeInt16BE(id)
  client.write(buffer)
}

// sendRequest(getId())

client.on('data', (data) => {
  console.log(data.toString())
  // sendRequest(getId())
})

// 全双工就会出问题，数据的发送顺序和接受顺序不一样，我们不知道这中间的对应关系
// setInterval(() => {
//   sendRequest(getId())
// }, 500)

// 更暴力一点，直接并发发送, 发现会只有一次返回，因为TCP链接底层会自动把同时发送的数据包进行粘包，一次性的发送给另一方，以达到优化效果
// for (let i = 0; i < 10; i++) {
//   sendRequest(getId())
// }
