const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

let systems = [];
let loadError = null;

const dataPath = path.join(__dirname, 'data', 'systems.json');
try {
  systems = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
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
  dataPath
});
