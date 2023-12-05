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
