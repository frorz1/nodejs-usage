// function inter(callback) {
//   setTimeout(() => {
//     if (Math.random() > 0.5) {
//       throw new Error('123')
//     } else {
//       callback()
//     }
//   }, 1000)
// }

// try {
//   inter(() => {
//     console.log('success')
//   })
// } catch (error) {
//   console.log('catch: ', error)
// }

// function inter(callback) {
//   setTimeout(() => {
//     if (Math.random() > 0.5) {
//       callback(new Error('failed'))
//     } else {
//       callback('success')
//     }
//   }, 1000)
// }

// try {
//   inter((res) => {
//     if (res instanceof Error) {
//       console.log(res.message)
//       return
//     }
//     console.log(res)
//   })
// } catch (error) {
//   console.log('catch: ', error)
// }

function inter(callback) {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      callback(new Error('failed'))
    } else {
      callback(null, 'success')
    }
  }, 1000)
}

try {
  inter((err, res) => {
    if (err) {
      console.log(err.message)
      return
    }
    console.log(res)
  })
} catch (error) {
  console.log('catch: ', error)
}
