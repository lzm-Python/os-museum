const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

let systems = [];
let loadError = null;

const HALL_IDS = ['microsoft', 'apple', 'google', 'custom', 'china', 'linux', 'nokia', 'vintage'];

// 优先按展厅读取 data/systems/<hall>.json 合并；旧的单文件systems.json 作为回退。
function loadFromSplit() {
  const dir = path.join(__dirname, 'data', 'systems');
  if (!fs.existsSync(dir)) return null;
  const out = [];
  HALL_IDS.forEach(function (h) {
    const p = path.join(dir, h + '.json');
    if (fs.existsSync(p)) {
      const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
      out.push.apply(out, arr);
    }
  });
  return out.length ? out : null;
}

try {
  const split = loadFromSplit();
  if (split) {
    systems = split;
  } else {
    const dataPath = path.join(__dirname, 'data', 'systems.json');
    systems = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch (err) {
  loadError = String(err && err.message ? err.message : err);
  systems = [];
}

// 是否运行在 Electron 里 —— 前端用它做「双端判定」
contextBridge.exposeInMainWorld('museumHost', {
  isElectron: true,
  isPacked: !!process.env.MUSEUM_PACKED,
  platform: process.platform,
  version: '1.0.0',
  systems,
  loadError,
  dataPath: path.join(__dirname, 'data', 'systems')
});
