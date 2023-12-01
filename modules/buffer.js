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

// 这里解释一下buffer的内容。在计算机里，一个字节占8位，buffer就是一个字节一个字节的内容，它用两个16进制数来表示一个字节。如果用2进制，则需要写成 00000001 这不容易阅读。
// 举个例子 geekbang是8个字节，所以他的buffer内容就是8组 2位的16进制数。其中的g的ASCII码是 103， 它对应的二进制为 0110 0111，转为16进制就是 67

{
  /* <Buffer 67 65 65 6b 62 61 6e 67>
<Buffer 01 02 03 04>
<Buffer 00 00 00 00 00 00 00 00 00 00> */
}

// 因为Buffer继承自Uint8Array，所以可以直接使用Uint8Array的方法
console.log(Buffer.from([103])) // <Buffer 67>
console.log(Uint8Array.from([103]).buffer) // ArrayBuffer { [Uint8Contents]: <67>, byteLength: 1 }
console.log(Uint16Array.from([256, 1, 2]).buffer)

const buf = Buffer.allocUnsafe(4)

buf.writeInt16LE(0x0304, 2)

console.log(buf)
// Prints: <Buffer 04 03>
