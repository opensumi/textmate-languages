module.exports = (registerLanguage, registerGrammar) => (
  languages = [],
  grammers = []
) => {
  for (const language of languages) {
    registerLanguage(language)
  }

  for (const grammar of grammers) {
    registerGrammar(grammar)
  }
}
