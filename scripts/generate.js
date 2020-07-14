const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const { template, templateSettings } = require('lodash')
const fse = require('fs-extra')
const prettier = require('prettier')
const bluebird = require('bluebird')

const entryTemplate = require('./entry-template')

const extensionsDir = path.resolve(__dirname, '../extensions')
const targetDir = path.resolve(__dirname, '../lib')

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
    // create a folder for ext
    this.extOutDir = path.join(targetDir, extPkgJson.name)
    await fse.ensureDir(this.extOutDir)
    // handle langauges/grammars
    await this.collectLanguages(extPkgJson.contributes)
    await this.collectGrammars(extPkgJson.contributes)
    await this.writeEntry()
  }

  async writeEntry() {
    // compile entry template
    const data = this.toJSON()
    const compiled = template(entryTemplate)
    /**
     * dirty works for replace path to `require({path})`
     * match `"configuration": "./language-configuration.json"`
     * and then replace it with require
     */
    const languageStr = JSON.stringify(data.languages).replace(
      /"configuration":\s*(".+?\.json")/g,
      'configuration:require($1)'
    )
    const grammarStr = JSON.stringify(data.grammars).replace(
      /"path":\s*(".+?\.json")/g,
      'path:require($1)'
    )

    const content = compiled({
      languages: languageStr,
      grammars: grammarStr
    })

    await fse.writeFile(
      path.resolve(this.extOutDir, 'index.js'),
      // format by prettier
      prettier.format(content, require('../.prettierrc')),
      'utf8'
    )
  }

  // handle monaco languages#configuration
  async collectLanguages(contributes = {}) {
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
            configuration: path.join('./', targetFilename)
          })

          return fse.copyFile(
            path.resolve(this.extPath, language.configuration),
            path.resolve(this.extOutDir, targetFilename)
          )
        }
        // 收集 language
        this.desc.languages.push(language)
      },
      { concurrency: 3 }
    )
  }

  // handle textmate grammars#path
  async collectGrammars(contributes = {}) {
    const { grammars } = contributes
    if (!Array.isArray(grammars) || !grammars.length) {
      console.warn('no contributes#grammars')
      return
    }

    // ensure dir for tmLanguage
    const grammarDir = path.resolve(this.extOutDir, './syntaxes')
    await fse.ensureDir(grammarDir)

    await bluebird.map(
      grammars,
      grammar => {
        if (grammar.path) {
          const targetFilename = path.basename(grammar.path)

          // 收集 grammar 并将 path#string 转成 require 语法
          this.desc.grammars.push({
            ...grammar,
            path: path.join('./syntaxes/', targetFilename)
          })
          return fse.copyFile(
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

  toJSON() {
    // handle language/grammar entry
    return this.desc
  }
}

async function generate() {
  await fse.emptyDir(targetDir)

  const extensionNames = await promisify(fs.readdir)(extensionsDir)

  const result = []

  for (const extName of extensionNames) {
    // read extension package.json
    const extPath = path.resolve(extensionsDir, extName)
    const extension = new Extension(extPath)
    await extension.run()
    result.push(extension.toJSON())
  }
}

generate()
