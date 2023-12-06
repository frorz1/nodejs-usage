RPC (Remote Procedure Call) 远程过程调用。

# 与Ajax有什么异同

## 相同
- 都是两台计算机之间的调用
- 需要双方约定一个数据格式

## 不同
- RPC不一定使用DNS作为寻址服务，会使用特有服务来寻址（比如就用一个id，不需要DNS去寻址）
- 应用层协议不一定使用HTTP
- RPC是基于TCP或UDP协议


# TCP通信方式

我们把发出信息的一端叫client，收到信息的一端叫server

## 单工通信
只能一端向另一端发送请求，比如client -> server

## 半双工通信
两端都可以发送和接受请求。但同一时间，client发出一个请求后，需要等到server响应之后，才能进行第二次请求。类似HTTP1.x造成队头阻塞的原因

## 全双工通信
两端可以随意发送和接受请求，无需等待一个请求响应即可进行第二次请求。类似于HTTP2.0实现的数据帧和流来请求，就是一种全双工通信

# RPC调用的优点

因为RPC使用TCP或者UDP协议，所以传输的时候都是使用的二进制流的方式进行的，这对计算机来说更容易理解。如传输一个数组，可能就是 0a 0b 0c 0d，代表10, 11, 12, 13。

- 更小的数据体积。
- 更快的编解码速度。

# 案例

单工通信就不解释了，就是一方发

## 半双工通信
```js script
// client.js
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

sendRequest(getId())

client.on('data', (data) => {
  console.log(data.toString())
  sendRequest(getId())
})

```

服务端返回了数据才能进行下一次请求

```js
const net = require('node:net')

const server = net.createServer((socket) => {
  socket.on('data', (buffer) => {
    console.log(buffer)
    const id = buffer.readInt16BE()
    console.log(id)
    setTimeout(() => {
      socket.write(
        Buffer.from(
          JSON.stringify(lessions.find((item) => parseInt(item.id) === id)),
        ),
      )
    }, 2000)
  })
})
server.listen(4000)

const lessions = [
  {
    source_id: 919,
    title: '第一章：课程简介',
    article_count: 5,
    id: '906',
  },
  {
    source_id: 920,
    title: '第二章：技术预研篇',
    article_count: 20,
    id: '907',
  },
  {
    source_id: 1039,
    title: '第三章： 项目开发篇',
    article_count: 11,
    id: '1015',
  },
  {
    source_id: 1062,
    title: '第四章：性能调优篇',
    article_count: 10,
    id: '1040',
  },
  {
    source_id: 1092,
    title: '第五章：框架和工程化篇',
    article_count: 11,
    id: '1070',
  },
]
```

## 全双工通信

因为可以互相发送请求，这就意味着，请求和响应的顺序可能是乱序的。那么就无法识别哪个请求对应哪个响应。所以我们需要一个请求序号来表示,也就是 seq + body。通过编号就能找到对应的数据。

### 不考虑同时发送的问题
先来看一个简单的版本， 我们这次让服务端响应的时间不固定，这样就可以模拟第一个请求还没响应的时候，第二个或者第三个请求就已经响应了。

```js
// client.js
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

setInterval(() => {
  client.write(encodeId(getId()))
}, 50)

```

服务端响应时间仍是不确定的

```js
// server.js
const net = require('node:net')

const server = net.createServer((socket) => {
  socket.on('data', (buffer) => {
    // 1、读取序号
    const seqBuffer = buffer.subarray(0, 2)
    // 2、读取id
    const id = buffer.readInt16BE(2)
    console.log(seqBuffer.readInt16BE(), id)
    setTimeout(() => {
      // 3、返回时将数据和序号一起返回
      const buffer = Buffer.concat([
        seqBuffer,
        Buffer.from(
          JSON.stringify(lessions.find((item) => parseInt(item.id) === id)),
        ),
      ])
      socket.write(buffer)
    }, Math.random() * 2000)
  })
})
server.listen(4000)
// [...lesssions]
```

但如果更暴力一点还是会出现问题，直接并行发送, 发现会只有一次返回。比如如下这样
```js
for (let i = 0; i < 10; i++) {
  client.write(encodeId(getId()))
}
```
因为TCP链接底层会自动把同时发送的数据包进行粘包，一次性的发送给另一方，以达到优化效果，这就需要我们在对粘包的数据（比如100个）进行解包，将其拆分开成100个分别发送。

### 考虑同时发送
因为需要在一大段数据中把一个个的请求包拆分出来，所以我们就需要知道每一个包的长度。因此我们发送请求时需要封装一个独立的包头 header，用来存储 seq + body.length, 另外需要一个body存储实际的请求数据。服务端收到请求后需要将数据截出来，然后挨个响应即可。

#### encode & decode

```js
// util.js
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

```

#### client
```js
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

for (let i = 0; i < 10; i++) {
  client.write(clientUtils.encode(seq++))
}
```

#### server 
```js
const net = require('node:net')
const { lessions } = require('./data')
const { serverUtils } = require('./util')

const server = net.createServer((socket) => {
  let oldBuffer = null
  socket.on('data', (buffer) => {
    if (oldBuffer) {
      buffer = Buffer.concat([oldBuffer, buffer])
    }
    console.log(buffer)
    let pkgLength = 0
    while ((pkgLength = serverUtils.checkComplete(buffer))) {
      const pkgBuffer = buffer.subarray(0, pkgLength)
      buffer = buffer.subarray(pkgLength)

      const { seq, body } = serverUtils.decode(pkgBuffer)
      console.log(`seq: ${seq}, body: ${body}`)
      setTimeout(() => {
        const buf = serverUtils.encode(
          JSON.stringify(lessions.find((item) => parseInt(item.id) === body)),
          seq,
        )
        socket.write(buf)
      }, 100)
    }
    oldBuffer = buffer
  })
})
server.listen(4000)
```