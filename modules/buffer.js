// Buffer 主要用来处理TCP流和文件流等二进制数据的读写
// 它是js中 Uint8Array 的的子类，是nodejs内置的模块，但是还是建议手动导入Buffer
// 两个创建buffer的方式
// 1、Buffer.from
const { Buffer } = require('node:buffer')
const buffer1 = Buffer.from('geekbang')
const buffer2 = Buffer.from([256, 2, 3, 4])

// 2、Buffer.alloc 创建一个长度为10个字节的buffer
const buffer3 = Buffer.alloc(10)

console.log(buffer1)
console.log(buffer2)
console.log(buffer3)

// 读取

// const buf = Buffer.from(JSON.stringify([1, 5]))
// console.log(buf)
// console.log(buf.readUInt16BE(0))

// const buf = Buffer.from([0x12, 0x22, 0x33, 0x44])

// console.log(buf)
// console.log('十进制：', buf.readUInt16LE(0))
// console.log('十六进制：', buf.readUInt16LE(0).toString(16))

// console.log('十进制：', buf.readUInt16LE(1))
// console.log('十六进制：', buf.readUInt16LE(1).toString(16))

const buf = Buffer.alloc(10)

buf.writeUInt16LE(258, 0) // 写入两个字节
// buf.writeUInt16LE(259, 4) // 写入两个字节
// console.log(buf.subarray(0, 5))
console.log(buf.length)
