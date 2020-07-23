const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const { template, templateSettings } = require('lodash')
const fse = require('fs-extra')
const prettier = require('prettier')
const bluebird = require('bluebird')
const stripJsonComments = require('strip-json-comments')

const entryTemplate = require('./entry-template')

const extensionsDir = path.resolve(__dirname, '../extensions')
const targetDir = path.resolve(__dirname, '../lib')
const targetEsDir = path.resolve(__dirname, '../es')

templateSettings.escape = false

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
    await this.contributes(extPkgJson, targetDir, false)
    await this.contributes(extPkgJson, targetEsDir, true)
  }

  async contributes(extDesc, outDir, esMode = false) {
    // create a folder for ext
    const extOutDir = path.join(outDir, extDesc.name)
    await fse.ensureDir(extOutDir)
    // handle langauges/grammars
    await this.collectLanguages(extDesc.contributes, extOutDir)
    await this.collectGrammars(extDesc.contributes, extOutDir)
    await this.writeEntry(extOutDir, esMode)
  }

  async writeEntry(extOutDir, esMode) {
    // compile entry template
    const data = this.toJSON()
    const compiled = template(entryTemplate)
    const requireKeyword = esMode ? 'import' : 'require'
    /**
     * dirty works for replace path to `require({path})`
     * match `"configuration": "./language-configuration.json"`
     * and then replace it with require
     * use `non-greedy mode`
     */
    const languageStr = JSON.stringify(data.languages).replace(
      /"configuration":\s*(".+?.json?")/g,
      `configuration:${requireKeyword}($1)`
    )
    /**
     * 处理以下字符串，因为有 tmLanguage 后缀，因此将 `.json` 设置为可选匹配项
     * `"path": "./syntaxes/Regular Expressions (JavaScript).tmLanguage"`
     * `"path": "./syntaxes/JavaScript.tmLanguage.json"`
     */
    const grammarStr = JSON.stringify(data.grammars).replace(
      /"path":\s*(".+?[.json]?")/g,
      `path:${requireKeyword}($1)`
    )

    const content = compiled({
      languages: languageStr,
      grammars: grammarStr
    })

    await fse.writeFile(
      path.resolve(extOutDir, 'index.js'),
      // format by prettier
      prettier.format(content, require('../.prettierrc')),
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
        if (language.configuration) {
          const targetFilename = path.basename(language.configuration)
          // 收集 language 并将 configration#string 转成 require 语法
          this.desc.languages.push({
            ...language,
            configuration: './' + targetFilename.trim()
          })

          return this.copyFileWithoutComments(
            path.resolve(this.extPath, language.configuration),
            path.resolve(extOutDir, targetFilename)
          )
        }
        // 收集 language
        this.desc.languages.push(language)
      },
      { concurrency: 3 }
    )
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
          return this.copyFileWithoutComments(
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

  async copyFileWithoutComments(from, to, stripComment = true) {
    if (path.extname(from) !== '.json') {
      console.warn(`${from} is not a json file`)
      return fse.copyFile(from, to)
    }
    const jsonContent = await promisify(fs.readFile)(from, { encoding: 'utf8' })
    const newContent = stripJsonComments(jsonContent, { whitespace: false })
    await promisify(fs.writeFile)(to, newContent, { encoding: 'utf8' })
  }

  toJSON() {
    // handle language/grammar entry
    return this.desc
  }
}

async function generate() {
  try {
    for (const dir of [targetDir, targetEsDir]) {
      await fse.emptyDir(dir)
    }
    // copy `loader.js`
    await fse.copyFile(
      path.resolve(__dirname, './loaders/loader.js'),
      path.resolve(targetDir, './loader.js')
    )
  
    // copy `loader-es.js`
    await fse.copyFile(
      path.resolve(__dirname, './loaders/loader-es.js'),
      path.resolve(targetEsDir, './loader.js')
    )
  
    const extensionNames = await promisify(fs.readdir)(extensionsDir)
    for (const extName of extensionNames) {
      // read extension package.json
      const extPath = path.resolve(extensionsDir, extName)
      const extension = new Extension(extPath)
      await extension.run()
    }
  } catch (err) {
    console.log(err)
    process.exit(128)
  }
}

generate()
