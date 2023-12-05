const net = require('node:net')
const socket = new net.Socket()

socket.connect({
  port: 4000,
  host: 'localhost',
  keepAlive: true,
})

let listening = false

const helper = {
  encode: () => {},
  decode: () => {},
  isReceiveCompleted: () => {},
  write: (data, callback) => {
    //
    if (!listening) {
      socket.on('data', (data) => {
        // 解数据
        callback(null, data)
      })
      listening = true
    }
    socket.write(data, (err) => {
      if (err) {
        callback(err)
      }
    })
  },
}

// 模拟easy_sock
module.exports = helper
