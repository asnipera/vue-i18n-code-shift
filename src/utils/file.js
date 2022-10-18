const path = require('path');
const fs = require('fs');

function getSpecifiedFiles(dir, ignoreDirectory = [], ignoreFile = []) {
  let subFiles
  try {
    subFiles = fs.readdirSync(dir)
  } catch {
    console.log(`${dir} 路径不存在，请先确认文件路径`);
    return []
  }
  return subFiles.reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    const isFile = fs.statSync(name).isFile();
    const notIgnoreDir = notIgnoreDirectory(
      ignoreDirectory,
      path.dirname(name).split('/')
    );

    if (isDirectory) {
      if (notIgnoreDir) {
        return files;
      }
      return files.concat(getSpecifiedFiles(name, ignoreDirectory, ignoreFile));
    }

    const notIgnoreFile =
      ignoreFile.length === 0 ||
      (ignoreFile.length &&
        ignoreFile.every((filename) => filename !== path.basename(name)));

    if (isFile && notIgnoreDir && notIgnoreFile) {
      return files.concat(name);
    }
    return files;
  }, []);
}

function notIgnoreDirectory(ignoreDirectory, names) {
  if (ignoreDirectory.length === 0) {
    return true;
  }
  return !ignoreDirectory.some((ignoreDir) => names.includes(ignoreDir));
}

function getDirsByLevel(
  dirPath,
  level = 1,
  currentLevel = 1,
  ignoreDirectory = []
) {
  let subFiles
  try {
    subFiles = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    console.log(`${dirPath} 路径不存在，请先确认文件路径`);
    return []
  }

  const currentDirs = subFiles
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        notIgnoreDirectory(
          ignoreDirectory,
          path.join(dirPath, dirent.name).split('/')
        )
    )
    .map((dirent) => dirent.name);
  if (currentLevel < level) {
    let res = [];
    currentDirs.forEach((file) => {
      let filepath = path.join(dirPath, file);
      res = [
        ...res,
        ...getDirsByLevel(filepath, level, currentLevel + 1, ignoreDirectory),
      ];
    });
    return res;
  }
  return currentDirs.map((dirname) => path.join(dirPath, dirname));
}

function readFile(filename) {
  if (fs.existsSync(filename)) {
    return fs.readFileSync(filename, 'utf-8');
  }
  return '';
}

function writeFile(filePath, file) {
  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file);
  }
}

module.exports = { getSpecifiedFiles, getDirsByLevel, readFile, writeFile };
