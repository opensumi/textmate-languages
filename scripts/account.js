const yaml = require('js-yaml')
const fs = require('fs')
const os = require('os')
const path = require('path')

module.exports = () => {
  // tricky to read kaitian
  try {
    const ymlPath = path.resolve(os.homedir(), '.ali-kaitian-cli/config.yml')
    const doc = yaml.safeLoad(fs.readFileSync(ymlPath, 'utf8'))
    return doc && doc.teamAccounts && doc.teamAccounts.kaitian
  } catch (e) {
    console.log(e)
  }
}
