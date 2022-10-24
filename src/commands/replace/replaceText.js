const _ = require('lodash');
const compiler = require('vue-template-compiler');
const ts = require('typescript');
const { getLangData } = require('../extract/getLangData');
const { getProjectConfig, getLangDir } = require('../../utils/config');
const { readFile, writeFile } = require('../../utils/file');
const { findMatchKey, formatText } = require('../../utils/common');
const { updateLangFileWithNewText } = require('../extract/updateLangFile');

const CONFIG = getProjectConfig();
const srcLangDir = getLangDir(CONFIG.srcLang);

function updateTargetFile({ filePath, texts, langObj, langFilename }) {
  const fileContent = readFile(filePath);
  let newFileContent = fileContent;
  const langFileNewTexts = [];
  const isVueFile = _.endsWith(filePath, '.vue');
  if (isVueFile) {
    const { template, script } = compiler.parseComponent(fileContent);
    const templateCode = template ? template.content : '';
    const jsCode = script ? script.content : '';

    texts.forEach((target) => {
      const {
        text,
        range: { start, end },
        isTemplate,
        isAttr,
        isInMustache,
        inInTemplateString
      } = target;
      if (text.includes('[') && text.includes(']')) {
        return;
      }
      const matchedKey = findMatchKey(langObj, formatText(text));
      let langFileText = text;
      if (!isAttr && !isInMustache) {
        let replaceText = `I18N.t('${langFilename}.${matchedKey}')`;
        let oldText = jsCode.slice(start, end);
        let left = jsCode.slice(start, start + 1);
        let right = jsCode.slice(end - 1, end);
        if (inInTemplateString) {
          replaceText = '${' + `I18N.t('${langFilename}.${matchedKey}')` + '}';
          left = jsCode.slice(start - 2, start - 1);
          right = jsCode.slice(end - 1, end);
          oldText = jsCode.slice(start - 2, end);
        }
        if (isTemplate) {
          replaceText = `{{ \$t('${langFilename}.${matchedKey}') }}`;
          // 未能追溯到字符偏差的原因，原作者代码暂时保留
          // left = templateCode.slice(start, start + 1);
          // right = templateCode.slice(end + 1, end + 2);
          // oldText = templateCode.slice(start, end + 2);
          left = templateCode.slice(start + 3, start + 4);
          right = templateCode.slice(end + 4, end + 5);
          oldText = templateCode.slice(start + 3, end + 5);
        }

        let newText = `${left}${replaceText}${right}`;
        if (!isTemplate && (left === '"' || left === "'")) {
          newText = `${replaceText}`;
        } else if (isTemplate && oldText.includes('{{')) {
          const old = templateCode.slice(start + 1, end + 1);
          oldText = old
            .replace(/\\n/g, '')
            .replace(/\s*/g, '')
            .replace(/{{/, '')
            .replace(/}}/, '');
          newText = ` \$t('${langFilename}.${matchedKey}') `;
        }

        if (matchedKey) {
          const escapedOldText = oldText.replaceAll(/[\[\]\{\}\(\)\\\^\$\.\|\?\*\+]/g, match => '\\' + match)
          newFileContent = newFileContent.replace(
            new RegExp(escapedOldText, 'g'),
            function (match, offset, string) {
              const beforeStr = string.slice(0, offset);
              if (isTemplate && beforeStr.includes('<script>')) {
                return oldText;
              }

              const htmlNotel = beforeStr.match(/<!--/g) ?? []
              const htmlNoter = beforeStr.match(/-->/g) ?? []
              if (isTemplate && htmlNotel.length !== htmlNoter.length) {
                return oldText;
              }

              return newText;
            }
          );
        }
      } else if (isAttr) {
        // 未能追溯到字符偏差的原因，原作者代码暂时保留
        // const oldAttr = templateCode.slice(start + 1, end + 1);
        const oldAttr = templateCode.slice(start + 4, end + 4);
        let replaceAttr = `\$t('${langFilename}.${matchedKey}')`;
        const [left] = oldAttr.match(/\s*/g);
        let newAttr = `${left}:${oldAttr.trim().replace(text, replaceAttr)}`;
        if (matchedKey) {
          newFileContent = newFileContent.replace(oldAttr, newAttr);
        }
      } else if (isInMustache) {
        const left = templateCode.slice(start + 3, start + 4);
        const right = templateCode.slice(end + 4, end + 5);
        const oldText = templateCode.slice(start + 3, end + 5);
        let replaceText = `\$t('${langFilename}.${matchedKey}')`;
        let newText = `${left}${replaceText}${right}`;
        if (left === '"' || left === "'") {
          newText = replaceText;
        }
        if (inInTemplateString) {
          newText = left + '${' + replaceText + '}' + right;
        }
        if (matchedKey) {
          newFileContent = newFileContent.replace(oldText, newText);
        }
      }
      if (text !== langFileText) {
        langFileNewTexts.push({ key: matchedKey, value: langFileText });
      }
    });
  } else {
    texts.forEach((target) => {
      const {
        text,
        range: { start, end },
      } = target;
      const matchedKey = findMatchKey(langObj, formatText(text));
      let langFileText = text;

      const replaceText = `I18N.t('${langFilename}.${matchedKey}')`;
      const oldText = fileContent.slice(start, end);
      const left = fileContent.slice(start, start + 1);
      const right = fileContent.slice(end - 1, end);

      let newText = `${left}${replaceText}${right}`;
      if (left === '"' || left === "'") {
        newText = `${replaceText}`;
      } else if (left === '`') {
        const varInStr = text.match(/(\$\{[^\}]+?\})/g);
        if (varInStr) {
          const kvPair = varInStr.map((str, index) => {
            return `val${index + 1}: ${str.replace(/^\${([^\}]+)\}$/, '$1')}`;
          });
          newText = `I18N.t('${langFilename}.${matchedKey}', { ${kvPair.join(
            ',\n'
          )} })`;

          varInStr.forEach((str, index) => {
            langFileText = langFileText.replace(str, `{val${index + 1}}`);
          });
        } else {
          newText = `${replaceText}`;
        }
      }
      if (matchedKey) {
        newFileContent = newFileContent.replace(oldText, newText);
      }

      if (text !== langFileText) {
        langFileNewTexts.push({ key: matchedKey, value: langFileText });
      }
    });
  }

  try {
    const targetFilename = `${srcLangDir}//${langFilename}.js`;
    updateLangFileWithNewText(targetFilename, langFileNewTexts);
    writeFile(filePath, newFileContent);

    const hasScriptTarget = texts.some((target) => !target.isTemplate);
    if (hasScriptTarget && !hasImportI18N(filePath)) {
      createImportI18N(filePath);
    }
  } catch (error) {
    console.log(error);
  }
}

function getJsCode(filePath) {
  const fileContent = readFile(filePath);
  const isVueFile = _.endsWith(filePath, '.vue');
  let code = fileContent;
  if (isVueFile) {
    const { script } = compiler.parseComponent(fileContent);
    code = script ? script.content : '';
  }

  return { code, isVueFile, fileContent };
}

function hasImportI18N(filePath) {
  const { code } = getJsCode(filePath);
  const ast = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX
  );
  let hasImport = false;

  function visit(node) {
    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      const importPath = node.moduleSpecifier.getText();

      if (importPath.includes(CONFIG.i18nPath)) {
        hasImport = true;
      }
    }
  }

  ts.forEachChild(ast, visit);

  return hasImport;
}

function createImportI18N(filePath) {
  const { code, isVueFile, fileContent } = getJsCode(filePath);
  const importStatement = `${CONFIG.importI18N}\n`;

  if (isVueFile) {
    const newContent = fileContent.replace(
      '<script>\n',
      `<script>\n${importStatement}`
    );
    writeFile(filePath, newContent);
  } else {
    const ast = ts.createSourceFile(
      '',
      code,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.TSX
    );
    const pos = ast.getStart(ast, false);
    const updateCode = code.slice(0, pos) + importStatement + code.slice(pos);
    writeFile(filePath, updateCode);
  }
}

function replaceTargets(langFilename, translateTargets) {
  const targetFilename = `${srcLangDir}/${langFilename}.js`;
  const langObj = getLangData(targetFilename);

  translateTargets.forEach(({ filePath, texts }) => {
    updateTargetFile({ filePath, texts, langObj, langFilename });
  });
}

module.exports = { replaceTargets };
