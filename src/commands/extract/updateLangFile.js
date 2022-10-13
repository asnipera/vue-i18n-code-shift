const fs = require('fs-extra');
const slash = require('slash2');
const _ = require('lodash');
const randomstring = require('randomstring');
const { getLangData } = require('./getLangData');
const { getProjectConfig, getLangDir } = require('../../utils/config');
const { formatText, prettierFile } = require('../../utils/common');
const { mkdirsSync } = require('../../utils/dir');

const CONFIG = getProjectConfig();
const srcLangDir = getLangDir(CONFIG.srcLang);

function updateLangFiles(filename, translatedFiles) {
  const targetFilename = `${srcLangDir}/${filename}.js`;
  if (!fs.existsSync(targetFilename)) {
    const dir = slash(targetFilename).split('/').slice(0, -1).join('/');
    mkdirsSync(dir);
    fs.writeFileSync(
      targetFilename,
      updateExistLangFile(null, translatedFiles)
    );
    // addImportToMainLangFile(filename);
  } else {
    fs.writeFileSync(
      targetFilename,
      updateExistLangFile(targetFilename, translatedFiles)
    );
  }
}

function updateLangFileWithNewText(filename, textPairs) {
  let obj = {};
  if (filename) {
    const fileContent = getLangData(filename);
    obj = fileContent;
    if (Object.keys(obj).length === 0) {
      console.log(`${filename} 解析失败，该文件包含的文案无法自动补全`);
      return;
    }
  }

  textPairs.forEach(({ key, value }) => {
    if (key) {
      _.set(obj, key, value);
    }
  });

  const newContent = prettierFile(
    `export default ${JSON.stringify(obj, null, 2)}`
  );
  fs.writeFileSync(filename, newContent);
}

function getLasteKeyIndex() {
  const { vicsDir, srcLang } = CONFIG;
  const langFile = `${vicsDir}/${srcLang}/index.js`;
  const initKeyIndex = 0;

  if (!fs.existsSync(langFile)) {
    return initKeyIndex;
  }
  const lang = fs.readFileSync(langFile, 'utf8');
  const match = lang.replace(/\n/g, '').match(/(?<=key)\d+(?=:)/g);
  return match ? match[match.length - 1] : initKeyIndex;
}

function updateExistLangFile(filename, translations) {
  let obj = {};
  if (filename) {
    const fileContent = getLangData(filename);
    obj = fileContent;
    if (Object.keys(obj).length === 0) {
      console.log(`${filename} 解析失败，该文件包含的文案无法自动补全`);
      return;
    }
  }
  let keyIndex = getLasteKeyIndex();
  translations.forEach(({ texts, translatedTexts }) => {
    const unTranslatedTexts = texts.filter((text) => {
      return !Object.values(obj).includes(text);
    });
    if (unTranslatedTexts.length) {
      const { keyPrefix } = CONFIG;
      unTranslatedTexts.forEach((value) => {
        let key = '';
        if (keyPrefix) {
          key = `${keyPrefix}${++keyIndex}`;
        } else {
          const translateTextIndex = texts.indexOf(value);
          key = translatedTexts[translateTextIndex];
        }
        _.set(obj, key, value);
      });
    }
  });
  return prettierFile(`export default ${JSON.stringify(obj, null, 2)}`);
}

let importModuleIndex = 0;
function addImportToMainLangFile(newFilename) {
  newFilename = newFilename.replace(/\\/g, '/');
  let mainContent = '';
  importModuleIndex++;
  moduleName = `ImportModuleName${importModuleIndex}`;
  if (fs.existsSync(`${srcLangDir}/index.js`)) {
    mainContent = fs.readFileSync(`${srcLangDir}/index.js`, 'utf8');
    const matchs = mainContent.match(/import\s+.*\s+from\s+['"].*['"]/g);
    let lastImport = '';
    let replaceValue = `import ${moduleName} from './${newFilename}';`;
    if (matchs && matchs.length) {
      lastImport = matchs[matchs.length - 1] + ';';
      replaceValue = `$1\n${replaceValue}`;
    } else {
      lastImport = 'export default {';
      replaceValue = `${replaceValue}\n$1`;
    }
    mainContent = mainContent.replace(
      new RegExp(`(${lastImport})`),
      replaceValue
    );
    if (/(}\);)/.test(mainContent)) {
      if (/\,\n(}\);)/.test(mainContent)) {
        /** 最后一行包含,号 */
        mainContent = mainContent.replace(/(}\);)/, `  ${moduleName},\n$1`);
      } else {
        /** 最后一行不包含,号 */
        mainContent = mainContent.replace(
          /\n(}\);)/,
          `,\n  ${moduleName},\n$1`
        );
      }
    }
    // 兼容 export default { common };的写法
    if (/(};)/.test(mainContent)) {
      if (/\,\n(};)/.test(mainContent)) {
        /** 最后一行包含,号 */
        mainContent = mainContent.replace(/(};)/, `  ${moduleName},\n$1`);
      } else {
        /** 最后一行不包含,号 */
        mainContent = mainContent.replace(/\n(};)/, `,\n  ${moduleName},\n$1`);
      }
    }
  } else {
    mainContent = `import ${moduleName} from './${newFilename}';\n\nexport default Object.assign({}, {\n  ${moduleName},\n});`;
  }

  fs.writeFileSync(`${srcLangDir}/index.js`, mainContent);
}

module.exports = { updateLangFiles, updateLangFileWithNewText };
