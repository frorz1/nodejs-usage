const protobuf = require('protocol-buffers')
const fs = require('fs')
const server = require('../server')
// 假数据
const columnData = require('../mockdata/column')

const schemas = protobuf(fs.readFileSync(__dirname + '/detail.proto'))

const tcpServer = server(schemas.ColumnRequest, schemas.ColumnResponse)

tcpServer
  .createServer((request, response) => {
    const columnid = request.body
    console.log('reqid: ', columnid)

    response.end({
      column: columnData[0],
      recommendColumns: [columnData[1], columnData[2]],
    })
  })
  .listen(4000, () => {
    console.log('rpc server listened: 4000')
  })
