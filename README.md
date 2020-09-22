# @ali/kaitian-textmate-languages
> 目前主要用在 kaitian 纯前端版本场景下

## Usage
通过集成语言插件，将诸多语言直接合并为一个 npm 包，继而可以快速注册多种语言和语言高亮，而不需要加载诸多语言插件，继而减少资源和请求加载
* lib 目录下 loader 为 require 语法，支持打包到一起
* es 目录下 loader 为 import 语法，支持异步加载

## 语言配置
见 `config/extensions.json` 文件，目前是手动管理插件的版本信息

## 一些说明
### 异步注册
* kaitian 中注册 languages/grammars 都是异步注册的

### resovledConfiguration 字段
* 为了跟原本插件的 contribute 的 `path/configuration` 字段区分开，统一使用 resovledConfiguration 挂载原本的 json file 中的内容，如

* `"configuration": "./language-configuration.json"` --> `"resovledConfiguration": require('./language-configuration.json')`
* `"path": "./syntaxes/JavaScript.tmLanguage.json"` --> `"resovledConfiguration": require('./syntaxes/JavaScript.tmLanguage.json')

### 加载策略
* 在知道需要加载文件后缀之后可以按照文件后缀去选择需要加载的插件包即可
* 可通过 `es/utils#hasLanguageId` 方法去判断是否支持对应的语言 id
* 可通过 `es/utils#getLanguageByExtnameAndFilename` 方法传递拓展名和文件名去获取对应的语言 desc，从 `extensionPackageName` 字段可看出对应的语言包是哪一个

### tmLanguage 文件
由于 require 语法导致在 webpack 中需要额外添加 raw-loader 去处理 tmLanguage 文件，且会导致 resovledConfiguration 的内容格式不统一，因此目前都通过 fork vscode 插件 [TextMate Languages] 将 tmLanguage 转成 json

目前已经被 fork 过的语言插件列表如下:
* javascript
