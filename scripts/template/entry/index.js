module.exports = `
const loader = require('../loader')

module.exports = (registerLanguage, registerGrammar) => {
  const languages = <%= languages %>

  const grammars = <%= grammars %>

  return loader(registerLanguage, registerGrammar)(languages, grammars)
}
`.trim()
