const CONFIG_FILE_NAME = 'vics-config.json';

const PROJECT_CONFIG = {
  dir: './.vics',
  configFile: `./.vics/${CONFIG_FILE_NAME}`,
  prettierConfig: {
    parser: 'typescript',
    trailingComma: 'all',
    singleQuote: true,
    tabWidth: 2,
  },
  defaultConfig: {
    vicsDir: './src/locale',
    configFile: `./.vics/${CONFIG_FILE_NAME}`,
    srcLang: 'zh-CN',
    distLangs: ['en-US'],
    langMap: {
      en_US: 'en_US',
      'en-US': 'en-US',
      en: 'en',
    },
    baiduAppid: '20200602000482988',
    baiduKey: 'CF5_meZdDAOtDzVkn2Nv',
    importI18N: `import I18N from '@/i18n';`,
    i18nPath: '@/i18n',
    ignoreDir: ['src/locale'],
    ignoreFile: [],
    exportColConfig: [
      'export_path',
      '业务线',
      'business_key',
      '描述（字典值）',
      '语料类型',
      '最长字符',
      '首字母大写',
      '语料说明图',
      'translatable',
      'formatted',
      'zh_CN',
      'en_US',
    ],
    exportColIndexMap: {
      businessLine: 1,
      key: 3,
      text: 10,
    },
    importColIndexMap: {
      key: 3,
      text: 11,
    },
    checkColIndexMap: {
      key: 3,
      'zh-CN': 11,
      en: 12,
    },
    prettierConfig: {},
  },
  zhIndexFile: `import common from './common';

export default {
  common
};`,
  zhTestFile: `export default {
  test: '测试'
};`,
};

module.exports = { CONFIG_FILE_NAME, PROJECT_CONFIG };
