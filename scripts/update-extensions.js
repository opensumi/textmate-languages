const path = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const { ExtensionInstaller } = require('@ali/ide-extension-installer')
const Promise = require('bluebird')

const pkg = require('../package.json')
const account = require('./account')()

// 放置 kaitian extension 的目录
const targetDir = path.resolve(__dirname, '../extensions')

const extensionInstaller = new ExtensionInstaller({
  accountId: account.accountId,
  masterKey: account.masterKey,
  frameworkVersion: pkg.version,
  dist: targetDir,
  ignoreIncreaseCount: true
})

// vscode extension 的 tar 包 oss 地址
const { extensions } = require(path.resolve(
  __dirname,
  '../config/extensions.json'
))

const downloadVscodeExtensions = async () => {
  console.log('清空 extensions 目录：%s', targetDir)
  rimraf.sync(targetDir)
  mkdirp.sync(targetDir)

  for (const publisher of Object.keys(extensions)) {
    Promise.map(
      extensions[publisher],
      async (item) => {
        const { name, version } = item
        console.log('开始安装：%s', name)
        await extensionInstaller.install({
          publisher,
          name,
          version
        })
      },
      { concurrency: 3 }
    )
  }

  console.log('安装完毕')
}

// 执行并捕捉异常
downloadVscodeExtensions().catch((e) => {
  console.trace(e)
  process.exit(128)
})
