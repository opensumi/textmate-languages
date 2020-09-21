module.exports = (registerLanguage, registerGrammar) => (
  languages = [],
  grammars = []
) => {
  return [
    ...languages.map(language => registerLanguage(language)),
    ...grammars.map(grammar => registerGrammar(grammar)),
  ];
}
