interface ILanguageDesc {
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

declare module '@opensumi/textmate-languages' {
  export type loadLanguageAndGrammar = (
    registerLanguage: (languageContribution: any, extPath: any) => Promise<void>,
    registerGrammar: (grammarContribution: any, extPath: any) => Promise<void>,
  ) => Promise<void>[];

  export type LanguageDesc = ILanguageDesc
}

declare module '@opensumi/textmate-languages/es/utils' {
  export function getLanguageByExtnameAndFilename(extname: string, filename?: string): ILanguageDesc | undefined;
  export function getLanguageById(languageId: string): ILanguageDesc | undefined;
  /**
   * @deprecated please use `getLanguageById` instead
   * @param languageId
   */
  export function hasLanguageId(languageId: string): boolean;
}

declare module '@opensumi/textmate-languages/lib/utils' {
  export function getLanguageByExtnameAndFilename(extname: string, filename?: string): ILanguageDesc | undefined;
  export function getLanguageById(languageId: string): ILanguageDesc | undefined;
  /**
   * @deprecated please use `getLanguageById` instead
   * @param languageId
   */
  export function hasLanguageId(languageId: string): boolean;
}
