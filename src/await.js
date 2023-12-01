const fn = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('fail')
      }, 1000)
    })
    console.log(result)
  } catch (error) {
    console.log('可以成功捕获, catch: ', error)
  }
}
