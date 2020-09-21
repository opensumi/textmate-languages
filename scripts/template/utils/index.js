const languageList = require('./language-list');

/**
 * 通过 extname 配合 filename 获取对应的语言
 * @param {string} extname
 * @param {string} filename
 */
exports.getLanguageIdByExtnameAndFilename = (extname, filename) => {
  // 先用 filename 去查找
  let result = languageList.find(language => Array.isArray(language.filenames) && language.filenames.includes(filename));
  if (!result) {
    result = languageList.find(language => Array.isArray(language.extensions) && language.extensions.includes(extname));
  }
  return result;
};

/**
 * 是否存在对应的 language id
 * @param {string} languageId
 * @returns boolean
 */
exports.hasLanguageId = (languageId) => {
  return languageList.findIndex(language => language.id === languageId) > -1;
}
