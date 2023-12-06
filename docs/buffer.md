Buffer 主要用来处理TCP流和文件流等二进制数据的读写，它是js中[Uint8Array](#uint8array)的的子类，是nodejs内置的模块，但是还是建议手动导入Buffer.

# 创建
下面介绍两个创建buffer的方式

## Buffer.from
```js
const buffer1 = Buffer.from('geekbang')
const buffer2 = Buffer.from([1, 2, 3, 4])

console.log(buffer1)
console.log(buffer2)

// output: 
<Buffer 67 65 65 6b 62 61 6e 67>
<Buffer 01 02 03 04>
```

## Buffer.alloc(size)
创建一个长度为size个字节的buffer
```js
const buffer3 = Buffer.alloc(5, 'a')
console.log(buffer3)

// output: 
<Buffer 61 61 61 61 61>
```


# 数据转换

Buffer.from(string[,encoding])

buf.toString([encoding[, start[,end]]])

encoding是用来指定string参数的格式的，默认按string是 utf8 格式处理
## 对象数据
```js

const buffer = Buffer.from(JSON.stringify({ name: 'fet' }))

const data = JSON.parse(buffer.toString())
// { name: 'fet' }
```

## base64转utf8
```js
// 这里指定了string参数编码方式为base64
// Buffer.from会将base64解码成utf-8格式的。等同于js里面的window.atob(base64)
const buf = Buffer.from('aGVsbG8gd29ybGQ=', 'base64')
const str = buf.toString()
console.log(str)
// hello world
```

## utf-8转base64
```js
const buf = Buffer.from('hello world')
const str = buf.toString('base64')
console.log(str)
// aGVsbG8gd29ybGQ=
```

# 读取

这里就用8位无符号整数来举例，其他位数或者有符号的方法都是一样的道理

## readUint8
readUint8[offset]

从buffer中读取8位，也就是1个字节

offset: 开始读取前需要跳过的字节，0 <= offset <= buf.length - 1，默认0
return: integer

```js
const buf = Buffer.from([1, 5])
console.log(buf)
console.log(buf.readUInt8(0))

// output: 
<Buffer 01 05>
1
```

## readUint16BE
readUint16BE[offset]

BE的意思就是大端次序（Big endian），从头往尾部读 -> ，所以这个方法的意思就是 从offset处，读取后面两个字节，顺序是 ->

offset: 开始读取前需要跳过的字节，0 <= offset <= buf.length - 2 因为一次读2个字节，所以跳过的字节数不能大于buf.length - 2，否则剩余字节不够读。默认0
return: integer

```js
const buf = Buffer.from([1, 5])
console.log(buf)
console.log(buf.readUInt16BE(0))

// output: 
// 因为一次读两个字节，也就是0105, 也就是1 * 16^2 + 0 * 16^1 + 5 = 261
<Buffer 01 05>
261
```

## readUint16LE
readUint16LE[offset]

LE的意思就是小端次序（Little endian）从尾往头部读 <- ，所以这个方法的意思就是 从offset处，读取后面两个字节，顺序是 <-

offset: 开始读取前需要跳过的字节，0 <= offset <= buf.length - 2 因为一次读2个字节，所以跳过的字节数不能大于buf.length - 2，否则剩余字节不够读。默认0
return: integer

```js
const buf = Buffer.from([0x12, 0x22, 0x33, 0x44])

console.log(buf)
console.log('十进制：', buf.readUInt16LE(0))
console.log('十六进制：', buf.readUInt16LE(0).toString(16))

console.log('十进制：', buf.readUInt16LE(1))
console.log('十六进制：', buf.readUInt16LE(1).toString(16))

// output: 
<Buffer 12 22 33 44>
// offset = 0, 也就是不跳过字符，从0开始读两位，也就是22 12
十进制： 8722
十六进制： 2212

// offset = 1, 也就是不跳过字符，从1开始读两位，也就是33 22
十进制： 13090
十六进制： 3322
```

## subarray
subarray([start[, end]]) 读取一段子buffer

- start <integer> Where the new Buffer will start. Default: 0.
- end <integer> Where the new Buffer will end (not inclusive). Default: buf.length.
- Returns: <Buffer>

```js
const buf = Buffer.alloc(10)

buf.writeUInt16LE(258, 0) // 写入两个字节
buf.writeUInt16LE(259, 4) // 写入两个字节
console.log(buf)
console.log(buf.subarray(0, 5))

// output:
<Buffer 02 01 00 00 03 01 00 00 00 00>
<Buffer 02 01 00 00 03>
```

# 写入
在一定长度的buffer内可以随意写入不同位的有符号或无符号整数，有时候需要跟不同的服务端约定buffer的写入规则，所以可能会用到BE和LE，这个需要了解。

## alloc
Buffer.alloc(10)

```js
// Creates a Buffer of length 10,
// filled with bytes which all have the value `1`.
const buf = Buffer.alloc(10, 1);
```

如果不指定偏移量，则会直接覆盖相应的位置
## writeUInt16BE
writeUInt16BE[offset]

和读取规则相同，参考[readUInt16BE](#readuint16be)
```js
const buf = Buffer.alloc(10)

// 这里我们手动指定偏移量，不去覆盖
buf.writeUint8(1, 0) // 写入一个字节
buf.writeUInt16BE(257, 1) // 写入两个字节
buf.writeUInt16BE(258, 3) // 写入两个字节
console.log(buf)

// output: 
<Buffer 00 00 00 00 00 00 00 00 00 00>
<Buffer 01 01 01 01 02 00 00 00 00 00>
```
如果不指定偏移

```js
const buf = Buffer.alloc(10)

buf.writeUint8(1) // 写入一个字节
buf.writeUInt16BE(257) // 写入两个字节
buf.writeUInt16BE(258) // 写入两个字节
console.log(buf)

// output:
<Buffer 00 00 00 00 00 00 00 00 00 00>
<Buffer 01 02 00 00 00 00 00 00 00 00>
```

## writeUInt16LE
和读取规则相同，参考[readUint16LE](#readuint16le)

```js
const buf = Buffer.alloc(10)

buf.writeUInt16LE(258, 0) // 写入两个字节
buf.writeUInt16LE(259, 4) // 写入两个字节
console.log(buf)

// output:
// 258的16进制表示为 0102，这里写入的时候要以<-的方式写，所以是0201
<Buffer 00 00 00 00 00 00 00 00 00 00>
<Buffer 02 01 00 00 03 01 00 00 00 00>
```

# 关于存储格式的解读

## 对Buffer的理解
这里解释一下buffer的内容，它是js中 Uint8Array 的的子类，也就是8位无符号整数数组，不理解的可以看下面[Uint8Array](#uint8array)，在计算机里，一个字节占8位，但是4位能表示的范围就是0-15，也就是一个16进制数的范围，所以它用`两个16进制数`来表示一个字节。如果用2进制，则需要写成 00000001 这不容易阅读。
举个例子 geekbang是8个字节，所以他的buffer内容就是8组 2位的16进制数。

g的ASCII码是 103， 它对应的二进制为 0110 0111，转为16进制就是 67

n的ASCII码是 110， 它对应的二进制为 0110 1110，前四位对应的10进制为6，16进制也为6， 后四位对应的10进制为14，16进制位e， 所以表示为 6e

## Uint8Array
[Uint8Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)表示8位的无符号整型数组，也就是说他能存储的最大数字就是 0-255,对应的Int8Array就是8位有符号的整型数组，能存储的数字范围为 -128~127。所以当转化数组的时候，是没办法表示超出范围的值的。举个例子
```js
const arr = Uint8Array.from([256, 1, 2])
console.log(arr)
console.log(arr.buffer)

// output:
Uint8Array(3) [ 0, 1, 2 ]
ArrayBuffer { [Uint8Contents]: <00 01 02>, byteLength: 3 }
```

可以看到256被表示成0了，因为8位表示的最大数位 1111 1111 也就是10进制的255，而256的二进制位 1 0000 0000 是9位，所以最高位被舍弃后就是 0000 0000

二进制 |0000 0100|

| 10进制 | 4         |
| ------ | --------- |
| 2进制  | 0000 0100 |
| 16进制 | 0    4   |

<!-- create table -->


## Uint16Array
根据Uint8Array可知，Uint16Array代表16位无符号整数数组。那么也就是说一个字节占 16位，所以他的buffer中就需要用 2组 `两个16进制字符` 来表示

如：

```js
console.log(Uint16Array.from([256, 1, 2]).buffer)

// output:
ArrayBuffer { [Uint8Contents]: <00 01 01 00 02 00>, byteLength: 6 }
```

可以看到数组原本有3个元素，但是buffer的长度是6，也就是buffer中用 两组 `两个16进制字符` 表示一个字节
