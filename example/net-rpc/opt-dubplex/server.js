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
