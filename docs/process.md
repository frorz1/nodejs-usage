process是内置的进程管理器模块，这里列举一些常用的属性

```js
process {
  version: 'v18.16.0',
  versions: {
    node: '18.16.0',
    acorn: '8.8.2',
    ada: '1.0.4',
    // [...]
  },
  arch: 'x64',
  platform: 'darwin',
  // 查看cpu的使用情况
  cpuUsage: [Function: cpuUsage],
  resourceUsage: [Function: resourceUsage],
  // 查看内存的使用情况， 它和cpuUsage常用来进行优化时的分析
  memoryUsage: [Function: memoryUsage] { rss: [Function: rss] },
  kill: [Function: kill],
  // 退出进程
  exit: [Function: exit],
  hrtime: [Function: hrtime] { bigint: [Function: hrtimeBigInt] },
  
  // 微任务，类似于浏览器端的queueMicrotask，MutationObserver 
  nextTick: [Function: nextTick],
  
  // 标准输入输出
  stdout: [Getter],
  stdin: [Getter],
  stderr: [Getter],
  abort: [Function: abort],
  // 命令执行时所在的目录
  cwd: [Function: wrappedCwd],

  // 一些环境变量参数，如过在运行node时设置env，则会出现在该属性中。
  // 如： NODE_ENV=test node src/index.js
  env: {
    MallocNanoZone: '0',
    USER: 'rudy.feng',
    SECURITYSESSIONID: '186a6',
    COMMAND_MODE: 'unix2003',
    __CFBundleIdentifier: 'com.microsoft.VSCode',
    PATH: '/Users/rudy.feng/.gem/bin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/Apple/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin',
    HOME: '/Users/rudy.feng',
    SHELL: '/bin/zsh',
    LaunchInstanceID: '89CB5A3E-E95F-4AE3-B783-062A32947802',
    __CF_USER_TEXT_ENCODING: '0x1F7:0x19:0x34',
    XPC_SERVICE_NAME: '0',
    SSH_AUTH_SOCK: '/private/tmp/com.apple.launchd.9m3gdql486/Listeners',
    XPC_FLAGS: '0x0',
    LOGNAME: 'rudy.feng',
    TMPDIR: '/var/folders/_z/8b_ln_bj1zb30w0jzy7l5js00000gq/T/',
    ORIGINAL_XDG_CURRENT_DESKTOP: 'undefined',
    TERM_PROGRAM: 'vscode',
    TERM_PROGRAM_VERSION: '1.70.2',
    LANG: 'zh_CN.UTF-8',
    COLORTERM: 'truecolor',
    GIT_ASKPASS: '/private/var/folders/_z/8b_ln_bj1zb30w0jzy7l5js00000gq/T/AppTranslocation/4FF53AC5-FCD0-45E8-AFDA-45B76E28551E/d/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass.sh',
    VSCODE_GIT_ASKPASS_NODE: '/private/var/folders/_z/8b_ln_bj1zb30w0jzy7l5js00000gq/T/AppTranslocation/4FF53AC5-FCD0-45E8-AFDA-45B76E28551E/d/Visual Studio Code.app/Contents/Frameworks/Code Helper.app/Contents/MacOS/Code Helper',
    VSCODE_GIT_ASKPASS_EXTRA_ARGS: '--ms-enable-electron-run-as-node',
    VSCODE_GIT_ASKPASS_MAIN: '/private/var/folders/_z/8b_ln_bj1zb30w0jzy7l5js00000gq/T/AppTranslocation/4FF53AC5-FCD0-45E8-AFDA-45B76E28551E/d/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass-main.js',
    VSCODE_GIT_IPC_HANDLE: '/var/folders/_z/8b_ln_bj1zb30w0jzy7l5js00000gq/T/vscode-git-ba0bc9fb0a.sock',
    VSCODE_INJECTION: '1',
    ZDOTDIR: '/var/folders/_z/8b_ln_bj1zb30w0jzy7l5js00000gq/T/vscode-zsh',
    PWD: '/Users/rudy.feng/fet/my-github/nodejs-usage',
    TERM: 'xterm-256color',
    SHLVL: '1',
    OLDPWD: '/Users/rudy.feng/fet/my-github',
    ZSH: '/Users/rudy.feng/.oh-my-zsh',
    GEM_HOME: '/Users/rudy.feng/.gem',
    NVM_DIR: '/Users/rudy.feng/.nvm',
    NVM_CD_FLAGS: '-q',
    PAGER: 'less',
    LESS: '-R',
    LSCOLORS: 'Gxfxcxdxbxegedabagacad',
    AUTOJUMP_SOURCED: '1',
    AUTOJUMP_ERROR_PATH: '/Users/rudy.feng/Library/autojump/errors.log',
    _: '/usr/local/bin/node'
  },
  title: 'node',
  // 运行时的参数，如node index.js aaa, 则argv[2] === aaa
  argv: [
    '/usr/local/bin/node',
    '/Users/rudy.feng/fet/my-github/nodejs-usage/src/module-explain.js'
  ],
  pid: 58473,
  ppid: 14104,
}
```