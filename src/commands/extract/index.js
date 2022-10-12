const slash = require('slash2');
const _ = require('lodash');
const fs = require('fs');
const { getDirsByLevel } = require('../../utils/file');
const { findAllChineseText } = require('../../utils/findChineseText');
const { translateFiles } = require('../../utils/translate');
const { getProjectConfig } = require('../../utils/config');
const { updateLangFiles } = require('./updateLangFile');

const CONFIG = getProjectConfig();

const extractDir = async (dirPath, langFile) => {
  const translateTargets = findAllChineseText(dirPath);

  if (translateTargets.length === 0) {
    console.log(`${dirPath} 没有发现可替换的文案！`);
    return;
  }

  const translatedTargets = await translateFiles(translateTargets);

  await updateLangFiles(`index`, translatedTargets);
};

const extractDirs = async (dirs, langFile) => {
  for await (let dirPath of dirs) {
    if (dirPath && fs.statSync(dirPath).isDirectory()) {
      console.log(`开始提取 ${dirPath} 目录`);
      await extractDir(dirPath, langFile);
      console.log(`${dirPath} 提取完成！`);
    } else {
      console.log(`${dirPath} 不存在！`);
    }
  }
};

const extractAll = async (dir, depth = '0', langFile) => {
  if (!CONFIG.baiduAppid) {
    console.log('请配置 baiduAppid');
    return;
  }

  while (depth != undefined) {
    if (depth === '0') {
      await extractDir(dir, langFile);
      depth++;
    } else {
      const dirs = getDirsByLevel(dir, depth);
      if (dirs.length) {
        await extractDirs(dirs, langFile);
        depth++;
      } else {
        depth = undefined;
      }
    }
  }
};

module.exports = { extractAll };
