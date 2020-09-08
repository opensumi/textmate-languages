export default async (registerLanguage, registerGrammar) => (
  languages = [],
  grammars = []
) => {
  for (const language of languages) {
    await registerLanguage(language)
  }

  for (const grammar of grammars) {
    await registerGrammar(grammar)
  }
}
