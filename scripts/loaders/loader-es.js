export default (registerLanguage, registerGrammar) => (
  languages = [],
  grammars = []
) => {
  for (const language of languages) {
    registerLanguage(language)
  }

  for (const grammar of grammars) {
    registerGrammar(grammar)
  }
}
