module.exports = `
const loader = require('../loader')

export default (registerLanguage, registerGrammar) => {
  const languages = <%= languages %>

  const grammars = <%= grammars %>

  return loader(registerLanguage, registerGrammar)(languages, grammars)
}
`.trim()
