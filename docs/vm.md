`node:vm` 模块允许在 V8 虚拟机上下文中编译和运行代码，

`node:vm` 并不提供一个安全机制，所以不要使用它去运行不受信任的代码。

一个常见的做法是在一个不同的V8实例上下文中运行js code，这就意味着，被调用的代码具有和调用代码不同的全局对象

每个不同的V8上下文（context）必须先被情景化（contextifying），被调用的代码会认为上下文对象中的所有属性均为全局变量。被调用的代码有以下两个特性

- 任何针对全局变量进行的修改都会映射到上下文对象中。
- 被调用代码内声明的全局变量也会映射到上下文对象中。

举个例子： 
```js
// node:vm 模块允许在 V8 虚拟机上下文中编译和运行代码

const vm = require('node:vm')

const x = 1

const context = {
  x: 2,
}

vm.createContext(context) //  // Contextify the object. the current global object will be context

// js code中所有的东西都属于context上下文，也就是可以用context.xxx访问。
// 类似于在js中 var a = 10, 可以用window.a访问一下，window就是主线程的上下文, 这里window.y访问不到，是因为const有独立的作用域块
// 就类似 { let y }
const code = `
  function add(a, b) {
    return a + b
  }
  x += 2
`

// 返回code中执行的最后一条语句的结果
const result = vm.runInContext(code, context)

console.log(result) // 4
console.log(context) // { x: 4, add: [Function: add] }
```

这个很类似于客户端代码中的window上下文。window上下文的属性对可以当全局变量直接使用，而全局变量的修改也会影响到window中的属性。如

```js
window.a = 1
console.log(a) // 1
a += 2
console.log(window.a) // 3
```

# vm.Script
vm.Script 类的实例包含可以在特定上下文中执行的预编译脚本。

## new vm.Script
创建新的 vm.Script 对象会编译代码，但不会运行它。编译后的vm.Script可以稍后多次运行。代码不绑定到任何全局对象；相反，它在每次运行之前绑定，仅针对该运行。

```js
const vm = require('node:vm');

const context = {
  animal: 'cat',
  count: 2,
};

const script = new vm.Script('count += 1; name = "kitty";');

vm.createContext(context);
for (let i = 0; i < 10; ++i) {
  script.runInContext(context);
}

// 第二次使用脚本，可以再一个新的context中运行
const context2 = {
  count: 100,
}
vm.createContext(context2)

script.runInContext(context2)

console.log(context) // { animal: 'cat', count: 12, name: 'kitty' } 
console.log(context2) // { count: 101, name: 'kitty' } context2中也有name的原因是，被调用代码声明了一个全局变量name
```

## script.runInContext

需要指定一个情景化的上下文对象，可以参考上面的例子。他的返回值是被调用代码中最后一条语句的结果

## script.runInNewContext

无需调用vm.createContext去情景化对象，直接传入一个对象，该方法会自动情景化

```js
const vm = require('node:vm')

const script = new vm.Script('count += 1')

const res = script.runInNewContext({
  count: 100,
})

console.log(res) // 101
```

## script.runInThisContext

在当前全局对象的上下文中运行 vm.Script 包含的编译代码。运行的代码无权访问本地范围，但可以访问当前全局对象。这里的本地范围指的是 使用var、let、const声明的变量，全局对象指的是global。

```js

const vm = require('node:vm')

global.globalVar = 1
var globalVar = 10 // 无权访问
const script = new vm.Script('globalVar += 1')

for (let i = 0; i < 1000; ++i) {
  script.runInThisContext()
}

console.log(global.globalVar)

// output: 
// 1001
```

# vm.runInContext

这个跟script.runInContext很想。只不过是vm.runInContext需要额外指定要运行的code，其余的完全一样。 如

```js

```

# vm.runInNewContext

# vm.runInThisContext

被执行代码中声明的变量优先级是要高于全局变量的

```js
const vm = require('node:vm')

global.globalVar = 1
var globalVar = 10

vm.runInThisContext(`let globalVar = 2; `)
for (let i = 0; i < 10; ++i) {
  console.log(vm.runInThisContext('globalVar *= 2;'))
}
console.log('global: ', global.globalVar)

// output:
// 4
// 8
// 16
// 32
// 64
// 128
// 256
// 512
// 1024
// 2048

// global: 1
```

可以看到读取的是`let globalVar = 2;`中的globalVar, 因为`vm.runInThisContext('let globalVar = 2; ')`已经在thisContext中创建了一个同名变量了，也就是说被执行的代码等同于

```js
let globalVar = 2;
globalVar *= 2;
```

**runInThisContext中的变量也会影响全局**

```js
const vm = require('node:vm')

global.globalVar = 1

vm.runInThisContext(`globalVar = 2;`)
for (let i = 0; i < 10; ++i) {
  vm.runInThisContext('globalVar *= 2;')
}
console.log(global.globalVar) // 2048
```

# vm实现模版
模版功能包括 xss， include

## 目录
```sh
.
├── templates
│   ├── a.txt
│   └── b.txt
└── vm.js
```

## template a
templates/a.txt
```html
`<h1>${data.title}</h1><div>${include('b.txt', data.content)}</div>`
```

## template b
templates/b.txt
```html
`<p>${data}</p>`
```

## 实现代码
vm.js
```js
// node:vm 模块允许在 V8 虚拟机上下文中编译和运行代码
// 可以借助vm模块来实现类似于ejs，hbs等模版
// 一个模版需要有的东西有
// 1、include新模版, 方便重用。如header
// 2、helper函数
// 3、xss过滤

const fs = require('node:fs')
const vm = require('node:vm')

const templateCache = {}

/**
 *
 * @param {*} templatePath 模板路径
 * @param {*} data 模板数据
 * @returns render方法
 */
function createTemplate(templatePath, data) {
  templateCache[templatePath] = vm.runInNewContext(
    `(function () {
        return ${fs.readFileSync(templatePath, 'utf-8')}
    })`,
    {
      include: function (name, data) {
        name = __dirname + '/templates/' + name
        const template = templateCache[name] || createTemplate(name, data)
        return template()
      },
      _: function (markup) {
        if (!markup) return ''
        return String(markup)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/'/g, '&#39;')
          .replace(/"/g, '&quot;')
      },
      data,
    },
  )
  return templateCache[templatePath]
}

const render = createTemplate(__dirname + '/templates/a.txt', {
  title: 'test',
  content: 'this is content',
})

console.log(render())

// output: 
// <h1>test</h1><div><p>this is content</p></div>
```