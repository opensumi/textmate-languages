module.exports = `
import loader from '../loader'

export default (registerLanguage, registerGrammar) => {
  const languages = <%= languages %>

  const grammars = <%= grammars %>

  return loader(registerLanguage, registerGrammar)(languages, grammars)
}
`.trim()
