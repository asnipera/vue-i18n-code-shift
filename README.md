# vue-i18n-auto-generate

### 一键完成整个项目中文文案的提取、替换、翻译、导入、导出

## 功能

- **一键提取并替换中文文案**
- **导出未翻译的文案**
- **导入翻译好的文案**

## 安装

```shellscript
npm install -g vue-i18n-auto-generate
```

## 使用

```js
viag init
//  cli为`viag`提供了一个简单好记的别名`i18n`
i18n init
```

### 示例

1. 在项目根目录（example/projectAfter）使用 `viag init` 命令初始化，生成配置文件（默认是 .vics 目录）
2. 使用 `viag one` 命令一键提取替换(也可以分步使用 `viag extract` 和 `viag replace` 命令)
3. 使用 `viag export en` 导出未翻译的文件，就可以送翻了
4. 使用 `viag sync` 暂时 mock 语料
5. 使用 `viag import en 翻译好的 xlsx 文件路径` 导入翻译好的语料

### 效果

- .vue 文件
  ![vue](https://github.com/jonjia/vue-i18n-code-shift/raw/main/assets/vue.png)
- .js 文件
  ![js](https://github.com/jonjia/vue-i18n-code-shift/raw/main/assets/js.png)

## 命令

```js
"bin": {
    "viag": "src/index.js",
    "vue-i18n-auto-translate": "src/index.js",
    "i18n": "src/index.js"
  },
```

初始化项目，生成配置文件 `vics-config.json`

```js
{
  // vics文件根目录，用于放置提取的langs文件
  vicsDir: './.vics',

  // 配置文件目录，若调整配置文件，此处可手动修改
  configFile: './.vics/vics-config.json',

  // 语言目录名，注意连线和下划线
  srcLang: 'zh-CN',
  distLangs: ['en-US'],
  langMap: {
    en_US: 'en_US',
    'en-US': 'en-US',
    en: 'en',
  },
  keyPrefix: '', // 如果设置了keyPrefix, 则生成的key为: `${keyPrefix}${index}`；否则通过百度翻译生成key
    // https://api.fanyi.baidu.com/doc/21, 通用翻译API接入文档
    baiduAppAPI: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
    baiduAppid: '20200602000482988',
    baiduKey: 'CF5_meZdDAOtDzVkn2Nv',
  // I18N import 语句，请按照自己项目情况配置
  importI18N: "import I18N from '@/i18n';",
  // import 语句后缀，用于判断是否已经引入过
  i18nPath: '@/i18n',

  // 可跳过的文件夹名或者文加名，比如docs、mock等
  ignoreDir: [],
  ignoreFile: [],

  // 导出未翻译的文案，Excel 列的配置
  exportColConfig: ['export_path', '业务线', 'business_key', '描述（字典值）', '语料类型', '最长字符', '首字母大写', '语料说明图', 'translatable', 'formatted', 'zh_CN','en_US',],
  // 导出未翻译的文案，业务线、key、文案在 Excel 中列的索引
  exportColIndexMap: {
    businessLine: 1,
    key: 3,
    text: 10,
  },
  // 导入翻译好的文案，key、文案在 Excel 中列的索引
  importColIndexMap: {
    key: 4,
    text: 12,
  },
  // 语料平台 xlsx 文件配置，列从 0 开始
  checkColIndexMap: {
    key: 3, // key 所在列
    'zh-CN': 11, // 中文所在列
    en: 12, // 英文所在列
  },
  // 语料文件 prettier 配置
  prettierConfig: {},
}
```

### `viag one`

**一键提取并替换**指定文件夹、指定层级（默认为 0）下的所有中文文案(包含子目录)，可以指定语料文件（默认为指定文件夹名字）

```shellscript
viag one [dirPath] [level] [langFilename]
```

### `viag extract`

**提取**指定文件夹、指定层级(默认为 0)下的所有中文文案(包含子目录)，可以指定语料文件（默认为指定文件夹名字）

```shellscript
viag extract [dirPath] [level] [langFilename]
```

### `viag replace`

**替换**指定文件夹、指定层级(默认为 0)下的所有中文文案(包含子目录)，可以指定语料文件（默认为指定文件夹名字）

```shellscript
viag replace [dirPath] [level] [langFilename]
```

### `viag sync`

**同步**各种语言的文案，使用百度翻译 **mock** 语料

```shellscript
viag sync
```

### `viag export`

**导出**未翻译的文案

```shellscript
# 导出指定语言的中文文案，lang取值为配置中distLangs值(lang 参数必填)，如 en 就是导出还未翻译成英文的中文文案。可以指定业务线和产物文件名
# 导出范围：range // 0 未翻译，2 全部
viag export [lang] [range] [businessLine] [outputFilename]
```

### `viag import`

将翻译好的文案，**导入**到项目中

```shellscript
# 导入送翻后的文案
viag import [lang] [filePath]
```

### `viag moveRules`

将 rules 从 data 移动到 computed，用来解决 rules 多语言不生效问题

```shellscript
# 将 rules 从 data 移动到 computed
viag moveRules [dir/file...]
```

### `viag check`

比较翻译平台管理的语料、代码中使用的语料之间的差异

```shellscript
# 校验对比语料
viag check [filePath]
```

语料平台 xlsx 文件配置，列从 0 开始，编辑 vics-config.json checkColIndexMap 字段

```shellscript
  checkColIndexMap: {
    key: 3, // key 所在列
    'zh-CN': 11, // 中文所在列
    en: 12, // 英文所在列
  }
```

## viag 解决了哪些问题

- 解决 vue 项目国际化过程中，中文文案手动替换费时费力问题
- 在翻译过程中，可以使用 viag 命令行自动提取未翻译中文词汇，导出成 Excel 方便与翻译同学协作。针对翻译同学还没有返回翻译文案的期间，可以使用 viag 的 sync 和 mock 功能，先临时翻译成对应语言，节省文案调整时间
- 国际化文案翻译完成后，可以使用 viag 的 import 命令，一键导入到项目文件内
- 比较翻译平台管理的语料、代码中使用的语料之间的差异，主要提供给测试同学使用

## Authors

- **[asnipera](https://github.com/asnipera)**
- Inspired by **[kiwi](https://github.com/alibaba/kiwi)**
- Inspired by **[jonjia/vue-i18n-code-shift](https://github.com/jonjia/vue-i18n-code-shift)**

## License

- MIT
