const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const shotDir = path.join(__dirname, 'shots');
fs.mkdirSync(shotDir, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: true, width: 1440, height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: false,
      backgroundThrottling: false
    }
  });

  async function shot(name) {
    await sleep(350);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(shotDir, name + '.png'), img.toPNG());
  }

  async function back() {
    await win.webContents.executeJavaScript(`document.getElementById('btnBack').click();`, true);
    await sleep(500);
  }

  async function open(id, after) {
    await win.webContents.executeJavaScript(`(() => {
      const c = Array.from(document.querySelectorAll('.card')).find(x => x.dataset.id === '${id}');
      if (c) c.click();
    })()`, true);
    await sleep(1400);
    if (after) { await win.webContents.executeJavaScript(after, true); await sleep(500); }
  }

  await win.loadFile(path.join(__dirname, 'src', 'index.html'));
  await sleep(1400);
  await shot('01-lobby');

  await open('win10', `(() => { const b = document.querySelector('.bar .startbtn'); if (b) b.click(); })()`);
  await shot('02-win10-start');
  await back();

  await open('winxp');
  await shot('03-winxp');
  await back();

  await open('ios17');
  await shot('04-ios17');
  await back();

  await open('macos');
  await shot('05-macos');
  await back();

  await open('s60');
  await shot('06-nokia');
  await back();

  await open('msdos');
  await shot('07-dos');
  await back();

  await open('win95');
  await shot('08-win95');
  await back();

  await open('win10', `(() => { const i = document.querySelectorAll('.desk-icon')[0]; if (i) i.click(); })()`);
  await shot('09-win10-explorer');
  await back();

  console.log('shots done');
  app.quit();
});
