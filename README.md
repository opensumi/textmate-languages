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

### resolvedContent 字段
* 为了跟原本插件的 contribute 的 `path/configuration` 字段区分开，统一使用 resolvedContent 挂载原本的 json file 中的内容，如

* `"configuration": "./language-configuration.json"` --> `"resolvedContent": require('./language-configuration.json')`
* `"path": "./syntaxes/JavaScript.tmLanguage.json"` --> `"resolvedContent": require('./syntaxes/JavaScript.tmLanguage.json')

### tmLanguage 文件
由于 require 语法导致在 webpack 中需要额外添加 raw-loader 去处理 tmLanguage 文件，且会导致 resolvedContent 的内容格式不统一，因此目前都通过 fork vscode 插件 [TextMate Languages] 将 tmLanguage 转成 json

目前已经被 fork 过的语言插件列表如下:
* javascript
