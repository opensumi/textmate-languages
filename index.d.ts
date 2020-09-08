declare module '@ali/kaitian-textmate-languages' {
  export type loadLanguageAndGrammar = (
    registerLanguage: (languageContribution: any, extPath: any) => Promise<void>,
    registerGrammar: (grammarContribution: any, extPath: any) => Promise<void>,
  ) => Promise<void>[];
}
