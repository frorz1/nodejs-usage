Buffer 主要用来处理TCP流和文件流等二进制数据的读写，它是js中 Uint8Array 的的子类，是nodejs内置的模块，但是还是建议手动导入Buffer，下面介绍两个创建buffer的方式

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

## 对Buffer的理解
这里解释一下buffer的内容，它是js中 Uint8Array 的的子类，也就是8位无符号整数数组，不理解的可以看下面[Uint8Array](#uint8array)，在计算机里，一个字节占8位，所以buffer就是一个字节一个字节的内容，它用`两个16进制数`来表示一个字节，因为一个字节8位，但是4位能表示的范围就是0-15，也就是一个16进制数的范围。如果用2进制，则需要写成 00000001 这不容易阅读。
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

从buffer的内容可以看到， Uint8Array中buffer的表示方法也是 两个16位的字符表示一个字节（8位）

二进制 |0000 0100|

| 10进制 | 4         |
| ------ | --------- |
| 2进制  | 0000 0100 |
| 16进制 | 0    4   |

<!-- create table -->


## Uint16Array
根据Uint8Array可知，Uint16Array代表16位无符号整数数组。那么也就是说一个数字最大占 16位，所以他的buffer中就需要用 2组 `两个16进制字符` 来表示

如：

```js
console.log(Uint16Array.from([256, 1, 2]).buffer)

// output:
ArrayBuffer { [Uint8Contents]: <00 01 01 00 02 00>, byteLength: 6 }
```

可以看到数组原本有3个元素，但是buffer的长度是6，也就是buffer中用 两组 `两个16进制字符` 表示一个数
