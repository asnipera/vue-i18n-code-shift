const fs = require('fs');
const path = require('path');

// 递归生成目录
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  }
  if (mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname);
    return true;
  }
}

module.exports = {
  mkdirsSync,
};
