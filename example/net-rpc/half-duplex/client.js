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
