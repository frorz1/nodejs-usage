console.log('start require')
const result = require('./lib/index')
result.age = 10
console.log('end require')

console.log(process.argv)
