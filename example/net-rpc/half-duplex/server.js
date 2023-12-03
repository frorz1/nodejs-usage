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
