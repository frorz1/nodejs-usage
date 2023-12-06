const { create } = require('node:domain')
const vm = require('node:vm')
const fs = require('fs')

const templateCache = {}

function createContext() {
  return vm.createContext({
    include: (path, data) => {
      const template = templateCache[path] || createTemplate(path)
      template(data)
    },
  })
}

function createTemplate(path) {
  templateCache[path] =
    templateCache[path] ||
    vm.runInContext(
      `(function (data) {
      with (data) {
        return \`${fs.readFileSync(path, 'utf-8')}\`
      }
    })`,
      createContext(),
    )
  return templateCache[path]
}

module.exports = createTemplate
