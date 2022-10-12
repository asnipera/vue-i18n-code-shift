const slash = require('slash2');
const _ = require('lodash');
const fs = require('fs');
const { getDirsByLevel } = require('../../utils/file');
const { findAllChineseText } = require('../../utils/findChineseText');
const { getProjectConfig } = require('../../utils/config');
const { replaceTargets } = require('./replaceText');

const CONFIG = getProjectConfig();

const replaceDir = async (dirPath, langFile) => {
  const translateTargets = findAllChineseText(dirPath);

  if (translateTargets.length === 0) {
    console.log(`${dirPath} 没有发现可替换的文案！`);
    return;
  }

  let langFilename = langFile;
  if (!langFilename) {
    const names = slash(dirPath).split('/');
    langFilename = _.camelCase(names[names.length - 1]);
  }
  replaceTargets('index', translateTargets);
};

const replaceDirs = async (dirs, langFile) => {
  for await (let dirPath of dirs) {
    if (dirPath && fs.statSync(dirPath).isDirectory()) {
      await replaceDir(dirPath, langFile);
      console.log(`${dirPath} 替换完成！`);
    } else {
      console.log(`${dirPath} 不存在！`);
    }
  }
};

const replaceAll = (dir, depth = '0', langFile) => {
  while (depth != undefined) {
    if (depth === '0') {
      replaceDir(dir, langFile);
      depth++;
    } else {
      const dirs = getDirsByLevel(dir, depth, undefined, CONFIG.ignoreDir);
      if (dirs.length) {
        replaceDirs(dirs, langFile);
        depth++;
      } else {
        depth = undefined;
      }
    }
  }
};

module.exports = { replaceAll };
