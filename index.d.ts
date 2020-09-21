declare module '@ali/kaitian-textmate-languages' {
  export type loadLanguageAndGrammar = (
    registerLanguage: (languageContribution: any, extPath: any) => Promise<void>,
    registerGrammar: (grammarContribution: any, extPath: any) => Promise<void>,
  ) => Promise<void>[];
}

interface LanguageDesc {
  id: string;
  extensions: string[];
  aliases: string[];
  configuration: string;
  filenames?: string[];
  firstLine?: string;
  /**
   * 拓展字段，用来标识当前 language 是来源于哪个插件语言包
   */
  extensionPackageName?: string;
}

declare module '@ali/kaitian-textmate-languages/es/utils' {
  export function getLanguageIdByExtnameAndFilename(extname: string, filename?: string): LanguageDesc | undefined;
  export function hasLanguageId(languageId: string): boolean;
}

declare module '@ali/kaitian-textmate-languages/lib/utils' {
  export function getLanguageIdByExtnameAndFilename(extname: string, filename?: string): LanguageDesc | undefined;
  export function hasLanguageId(languageId: string): boolean;
}
