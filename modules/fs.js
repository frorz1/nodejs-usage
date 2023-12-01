const fs = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const constants = fs.constants

const file = 'copy.txt';

// 检查文件是否存在的两种方式。 fs.stat 和 fs.access。fs.exists已经被丢弃了
// 1、fs.stat
fs.promises.stat(file).then(res => {
  console.log(res.size)
  console.log(res.isFile())
  console.log(res.isDirectory())
}).catch((err) => {
  console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
})

// 2、fs.access
// Check if the file exists in the current directory.
fs.promises.access(file, constants.F_OK).then(res => {
  console.log(`${file} exists`);
}).catch((err) => {
  console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
})


const buf = Buffer.from('aGVsbG8gd29ybGQ=', 'base64')
const text = buf.toString()

fs.promises.appendFile(file, '\n' + text).then(res => {
  console.log('write success')
}).catch(err => {
  console.log('现在没权限了')
})

fs.writeFile('test.txt', 'aaaaa', (err) => {})


// fs.promises.chmod(file, 0o755).then(res => {
//   fs.promises.appendFile(file, text).then(res => {
//     console.log('write success')
//   }).catch(err => {
//     console.log('现在没权限了')
//   })
// }).catch(err => {
//   console.log('权限修改失败')
// })

// fs.copyFile(file, 'copy.txt', constants.COPYFILE_EXCL, (err) => {
//   console.log(err)
// })

// link会产生一个新文件，然后修改原文件后，link文件也会一起修改，有点类似软连接
fs.link('test.txt', 'link.txt', (err) => {
  
})

// Equivalent to fsPromises.stat() unless path refers to a symbolic link, in which case the link itself is stat-ed, not the file that it refers to. 
fs.lstat(file, (err, stats) => {
  console.log(stats.isDirectory())
})

// 如果文件夹存在则会报错
fs.mkdir('dist', (err) => {
  // console.log(err)
})

// ffft0JrHK, 临时文件夹
// fs.promises.mkdtemp('fff');

fs.readdir('dist', (err, files) => {
  console.log('dist目录下的文件:', files)
})

fs.readFile(file, (err, data) => {
  // console.log('file文件的内容: ', data.toString())
})

fs.readFile('package.json', { encoding: 'utf8' } ,(err, data) => {
  console.log('package.json文件的内容: ', JSON.parse(data).name)
})

fs.rename('dist/a.js', 'dist/aa.js', (err) => {
  console.log('rename success')
})

// 如果dir不存在则会报错
fs.rmdir('distttt', (err) => {
  // console.log(err)
})

// [recursive: true] 执行递归目录删除。使用该选项可以删除文件夹，否则无法删除
// [force: true] 如果文件夹不存在则不会报错
fs.rm('ttt', { force: true, recursive: true }, (err) => {
  console.log('rm: ', err)
})

// 如果path是一个符号链接，则直接把link移除，并不影响原文件或者文件夹。
// 如果path是一个文件地址，则直接删除
// 如果文件不存在，则报错
fs.unlink('link.txt', (err) => {
  // console.log('unlink result: ', err)
})


const controller = new AbortController()

// [recursive] 递归观察
// event: 修改内容：change， 创建/删除/重命名文件：rename
// filename: 相对于观察的文件或者文件夹的路径和名称
try {
  fs.watch('dist', { recursive: true, signal: controller.signal }, (event, filename) => {
    console.log('watch: ', event, filename)
  })
} catch (error) {
  console.log('watch已经被取消')
}

const data = new Uint8Array(Buffer.from('Hello Node.js'))
fs.writeFile('dist/eee.js', data, { signal: controller.signal }, (err) => {
  if (err && err.code === 'ABORT_ERR') {
    console.log('写入取消成功')
  }
})
// controller.abort()
