const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const { template, templateSettings } = require('lodash')
const plist = require('plist')
const fse = require('fs-extra')
const prettier = require('prettier')
const bluebird = require('bluebird')
const stripJsonComments = require('strip-json-comments')

const entryTemplate = require('./template/entry')
const entryTemplateEs = require('./template/entry/index-es')

const extensionsDir = path.resolve(__dirname, '../extensions')
const targetDir = path.resolve(__dirname, '../lib')
const targetEsDir = path.resolve(__dirname, '../es')

templateSettings.escape = false

const ResolvedConfigFiled = 'resolvedConfiguration';

// format by prettier
function pretty(content) {
  return prettier.format(content, require('../.prettierrc'));
}

class Extension {
  constructor(extPath) {
    this.extPath = extPath
    this.desc = {
      languages: [],
      grammars: []
    }
  }

  async run() {
    const extPkgJson = await fse.readJSON(
      path.resolve(this.extPath, './package.json')
    )
    // 将 package.json 内容挂到 Extension 实例上
    this.pkgJson = extPkgJson
    await this.contributes(targetDir, false)
    await this.contributes(targetEsDir, true)
  }

  async contributes(outDir, esMode = false) {
    // create a folder for ext
    const extOutDir = path.join(outDir, this.pkgJson.name)
    await fse.ensureDir(extOutDir)
    // handle languages/grammars
    await this.collectLanguages(this.pkgJson.contributes, extOutDir)
    await this.collectGrammars(this.pkgJson.contributes, extOutDir)
    await this.writeEntry(extOutDir, esMode)
  }

  async writeEntry(extOutDir, esMode) {
    // compile entry template
    const data = this.toJSON()
    const compiled = template(esMode ? entryTemplateEs : entryTemplate)
    const requireKeyword = esMode ? 'import' : 'require'
    /**
     * dirty works for replace path to `require({path})`
     * match `"configuration": "./language-configuration.json"`
     * and then replace it with require
     * use `non-greedy mode`
     */
    const languageStr = JSON.stringify(data.languages).replace(
      /"configuration":\s*(".+?(?:.json)")/g,
      `${ResolvedConfigFiled}:${requireKeyword}($1)`
    )
    /**
     * 处理以下字符串，因为有 tmLanguage 后缀，因此将 `.json` 设置为可选匹配项
     * `"path": "./syntaxes/JavaScript.tmLanguage.json"`
     * `"path": "./syntaxes/Regular Expressions (JavaScript).tmLanguage"`
     * 由于 require 语法导致在 webpack 中需要额外添加 raw-loader 去处理 tmLanguage 文件
     * 且会导致 resolvedContent 的内容格式不统一
     * <del>因此目前都通过 fork vscode 插件 [TextMate Languages] 将 tmLanguage 转成 json</del>
     * 已使用 `plist` 直接将 tmLanguage 文件转换成 json 格式
     */
    const grammarStr = JSON.stringify(data.grammars).replace(
      // 为了处理 tmLanguage 转 json 的问题，将结尾的 `"` 号放在捕获分组之外了
      /"path":\s*(".+?(\.json|\.tmLanguage?))"/g,
      (_, p1, p2) => {
        // 下方 this.copyTextmateFiles 会处理 tmLanguage 转 json 的逻辑
        const suffix = p2 === '.tmLanguage' ? p1 + '.json' : p1
        return `${ResolvedConfigFiled}:${requireKeyword}(${suffix}")`
      }
    )

    const content = compiled({
      languages: languageStr,
      grammars: grammarStr
    })

    await fse.writeFile(
      path.resolve(extOutDir, 'index.js'),
      pretty(content),
      'utf8'
    )
  }

  // handle monaco languages#configuration
  async collectLanguages(contributes = {}, extOutDir) {
    const { languages } = contributes
    if (!Array.isArray(languages) || !languages.length) {
      console.warn('no contributes#languages')
      return
    }

    await bluebird.map(
      languages,
      language => {
        if (!language.configuration) {
          this.collectLanguage(language)
          return
        }

        const targetFilename = path.basename(language.configuration)
        // 收集 language 并将 configuration#string 转成 require 语法
        this.collectLanguage({
          ...language,
          configuration: './' + targetFilename.trim()
        })

        return this.copyTextmateFiles(
          path.resolve(this.extPath, language.configuration),
          path.resolve(extOutDir, targetFilename)
        )
      },
      { concurrency: 3 }
    )
  }

  collectLanguage(language) {
    // 因为上方执行了两次 collect contributes 因此做了一个去重
    if (!this.desc.languages.find(n => n.id === language.id)) {
      // 收集 language
      this.desc.languages.push(language)
    }
  }

  // handle textmate grammars#path
  async collectGrammars(contributes = {}, extOutDir) {
    const { grammars } = contributes
    if (!Array.isArray(grammars) || !grammars.length) {
      console.warn('no contributes#grammars')
      return
    }

    // ensure dir for tmLanguage
    const grammarDir = path.resolve(extOutDir, './syntaxes')
    await fse.ensureDir(grammarDir)

    await bluebird.map(
      grammars,
      grammar => {
        if (grammar.path) {
          const targetFilename = path.basename(grammar.path)

          // 收集 grammar 并将 path#string 转成 require 语法
          this.desc.grammars.push({
            ...grammar,
            path: './syntaxes/' + targetFilename.trim()
          })
          return this.copyTextmateFiles(
            path.resolve(this.extPath, grammar.path),
            path.resolve(grammarDir, targetFilename)
          )
        }
        // 收集 grammar
        this.desc.grammars.push(grammar)
      },
      { concurrency: 3 }
    )
  }

  async copyTextmateFiles(from, to) {
    const ext = path.extname(from);
    switch (ext) {
      case '.json':
        this.copyJSONFileWithoutComments(from, to);
        break;
      case '.tmLanguage':
        this.convertTmFileToJson(from, to);
        break;        
    }
  }

  async copyJSONFileWithoutComments(from, to) {
    if (path.extname(from) !== '.json') {
      console.warn(`${from} is not a json file skipped`)
      return
    }
    let jsonContent = await promisify(fs.readFile)(from, { encoding: 'utf8' })
    jsonContent = stripJsonComments(jsonContent, { whitespace: false })
    await promisify(fs.writeFile)(to, jsonContent, { encoding: 'utf8' })
  }

  async convertTmFileToJson(from, to) {
    if (path.extname(from) !== '.tmLanguage') {
      return
    }

    let pListContent = await promisify(fs.readFile)(from, { encoding: 'utf8' })
    try {
      const plistDesc = plist.parse(pListContent)
      pListContent = JSON.stringify(plistDesc, null, 2)
    } catch (error) {
      console.log(`Parse error for: ${from}`)
      console.error(error)
    }

    // 将目标文件转换成 json 格式
    to = to + '.json'
    await promisify(fs.writeFile)(to, pListContent, { encoding: 'utf8' })
  }

  toJSON() {
    // handle language/grammar entry
    return this.desc
  }
}

async function copyDummyFiles(filename, content, esContent) {
  // generate `grammar-list.js`
  await fse.writeFile(
    path.resolve(targetDir, filename),
    pretty(content),
  )
  await fse.writeFile(
    path.resolve(targetEsDir, filename),
    pretty(esContent),
  )
}

/**
 * 将 language-list/grammar-list 生成
 */
async function generateListFiles(extMetaList) {
  const languageList = []
  const grammarList = []
  // 将 language/grammar 收集
  extMetaList
    .forEach(extMeta => {
      const { languages, grammars } = extMeta.toJSON()
      const { name: extensionPackageName } = extMeta.pkgJson
      for (const language of languages) {
        languageList.push({
          ...language,
          extensionPackageName,
        })
      }

      for (const grammar of grammars) {
        grammarList.push({
          ...grammar,
          extensionPackageName,
        })
      }
    })

  // 排序
  languageList.sort((a, b) => a.id - b.id)
  grammarList.sort((a, b) => a.language - b.language)
  // 将收集好的 language/grammar 生成一个文件
  // generate `language-list.js`
  await copyDummyFiles(
    './language-list.js',
    `module.exports = ${JSON.stringify(languageList)}`,
    `export default ${JSON.stringify(languageList)}`,
  )

  // generate `grammar-list.js`
  await copyDummyFiles(
    './grammar-list.js',
    `module.exports = ${JSON.stringify(grammarList)}`,
    `export default ${JSON.stringify(grammarList)}`,
  )

  // copy `util.js`
  await copyDummyFiles(
    './utils.js',
    await fse.readFile(path.resolve(__dirname, './template/utils/index.js'), 'utf-8'),
    await fse.readFile(path.resolve(__dirname, './template/utils/index-es.js'), 'utf-8'),
  )
}

async function generate() {
  try {
    for (const dir of [targetDir, targetEsDir]) {
      await fse.emptyDir(dir)
    }
    // copy `loader.js`
    await copyDummyFiles(
      'loader.js',
      await fse.readFile(path.resolve(__dirname, './template/loader/index.js'), 'utf-8'),
      await fse.readFile(path.resolve(__dirname, './template/loader/index-es.js'), 'utf-8'),
    )

    const extensionNames = await promisify(fs.readdir)(extensionsDir)

    const extensionList = []
    for (const extName of extensionNames) {
      // read extension package.json
      const extPath = path.resolve(extensionsDir, extName)
      const extension = new Extension(extPath)
      await extension.run()
      extensionList.push(extension)
    }
    // 生成 meta 文件
    await generateListFiles(extensionList)
  } catch (err) {
    console.log(err)
    process.exit(128)
  }
}

generate()
