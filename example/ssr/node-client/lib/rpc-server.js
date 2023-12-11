const net = require('node:net')

module.exports = class {
  constructor({ host, port, timeout, keepAlive }) {
    this.host = host
    this.port = port
    this.timeout = timeout
    this.keepAlive = keepAlive

    // 工具函数
    this.isReceiveComplete = null
    this.encode = null
    this.decode = null

    // 一些连接中和关闭中的状态
    this.connecting = false
    this.closing = false
    this.callingClose = false

    this.socket = null

    // 用来存储每个请求的回调和序号,{ seq: { seq, callback } }
    this.sentRequest = {}

    // 处理连接超时问题
    this.connectTimer = null

    // 处理响应超时
    this.responseTimer = null

    // 记录会话数量
    this.sessions = 0

    // 如果还没连接成功前发出的请求需要放到队列里，等连接成功后执行
    this.unsendRequestQueue = []
  }

  write(data, callback) {
    // 如果正在建立连接，或者正在关闭连接，则先暂存请求
    if (this.between_connect || this.between_close) {
      this.unsendRequestQueue.push((err) => {
        if (err) {
          callback(err)
        } else {
          this.write(data, callback)
        }
      })
      return 'wait'
    }
    if (!this.port) {
      callback(new Error('require port param'))
      return
    }
    if (this.socket) {
      // 并发情况下靠这个序列标识哪个返回是哪个请求
      const seq = (this.seq = (this.seq + 1) % 10000)

      // 编码
      let reqBuffer

      try {
        reqBuffer = this.encode(data, req)
      } catch (error) {
        callback(error, null)
        return
      }

      // 为响应增加超时. 回调需要在on('data')中执行，所以我们需要在回调中清除定时器
      // 如果到时间回调还未执行，则说明超时
      const responseTimer = setTimeout(() => {
        callback(new Error('response timeout'))
        this.sessions--
        this.sentRequest[req] = null
      }, this.timeout)

      this.sentRequest[req] = {
        req,
        callback: (err, result) => {
          if (responseTimer) {
            clearTimeout(responseTimer)
          }
          callback(err, result)
        },
      }
      this.sessions++
      this.socket.write(reqBuffer)
      return 'write'
    } else {
      // 未初始化，先暂存请求
      this.unsendRequestQueue.push((err) => {
        if (err) {
          callback(err)
        } else {
          this.write(data, callback)
        }
      })
      this.#init(callback)
      return 'init'
    }
  }

  #init() {
    let buffer = null
    const socket = (this.socket = new net.Socket())

    socket.setKeepAlive(this.keepAlive)

    this.#addTimeout()

    socket
      .on('connect', () => {
        // 清除超时定时器
        clearTimeout(this.connectTimer)
        this.connecting = false

        // 调用连接建立前缓存的请求
        this.#sendCachedRequests()
      })
      .on('data', (data) => {
        if (data && data.length) {
          buffer =
            buffer && buffer.length > 0 ? Buffer.concat([buffer, data]) : data
        }
        // 如不是完整包返回0，是完整包返回具体的size
        let packageSize = null
        while (buffer && (packageSize = this.isReceiveComplete(buffer))) {
          let respBuffer = null
          if (packageSize === buffer.length) {
            // 只有一个包
            respBuffer = buffer
            buffer = null
          } else {
            // 有粘包情况
            respBuffer = buffer.subarray(0, packageSize)
            buffer = buffer.subarray(packageSize)
          }
          try {
            const { seq, result, error } = this.decode(respBuffer)
            // 将sentRequest中该请求置空
            if (this.sentRequest[seq]) {
              const { callback } = this.sentRequest[seq]

              this.sentRequest[seq] = null
              // 会话数-1
              this.sessions--

              // 看是否是长连接，选择性关闭
              this.#tryCloseSocket()

              // 执行回调
              if (!result && error) {
                callback(result.error)
              } else {
                callback(null, result)
              }
            }
          } catch (e) {
            socket.destroy()
          }
        }
      })
      .on('error', (error) => {
        this.#handleGlobalError(error)
        socket.destroy()
        this.socket = null
      })
      .on('close', () => {
        this.callingClose = false
        this.between_close = false
        this.socket = null
        this.sessions = 0

        // 如果在关闭时收到了请求，需要将请求放到队列里
        if (this.unsendRequestQueue.length) {
          this.#sendCachedRequests()
        }
      })

    // 建立连接
    socket.connect({
      port: this.port,
      host: this.host,
    })

    this.between_connect = true
  }

  #addConnectTimeout() {
    this.connectTimer = setTimeout(
      () => {
        clearTimeout(this.connectTimer)
        this.#handleGlobalError(new Error('connect timeout'))
        // 连接还未建立，所以不用this.socket.destory()
        this.socket = null
        this.connecting = false
      },
      this.timeout ? this.timeout * 3 : 3000,
    )
  }

  /**
   * 这个方法需要定位到某一个请求出错才行
   * @param {*} err
   */
  #handleGlobalError(err) {
    this.between_close = false
    this.between_connect = false
    clearTimeout(this.connectTimer)

    // 处理未发出去的请求的回调，将错误传递给回调
    while (this.unsendRequestQueue.length) {
      const reqCallback = this.unsendRequestQueue.shift()
      reqCallback(err)
    }

    // 处理之前已经发出去的请求的回调，将错误传递给回调
    Object.keys(this.sentRequest).forEach((key) => {
      const ctx = this.sentRequest[key]
      if (typeof ctx.callback === 'function') {
        ctx.callback(err)
        this.sentRequest[key] = null
        this.sessions--
      }
    })
    // 销毁连接
    this.socket.destroy()
  }

  #sendCachedRequests() {
    const requests = this.unsendRequestQueue.shift()
    requests()
    setImmediate(() => {
      // 下一帧执行
      if (this.unsendRequestQueue.length) {
        this.#sendCachedRequests()
      }
    })
  }

  close() {}

  #tryCloseSocket() {}
}
