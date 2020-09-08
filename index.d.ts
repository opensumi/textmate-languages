declare module '@ali/kaitian-textmate-languages' {
  export type loadLanguageAndGrammar = (
    registerLanguage: (languageContribution: any, extPath: any),
    registerGrammar: (grammarContribution: any, extPath: any),
  ) => Promise<void>;
}
